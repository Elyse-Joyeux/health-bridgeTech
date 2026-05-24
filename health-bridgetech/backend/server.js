import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUrl = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || 'healthbridge';
const jwtSecret = process.env.JWT_SECRET || 'healthbridge-secret';
const publicUrl = process.env.PUBLIC_URL || 'http://localhost:5173';

app.use(cors());
app.use(express.json());

let db;
let usersCollection;
let tracksCollection;
let mongoReady = false;

const memory = {
  users: [],
  tracks: [],
  activities: [],
  messages: [],
  notifications: [],
  devices: [],
};

const ASSESSMENT_QUESTIONS = {
  anxiety: [
    { id: 'anxiety-frequency', prompt: 'How often do anxious thoughts interrupt your day?', options: ['Rarely', 'Sometimes', 'Often'] },
    { id: 'anxiety-body', prompt: 'Where do you notice anxiety first?', options: ['Chest', 'Stomach', 'Thoughts', 'Breath'] },
  ],
  sleep: [
    { id: 'sleep-quality', prompt: 'How rested do you feel after sleep?', options: ['Rested', 'Mixed', 'Drained'] },
    { id: 'sleep-barrier', prompt: 'What gets in the way most?', options: ['Screens', 'Stress', 'Schedule', 'Noise'] },
  ],
  stress: [
    { id: 'stress-source', prompt: 'What is the main stress source lately?', options: ['School/work', 'Family', 'Health', 'Money'] },
    { id: 'stress-reset', prompt: 'Which reset feels easiest?', options: ['Breathing', 'Walk', 'Music', 'Journaling'] },
  ],
  focus: [
    { id: 'focus-window', prompt: 'When is focus hardest?', options: ['Morning', 'Afternoon', 'Evening', 'Always'] },
    { id: 'focus-style', prompt: 'What helps you focus?', options: ['Silence', 'Music', 'Timers', 'Body doubling'] },
  ],
  grief: [
    { id: 'grief-support', prompt: 'What kind of support feels useful?', options: ['Quiet space', 'Talking', 'Rituals', 'Resources'] },
  ],
  trauma: [
    { id: 'trauma-pace', prompt: 'What pace feels safest right now?', options: ['Very slow', 'Structured', 'Practical', 'Not sure'] },
  ],
};

const TRACKS = [
  {
    id: 'ocean',
    title: 'Ocean Grounding',
    mood: 'Calm',
    duration: '4:00',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop',
    artist: 'BridgeTech Wellness',
  },
  {
    id: 'binaural',
    title: 'Focus Flow',
    mood: 'Flow',
    duration: '3:30',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&h=400&fit=crop',
    artist: 'BridgeTech Wellness',
  },
  {
    id: 'evening',
    title: 'Evening Unwind',
    mood: 'Peaceful',
    duration: '4:30',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&h=400&fit=crop',
    artist: 'BridgeTech Wellness',
  },
];

function id() {
  return crypto.randomUUID();
}

function toObjectId(value) {
  return ObjectId.isValid(value) ? new ObjectId(value) : value;
}

function nowIso() {
  return new Date().toISOString();
}

function ageFrom(dateOfBirth) {
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

function xpForLevel(level) {
  return (level - 1) * 500;
}

function levelForXp(xp) {
  return Math.max(1, Math.floor(xp / 500) + 1);
}

function createToken(user) {
  const userId = user._id?.toString?.() || user.id;
  return jwt.sign({ id: userId }, jwtSecret, { expiresIn: '7d' });
}

function sanitizeUser(user) {
  const userId = user._id?.toString?.() || user.id;
  return {
    id: userId,
    email: user.email,
    fullName: user.fullName,
    displayName: user.displayName || user.fullName?.split(' ')[0] || 'Friend',
    dateOfBirth: user.dateOfBirth,
    isMinor: !!user.isMinor,
    parentConsent: user.parentConsent || { verifiedAt: null },
    problemAreas: user.problemAreas || [],
    level: user.level || levelForXp(user.xp || 0),
    xp: user.xp || 0,
    streak: user.streak || 0,
    longestStreak: user.longestStreak || 0,
    badges: user.badges || [],
    avatar: user.avatar,
    timezone: user.timezone || 'UTC',
    primaryGoal: user.primaryGoal || 'stress',
    createdAt: user.createdAt?.toISOString?.() || user.createdAt || nowIso(),
  };
}

function createUserDocument(input) {
  const user = {
    ...input,
    displayName: input.displayName || input.fullName.split(' ')[0],
    isMinor: ageFrom(input.dateOfBirth) < 18,
    parentConsent: input.parentConsent || { verifiedAt: null },
    problemAreas: input.problemAreas || [],
    level: 1,
    xp: 0,
    streak: 0,
    longestStreak: 0,
    badges: [],
    timezone: 'UTC',
    primaryGoal: 'stress',
    createdAt: new Date(),
  };
  return user;
}

function fallbackSeed() {
  if (!memory.tracks.length) memory.tracks = TRACKS;
  if (!memory.devices.length) {
    memory.devices = [
      {
        _id: id(),
        userId: 'demo',
        name: 'Bridge Band',
        type: 'bridge-band',
        paired: true,
        lastSync: nowIso(),
        battery: 82,
        serial: 'BB-2048',
        metrics: [
          { label: 'HRV', value: '72', unit: 'ms' },
          { label: 'Heart Rate', value: '66', unit: 'bpm' },
        ],
      },
      {
        _id: id(),
        userId: 'demo',
        name: 'Apple Watch',
        type: 'apple-watch',
        paired: false,
        battery: 55,
        metrics: [],
      },
    ];
  }
}

async function connectDb() {
  fallbackSeed();
  try {
    const client = new MongoClient(mongoUrl, { serverSelectionTimeoutMS: 2500 });
    await client.connect();
    db = client.db(dbName);
    usersCollection = db.collection('users');
    tracksCollection = db.collection('tracks');
    mongoReady = true;

    if ((await tracksCollection.countDocuments()) === 0) {
      await tracksCollection.insertMany(TRACKS);
    }
    console.log(`MongoDB connected at ${mongoUrl}/${dbName}`);
  } catch (err) {
    mongoReady = false;
    console.warn(`MongoDB unavailable; using in-memory dev data. ${err.message}`);
  }
}

async function findUserByEmail(email) {
  const normalized = email.toLowerCase();
  if (mongoReady) return usersCollection.findOne({ email: normalized });
  return memory.users.find((u) => u.email === normalized) || null;
}

async function findUserById(userId) {
  if (mongoReady) return usersCollection.findOne({ _id: toObjectId(userId) });
  return memory.users.find((u) => u.id === userId) || null;
}

async function insertUser(user) {
  user.email = user.email.toLowerCase();
  if (mongoReady) {
    const result = await usersCollection.insertOne(user);
    return usersCollection.findOne({ _id: result.insertedId });
  }
  const saved = { ...user, id: id(), createdAt: user.createdAt.toISOString() };
  memory.users.push(saved);
  return saved;
}

async function updateUser(userId, updates) {
  if (mongoReady) {
    await usersCollection.updateOne({ _id: toObjectId(userId) }, { $set: updates });
    return findUserById(userId);
  }
  const idx = memory.users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  memory.users[idx] = { ...memory.users[idx], ...updates };
  return memory.users[idx];
}

function defaultBiometric() {
  const t = Date.now() / 10000;
  return {
    recordedAt: nowIso(),
    hrv: Math.round(68 + Math.sin(t) * 8),
    heartRate: Math.round(66 + Math.cos(t) * 5),
    stressLevel: Math.round(32 + Math.sin(t / 2) * 12),
    sleepMinutes: 435,
    sleepScore: 84,
    steps: 6120,
  };
}

function userActivities(userId) {
  const items = memory.activities.filter((a) => a.userId === userId);
  if (items.length) return items;
  return [
    { _id: id(), userId, type: 'meditation', title: 'Morning Serenity Flow', durationMinutes: 12, xpEarned: 50, createdAt: nowIso() },
    { _id: id(), userId, type: 'breathwork', title: 'Box breathing reset', durationMinutes: 5, xpEarned: 20, createdAt: nowIso() },
  ];
}

function badgesFor(user) {
  const xp = user.xp || 0;
  const areas = user.problemAreas || [];
  return [
    { id: 'first-step', name: 'First Step', description: 'Completed your first check-in', icon: 'leaf', earned: xp > 0, progress: xp > 0 ? 'Earned' : 'Log one activity' },
    { id: 'steady-breath', name: 'Steady Breath', description: 'Completed a breathing exercise', icon: 'wind', earned: xp >= 20, progress: `${Math.min(xp, 20)}/20 XP` },
    { id: 'pathfinder', name: 'Pathfinder', description: 'Finished onboarding', icon: 'companion', earned: areas.length > 0, progress: areas.length ? 'Earned' : 'Pick focus areas' },
  ];
}

function authAnswer(prompt) {
  const normalized = prompt.toLowerCase();
  if (normalized.includes('anxiety') || normalized.includes('anxious') || normalized.includes('stress')) {
    return 'I hear the tension in that. Try one slow inhale for four counts, then an exhale for six. After two rounds, choose one tiny next step you can control.';
  }
  if (normalized.includes('sleep') || normalized.includes('tired')) {
    return 'Sleep trouble can make everything louder. Tonight, keep the routine simple: dim lights, put the phone away, and let your body repeat one calming cue.';
  }
  if (normalized.includes('focus')) {
    return 'Let us make focus smaller. Pick one task, set a ten minute timer, and stop when the timer ends. Momentum likes a clear doorway.';
  }
  return 'Thanks for sharing that with me. A gentle reset: name one feeling, one body sensation, and one supportive action you can take in the next five minutes.';
}

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing auth token' });
  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await findUserById(payload.id);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    req.userId = payload.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, fullName, displayName, dateOfBirth } = req.body;
  if (!email || !password || !fullName || !dateOfBirth) {
    return res.status(400).json({ error: 'Missing signup fields' });
  }
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  if (await findUserByEmail(email)) return res.status(400).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const savedUser = await insertUser(createUserDocument({ email, fullName, displayName, dateOfBirth, passwordHash }));
  const token = createToken(savedUser);
  return res.json({ token, user: sanitizeUser(savedUser), needsParentConsent: !!savedUser.isMinor });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing login credentials' });
  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid email or password' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
  return res.json({ token: createToken(user), user: sanitizeUser(user) });
});

app.post('/api/auth/google', async (req, res) => {
  const { email, fullName, avatar } = req.body;
  if (!email || !fullName) return res.status(400).json({ error: 'Missing Google profile fields' });
  let user = await findUserByEmail(email);
  if (!user) {
    user = await insertUser(createUserDocument({
      email,
      fullName,
      avatar,
      dateOfBirth: '2000-01-01',
      passwordHash: '',
      parentConsent: { verifiedAt: new Date() },
    }));
  }
  return res.json({ token: createToken(user), user: sanitizeUser(user) });
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
});

app.get('/api/auth/parent-consent/status', authenticate, async (req, res) => {
  const pc = req.user.parentConsent || {};
  return res.json({
    requested: !!pc.requestedAt,
    verified: !!pc.verifiedAt,
    parentEmail: pc.parentEmail,
    parentName: pc.parentName,
    verifyUrl: pc.token ? `${publicUrl}/parent-verify?token=${pc.token}` : undefined,
  });
});

app.post('/api/auth/parent-consent/request', authenticate, async (req, res) => {
  const { parentName, parentEmail, agree } = req.body;
  if (!agree || !parentName || !parentEmail) return res.status(400).json({ error: 'Missing parent consent details' });
  const token = id();
  await updateUser(req.userId, {
    parentConsent: { parentName, parentEmail, requestedAt: nowIso(), verifiedAt: null, token },
  });
  return res.json({ ok: true, parentEmail, verifyUrl: `${publicUrl}/parent-verify?token=${token}` });
});

app.post('/api/auth/parent-consent/resend', authenticate, async (req, res) => {
  const token = req.user.parentConsent?.token || id();
  await updateUser(req.userId, { parentConsent: { ...req.user.parentConsent, token, requestedAt: nowIso() } });
  return res.json({ verifyUrl: `${publicUrl}/parent-verify?token=${token}` });
});

app.get('/api/auth/parent-consent/details', async (req, res) => {
  const { token } = req.query;
  const users = mongoReady ? await usersCollection.find({ 'parentConsent.token': token }).toArray() : memory.users.filter((u) => u.parentConsent?.token === token);
  const user = users[0];
  if (!user) return res.status(404).json({ error: 'Consent request not found' });
  return res.json({
    childName: user.fullName,
    childDisplayName: user.displayName,
    childEmail: user.email,
    parentName: user.parentConsent?.parentName,
    parentEmail: user.parentConsent?.parentEmail,
    requestedAt: user.parentConsent?.requestedAt,
    verified: !!user.parentConsent?.verifiedAt,
  });
});

app.post('/api/auth/parent-consent/verify', async (req, res) => {
  const { token, agree } = req.body;
  if (!token || !agree) return res.status(400).json({ error: 'Missing verification details' });
  const users = mongoReady ? await usersCollection.find({ 'parentConsent.token': token }).toArray() : memory.users.filter((u) => u.parentConsent?.token === token);
  const user = users[0];
  if (!user) return res.status(404).json({ error: 'Consent request not found' });
  const userId = user._id?.toString?.() || user.id;
  await updateUser(userId, { parentConsent: { ...user.parentConsent, verifiedAt: nowIso() } });
  return res.json({ ok: true });
});

app.get('/api/onboarding/assessment', authenticate, async (req, res) => {
  return res.json({ areas: Object.keys(ASSESSMENT_QUESTIONS), questions: ASSESSMENT_QUESTIONS });
});

app.post('/api/onboarding/assessment', authenticate, async (req, res) => {
  const problemAreas = Array.isArray(req.body.problemAreas) ? req.body.problemAreas : [];
  if (!problemAreas.length) return res.status(400).json({ error: 'Choose at least one focus area' });
  const updated = await updateUser(req.userId, { problemAreas, assessmentAnswers: req.body.answers || {} });
  return res.json({ user: sanitizeUser(updated) });
});

app.get('/api/music', async (req, res) => {
  const tracks = mongoReady ? await tracksCollection.find({}).toArray() : memory.tracks;
  return res.json(tracks.map((track) => ({
    id: track.id,
    title: track.title,
    mood: track.mood || 'Calm',
    duration: track.duration || '4:00',
    url: track.url,
    cover: track.cover || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop',
  })));
});

app.get('/api/dashboard', authenticate, async (req, res) => {
  const user = sanitizeUser(req.user);
  const activities = userActivities(user.id);
  const level = user.level || 1;
  return res.json({
    user,
    biometrics: defaultBiometric(),
    activities,
    badges: badgesFor(user),
    stats: {
      totalActivities: activities.length,
      meditationCount: activities.filter((a) => a.type === 'meditation').length,
    },
    xpForCurrent: xpForLevel(level),
    xpForNext: xpForLevel(level + 1),
  });
});

app.post('/api/activities', authenticate, async (req, res) => {
  const durationMinutes = Number(req.body.durationMinutes || 5);
  const xpEarned = Math.max(10, durationMinutes * 4);
  const activity = {
    _id: id(),
    userId: req.userId,
    type: req.body.type || 'session',
    title: req.body.title || 'Wellness activity',
    durationMinutes,
    xpEarned,
    notes: req.body.notes,
    createdAt: nowIso(),
  };
  memory.activities.unshift(activity);
  const xp = (req.user.xp || 0) + xpEarned;
  const level = levelForXp(xp);
  const streak = Math.max(1, req.user.streak || 1);
  const updated = await updateUser(req.userId, { xp, level, streak, longestStreak: Math.max(streak, req.user.longestStreak || 0) });
  return res.json({ activity, user: sanitizeUser(updated) });
});

app.get('/api/companion/messages', authenticate, async (req, res) => {
  return res.json(memory.messages.filter((m) => m.userId === req.userId));
});

app.post('/api/companion/messages', authenticate, async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ error: 'Message cannot be empty' });
  const userMessage = { _id: id(), userId: req.userId, role: 'user', text, createdAt: nowIso() };
  const aiMessage = { _id: id(), userId: req.userId, role: 'ai', text: authAnswer(text), createdAt: nowIso() };
  memory.messages.push(userMessage, aiMessage);
  return res.json(aiMessage);
});

app.get('/api/notifications', authenticate, async (req, res) => {
  const existing = memory.notifications.filter((n) => n.userId === req.userId);
  if (existing.length) return res.json(existing);
  const defaults = [
    { _id: id(), userId: req.userId, title: 'Morning check-in', body: 'Take a moment to log how you feel today.', type: 'reminder', read: false, createdAt: nowIso() },
    { _id: id(), userId: req.userId, title: 'New insight', body: 'Your HRV trend looks steady this week.', type: 'insight', read: false, createdAt: nowIso() },
  ];
  memory.notifications.push(...defaults);
  return res.json(defaults);
});

app.post('/api/notifications/read-all', authenticate, async (req, res) => {
  memory.notifications = memory.notifications.map((n) => n.userId === req.userId ? { ...n, read: true } : n);
  return res.json({ ok: true });
});

app.get('/api/devices', authenticate, async (req, res) => {
  return res.json(memory.devices.map((d) => ({ ...d, userId: req.userId })));
});

app.get('/api/devices/:id', authenticate, async (req, res) => {
  const device = memory.devices.find((d) => d._id === req.params.id);
  if (!device) return res.status(404).json({ error: 'Device not found' });
  const history = Array.from({ length: 8 }).map((_, i) => ({
    at: new Date(Date.now() - i * 30 * 60 * 1000).toISOString(),
    hrv: 64 + i,
    hr: 68 - (i % 4),
  }));
  return res.json({ device: { ...device, userId: req.userId }, history });
});

app.post('/api/devices/:id/sync', authenticate, async (req, res) => {
  const device = memory.devices.find((d) => d._id === req.params.id);
  if (!device) return res.status(404).json({ error: 'Device not found' });
  device.lastSync = nowIso();
  device.battery = Math.max(10, (device.battery || 80) - 1);
  return res.json({ ...device, userId: req.userId });
});

app.patch('/api/profile', authenticate, async (req, res) => {
  const allowed = ['fullName', 'displayName', 'timezone', 'primaryGoal'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const updated = await updateUser(req.userId, updates);
  return res.json({ user: sanitizeUser(updated) });
});

app.get('/api/biometrics/stream', authenticate, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const send = () => res.write(`data: ${JSON.stringify(defaultBiometric())}\n\n`);
  send();
  const timer = setInterval(send, 3000);
  req.on('close', () => clearInterval(timer));
});

app.post('/api/ai', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
  return res.json({ response: authAnswer(prompt) });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

connectDb().then(() => {
  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
});
