import type { Express, Request, Response } from 'express';
import express from 'express';
import { User, Device, Biometric, Activity, Message, Notification } from './models.js';
import { signToken, hashPassword, comparePassword, requireAuth, ageFromDob } from './auth.js';
import { BADGES, BadgeStats, computeLevel, xpForLevel } from './badges.js';
import { ASSESSMENT_QUESTIONS, MUSIC_TRACKS, companionReply } from './seed-data.js';

type AuthedReq = Request & { user?: any };

/** Compute current badge stats for a user */
async function statsFor(userId: string): Promise<BadgeStats> {
  const acts = await Activity.find({ userId });
  const user = await User.findById(userId);
  return {
    totalActivities: acts.length,
    meditationCount: acts.filter((a) => a.type === 'meditation').length,
    breathworkCount: acts.filter((a) => a.type === 'breathwork').length,
    journalCount: acts.filter((a) => a.type === 'journal').length,
    therapyCount: acts.filter((a) => a.type === 'therapy').length,
    streak: user?.streak || 0,
    longestStreak: user?.longestStreak || 0,
    totalXp: user?.xp || 0,
    level: user?.level || 1,
  };
}

/** Recalculate badges, level, and streak based on latest stats */
async function recompute(userId: string): Promise<void> {
  const user = await User.findById(userId);
  if (!user) return;
  user.level = computeLevel(user.xp);
  const stats = await statsFor(userId);
  const newly: string[] = [];
  for (const b of BADGES) {
    if (!user.badges.includes(b.id) && b.criteria(stats)) {
      user.badges.push(b.id);
      user.xp += b.reward;
      newly.push(b.name);
    }
  }
  user.level = computeLevel(user.xp);
  await user.save();
  for (const name of newly) {
    await Notification.create({
      userId,
      title: 'Badge unlocked',
      body: `You earned the "${name}" badge!`,
      type: 'achievement',
    });
  }
}

/** Generate a fresh synthetic biometric reading (used for real-time stream) */
function generateReading(prev?: { hrv: number; heartRate: number; stressLevel: number }) {
  const drift = (v: number, range: number) => Math.max(1, v + (Math.random() - 0.5) * range);
  return {
    hrv: Math.round(drift(prev?.hrv ?? 72, 6)),
    heartRate: Math.round(drift(prev?.heartRate ?? 66, 4)),
    stressLevel: Math.round(drift(prev?.stressLevel ?? 28, 8)),
    sleepMinutes: 460,
    sleepScore: 89,
    steps: 8432 + Math.floor(Math.random() * 20),
  };
}

/** Register all REST routes onto an Express app */
export function registerRoutes(app: Express): void {
  app.use(express.json({ limit: '2mb' }));

  // ── AUTH ──────────────────────────────────────────────────────────────────
  app.post('/api/auth/signup', async (req: Request, res: Response) => {
    try {
      const { email, password, fullName, displayName, dateOfBirth } = req.body || {};
      if (!email || !password || !dateOfBirth || !fullName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(409).json({ error: 'Email already registered' });
      const passwordHash = await hashPassword(password);
      const isMinor = ageFromDob(dateOfBirth) < 18;
      const user = await User.create({
        email,
        passwordHash,
        fullName,
        displayName: displayName || fullName.split(' ')[0],
        dateOfBirth,
        isMinor,
        xp: 0,
        level: 1,
      });
      // seed a default Apple Watch device
      await Device.create({
        userId: user.id,
        name: 'Apple Watch Series 9',
        type: 'apple-watch',
        lastSync: new Date(),
        battery: 82,
        metrics: [
          { label: 'HRV', value: '72', unit: 'ms' },
          { label: 'Heart Rate', value: '66', unit: 'bpm' },
          { label: 'Steps', value: '8,432' },
        ],
      });
      const token = signToken(user.id);
      res.json({ token, user: publicUser(user), needsParentConsent: isMinor });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user.id);
    res.json({
      token,
      user: publicUser(user),
      needsParentConsent: user.isMinor && !user.parentConsent?.verifiedAt,
      needsAssessment: !user.problemAreas || user.problemAreas.length === 0,
    });
  });

  app.get('/api/auth/me', requireAuth, async (req: AuthedReq, res: Response) => {
    res.json({ user: publicUser(req.user) });
  });

  // Mock Google OAuth — in production this would verify a Google ID token via
  // google-auth-library. Here we accept a profile from the client and either
  // create or log in the user.
  app.post('/api/auth/google', async (req: Request, res: Response) => {
    try {
      const { email, fullName, avatar } = req.body || {};
      if (!email || !fullName) return res.status(400).json({ error: 'Missing Google profile' });
      let user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        user = await User.create({
          email,
          passwordHash: await hashPassword(`google-${Date.now()}`),
          fullName,
          displayName: fullName.split(' ')[0],
          dateOfBirth: '1990-01-01',
          isMinor: false,
          avatar,
          xp: 0,
          level: 1,
        });
        await Device.create({
          userId: user.id,
          name: 'Apple Watch Series 9',
          type: 'apple-watch',
          lastSync: new Date(),
          battery: 82,
          metrics: [],
        });
      }
      const token = signToken(user.id);
      res.json({
        token,
        user: publicUser(user),
        needsParentConsent: false,
        needsAssessment: !user.problemAreas || user.problemAreas.length === 0,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/parent-consent/request', requireAuth, async (req: AuthedReq, res: Response) => {
    const { parentName, parentEmail, agree } = req.body || {};
    if (!agree || !parentName || !parentEmail) {
      return res.status(400).json({ error: 'Please complete all consent details.' });
    }
    const parent = String(parentEmail).trim().toLowerCase();
    if (parent === String(req.user.email).toLowerCase()) {
      return res.status(400).json({
        error: "Parent's email cannot be the same as your account email.",
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parent)) {
      return res.status(400).json({ error: 'Please enter a valid parent email.' });
    }
    const token =
      Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 12);
    req.user.parentConsent = {
      parentName,
      parentEmail: parent,
      requestedAt: new Date(),
      token,
    };
    await req.user.save();
    // In production this would call SMTP / SendGrid. Here we log + return the link
    // so the front-end can show it for testing.
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host;
    const verifyUrl = `${proto}://${host}/parent-verify?token=${token}`;
    console.log(
      `[bridgetech] Parent consent requested. To: ${parent} \u2014 verify URL: ${verifyUrl}`,
    );
    res.json({ ok: true, parentEmail: parent, verifyUrl });
  });

  app.get('/api/auth/parent-consent/status', requireAuth, async (req: AuthedReq, res: Response) => {
    const pc = req.user.parentConsent;
    let verifyUrl: string | undefined;
    if (pc?.token && !pc?.verifiedAt) {
      const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
      const host = (req.headers['x-forwarded-host'] as string) || req.headers.host;
      verifyUrl = `${proto}://${host}/parent-verify?token=${pc.token}`;
    }
    res.json({
      requested: !!pc?.requestedAt,
      verified: !!pc?.verifiedAt,
      parentEmail: pc?.parentEmail,
      parentName: pc?.parentName,
      verifyUrl,
    });
  });

  app.post('/api/auth/parent-consent/resend', requireAuth, async (req: AuthedReq, res: Response) => {
    const pc = req.user.parentConsent;
    if (!pc?.parentEmail) {
      return res.status(400).json({ error: 'No consent request on file.' });
    }
    pc.requestedAt = new Date();
    await req.user.save();
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host;
    const verifyUrl = `${proto}://${host}/parent-verify?token=${pc.token}`;
    console.log(`[bridgetech] Parent consent resent to: ${pc.parentEmail}`);
    res.json({ ok: true, verifyUrl });
  });

  // Public: returns the consent request details so the parent can review them
  // before approving. Does not expose anything sensitive beyond what was already
  // present in the email.
  app.get('/api/auth/parent-consent/details', async (req: Request, res: Response) => {
    const token = String(req.query.token || '');
    if (!token) return res.status(400).json({ error: 'Missing token.' });
    const user = await User.findOne({ 'parentConsent.token': token });
    if (!user) return res.status(404).json({ error: 'Invalid or expired link.' });
    res.json({
      childName: user.fullName,
      childDisplayName: user.displayName,
      childEmail: user.email,
      parentName: user.parentConsent?.parentName,
      parentEmail: user.parentConsent?.parentEmail,
      requestedAt: user.parentConsent?.requestedAt,
      verified: !!user.parentConsent?.verifiedAt,
    });
  });

  app.post('/api/auth/parent-consent/verify', async (req: Request, res: Response) => {
    const { token, agree } = req.body || {};
    if (!token) return res.status(400).json({ error: 'Missing token.' });
    if (!agree) {
      return res.status(400).json({
        error: 'You must check the consent box to approve.',
      });
    }
    const user = await User.findOne({ 'parentConsent.token': token });
    if (!user) return res.status(404).json({ error: 'Invalid or expired link.' });
    if (!user.parentConsent?.verifiedAt) {
      user.parentConsent!.verifiedAt = new Date();
      await user.save();
    }
    res.json({
      ok: true,
      verifiedAt: user.parentConsent?.verifiedAt,
      childName: user.fullName,
    });
  });

  app.get('/api/onboarding/assessment', requireAuth, (_req: Request, res: Response) => {
    res.json({ areas: Object.keys(ASSESSMENT_QUESTIONS), questions: ASSESSMENT_QUESTIONS });
  });

  app.post('/api/onboarding/assessment', requireAuth, async (req: AuthedReq, res: Response) => {
    const { problemAreas, answers } = req.body || {};
    req.user.problemAreas = problemAreas || [];
    req.user.assessmentAnswers = answers || {};
    req.user.xp = (req.user.xp || 0) + 50;
    req.user.level = computeLevel(req.user.xp);
    await req.user.save();
    await Notification.create({
      userId: req.user.id,
      title: 'Welcome onboard',
      body: 'Your sanctuary is now tailored to your problem areas.',
      type: 'insight',
    });
    res.json({ user: publicUser(req.user) });
  });

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  app.get('/api/dashboard', requireAuth, async (req: AuthedReq, res: Response) => {
    const userId = req.user.id;
    const latest = await Biometric.findOne({ userId }).sort({ recordedAt: -1 });
    const acts = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(10);
    const stats = await statsFor(userId);
    const badges = BADGES.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      icon: b.icon,
      earned: req.user.badges.includes(b.id),
      progress: b.progress(stats),
    }));
    res.json({
      user: publicUser(req.user),
      biometrics: latest || generateReading(),
      activities: acts,
      badges,
      stats,
      xpForNext: xpForLevel(req.user.level + 1),
      xpForCurrent: xpForLevel(req.user.level),
    });
  });

  // ── BIOMETRICS ────────────────────────────────────────────────────────────
  app.get('/api/biometrics/latest', requireAuth, async (req: AuthedReq, res: Response) => {
    const latest = await Biometric.findOne({ userId: req.user.id }).sort({ recordedAt: -1 });
    res.json(latest || generateReading());
  });

  app.get('/api/biometrics/history', requireAuth, async (req: AuthedReq, res: Response) => {
    const items = await Biometric.find({ userId: req.user.id })
      .sort({ recordedAt: -1 })
      .limit(168); // 7 days hourly
    res.json(items.reverse());
  });

  /** Server-Sent Events stream of live biometric readings */
  app.get('/api/biometrics/stream', requireAuth, async (req: AuthedReq, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();
    let last = (await Biometric.findOne({ userId: req.user.id }).sort({ recordedAt: -1 })) || generateReading();
    const tick = async () => {
      const reading = generateReading(last as any);
      last = reading as any;
      try {
        await Biometric.create({ userId: req.user.id, recordedAt: new Date(), ...reading });
      } catch {
        /* ignore in fallback mode */
      }
      res.write(`data: ${JSON.stringify({ recordedAt: new Date(), ...reading })}\n\n`);
    };
    await tick();
    const interval = setInterval(tick, 3000);
    req.on('close', () => clearInterval(interval));
  });

  // ── ACTIVITIES (sessions / check-ins) ─────────────────────────────────────
  app.post('/api/activities', requireAuth, async (req: AuthedReq, res: Response) => {
    const { type, title, durationMinutes, notes } = req.body || {};
    const xpMap: Record<string, number> = {
      meditation: 50,
      breathwork: 30,
      journal: 40,
      therapy: 200,
      'check-in': 20,
      session: 100,
    };
    const xpEarned = xpMap[type] || 20;
    const act = await Activity.create({
      userId: req.user.id,
      type,
      title,
      durationMinutes: durationMinutes || 0,
      xpEarned,
      notes,
    });
    req.user.xp = (req.user.xp || 0) + xpEarned;
    // streak tracking
    const today = new Date().toDateString();
    const last = req.user.lastCheckIn ? new Date(req.user.lastCheckIn).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (last === today) {
      // already counted today
    } else if (last === yesterday) {
      req.user.streak = (req.user.streak || 0) + 1;
    } else {
      req.user.streak = 1;
    }
    req.user.longestStreak = Math.max(req.user.longestStreak || 0, req.user.streak);
    req.user.lastCheckIn = new Date();
    req.user.level = computeLevel(req.user.xp);
    await req.user.save();
    await recompute(req.user.id);
    const fresh = await User.findById(req.user.id);
    res.json({ activity: act, user: publicUser(fresh) });
  });

  app.get('/api/activities', requireAuth, async (req: AuthedReq, res: Response) => {
    const items = await Activity.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json(items);
  });

  // ── DEVICES ───────────────────────────────────────────────────────────────
  app.get('/api/devices', requireAuth, async (req: AuthedReq, res: Response) => {
    const items = await Device.find({ userId: req.user.id });
    res.json(items);
  });

  app.get('/api/devices/:id', requireAuth, async (req: AuthedReq, res: Response) => {
    const d = await Device.findOne({ _id: req.params.id, userId: req.user.id });
    if (!d) return res.status(404).json({ error: 'Not found' });
    // synthesize a richer recent-history view
    const history = Array.from({ length: 12 }).map((_, i) => ({
      at: new Date(Date.now() - (12 - i) * 3600000),
      hrv: 60 + Math.round(Math.random() * 18),
      hr: 60 + Math.round(Math.random() * 12),
    }));
    res.json({ device: d, history });
  });

  app.post('/api/devices/:id/sync', requireAuth, async (req: AuthedReq, res: Response) => {
    const d = await Device.findOne({ _id: req.params.id, userId: req.user.id });
    if (!d) return res.status(404).json({ error: 'Not found' });
    d.lastSync = new Date();
    d.battery = Math.min(100, (d.battery || 80) + 2);
    await d.save();
    res.json(d);
  });

  app.post('/api/devices', requireAuth, async (req: AuthedReq, res: Response) => {
    const { name, type } = req.body || {};
    const d = await Device.create({
      userId: req.user.id,
      name,
      type,
      lastSync: new Date(),
      battery: 95,
      metrics: [],
    });
    res.json(d);
  });

  // ── AI COMPANION ──────────────────────────────────────────────────────────
  app.get('/api/companion/messages', requireAuth, async (req: AuthedReq, res: Response) => {
    const items = await Message.find({ userId: req.user.id }).sort({ createdAt: 1 }).limit(80);
    res.json(items);
  });

  app.post('/api/companion/messages', requireAuth, async (req: AuthedReq, res: Response) => {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'text required' });
    await Message.create({ userId: req.user.id, role: 'user', text });
    const reply = companionReply(text);
    const aiMsg = await Message.create({ userId: req.user.id, role: 'ai', text: reply });
    res.json(aiMsg);
  });

  // ── MUSIC ─────────────────────────────────────────────────────────────────
  app.get('/api/music', (_req: Request, res: Response) => {
    res.json(MUSIC_TRACKS);
  });

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
  app.get('/api/notifications', requireAuth, async (req: AuthedReq, res: Response) => {
    const items = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(30);
    res.json(items);
  });

  app.post('/api/notifications/read-all', requireAuth, async (req: AuthedReq, res: Response) => {
    await Notification.updateMany({ userId: req.user.id, read: false }, { $set: { read: true } });
    res.json({ ok: true });
  });

  // ── PROFILE / SETTINGS ────────────────────────────────────────────────────
  app.patch('/api/profile', requireAuth, async (req: AuthedReq, res: Response) => {
    const updatable = ['displayName', 'fullName', 'timezone', 'primaryGoal', 'avatar'];
    for (const k of updatable) {
      if (req.body[k] !== undefined) (req.user as any)[k] = req.body[k];
    }
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  });
}

/** Shape the user safe to send to the client */
function publicUser(u: any) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    fullName: u.fullName,
    dateOfBirth: u.dateOfBirth,
    isMinor: u.isMinor,
    parentConsent: u.parentConsent,
    problemAreas: u.problemAreas,
    level: u.level,
    xp: u.xp,
    streak: u.streak,
    longestStreak: u.longestStreak,
    badges: u.badges,
    avatar: u.avatar,
    timezone: u.timezone,
    primaryGoal: u.primaryGoal,
    createdAt: u.createdAt,
  };
}
