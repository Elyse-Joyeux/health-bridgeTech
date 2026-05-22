import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './dashboard.module.css';
import { Topbar } from '../shell/topbar.js';
import { api, streamSSE } from '../api/client.js';
import { useAuth } from '../api/auth-context.js';
import { useMusic } from '../api/music-context.js';
import type { Activity, Badge, Biometric, User } from '../api/types.js';
import {
  LeafIcon, BoltIcon, CloudIcon, WaveIcon, SparkleIcon, ChatIcon, MeditationIcon,
  MoonIcon, TrophyIcon, PlayIcon, HeartIcon, WindIcon, AwardIcon, StarIcon,
  CompanionIcon, LockIcon, EditIcon,
} from '../components/icons.js';

const ICON_MAP: Record<string, typeof LeafIcon> = {
  leaf: LeafIcon, meditation: MeditationIcon, moon: MoonIcon, heart: HeartIcon,
  wind: WindIcon, edit: EditIcon, companion: CompanionIcon, trophy: TrophyIcon,
  award: AwardIcon, star: StarIcon,
};

const MOODS = [
  { label: 'Calm', Icon: LeafIcon },
  { label: 'Energized', Icon: BoltIcon },
  { label: 'Pensive', Icon: CloudIcon },
  { label: 'Flow', Icon: WaveIcon },
];

type DashboardData = {
  user: User;
  biometrics: Biometric;
  activities: Activity[];
  badges: Badge[];
  stats: { totalActivities: number; meditationCount: number };
  xpForNext: number;
  xpForCurrent: number;
};

/** Dashboard with live biometrics streaming from MongoDB-backed service */
export function DashboardPage() {
  const { user, setUser } = useAuth();
  const { tracks, play } = useMusic();
  const [data, setData] = useState<DashboardData | null>(null);
  const [live, setLive] = useState<Biometric | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [pulseHistory, setPulseHistory] = useState<number[]>([]);

  useEffect(() => {
    api<DashboardData>('/api/dashboard').then(setData).catch(() => undefined);
  }, [user?.xp, user?.level]);

  useEffect(() => streamSSE('/api/biometrics/stream', (p: Biometric) => {
    setLive(p);
    setPulseHistory((h) => [...h.slice(-19), p.hrv]);
  }), []);

  const logMood = async (label: string) => {
    setMood(label);
    try {
      const res = await api<{ user: User }>('/api/activities', {
        method: 'POST',
        body: JSON.stringify({ type: 'check-in', title: `Morning mood: ${label}`, durationMinutes: 1 }),
      });
      setUser(res.user);
    } catch {/* ignore */}
  };

  const startMusic = () => {
    const flow = tracks.find((t) => t.id === 'binaural') || tracks[0];
    if (flow) play(flow);
  };

  if (!data) {
    return (
      <>
        <Topbar title="Dashboard" tabs={[{ label: 'Overview', active: true }, { label: 'Therapy', to: '/therapy' }, { label: 'Metrics', to: '/activity' }, { label: 'Community', to: '/community' }]} showXp showCta showBell />
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--hb-text-muted)' }}>Loading your sanctuary…</div>
      </>
    );
  }

  const u = data.user;
  const xpInLevel = u.xp - data.xpForCurrent;
  const xpRange = Math.max(1, data.xpForNext - data.xpForCurrent);
  const xpPct = Math.min(100, Math.max(0, (xpInLevel / xpRange) * 100));
  const reading = live || data.biometrics;
  const earnedBadges = data.badges.filter((b) => b.earned).slice(0, 3);
  const lockedFill = data.badges.filter((b) => !b.earned).slice(0, 3 - earnedBadges.length);

  return (
    <>
      <Topbar
        title="Dashboard"
        tabs={[
          { label: 'Overview', active: true },
          { label: 'Therapy', to: '/therapy' },
          { label: 'Metrics', to: '/activity' },
          { label: 'Community', to: '/community' },
        ]}
        showXp
        showCta
        ctaLabel="Start Session"
        ctaTo="/meditation"
      />

      <div className={styles.page}>
        <section className={styles.heroRow}>
          <div className={styles.heroCard}>
            <div className={styles.heroHead}>
              <div>
                <h1 className={styles.heroTitle}>Good morning, {u.displayName.split(' ')[0]}.</h1>
                <p className={styles.heroSubtitle}>
                  Your HRV is <strong>{reading.hrv} ms</strong> &middot; stress reads
                  &nbsp;<strong>{reading.stressLevel < 35 ? 'low' : reading.stressLevel < 60 ? 'moderate' : 'elevated'}</strong>. How are you feeling?
                </p>
              </div>
              <div className={styles.streak}>
                <span className={styles.streakLabel}>DAILY STREAK &middot; {u.streak}d</span>
                <div className={styles.streakDots}>
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <span key={i} className={`${styles.streakDot} ${i <= Math.min(7, u.streak) ? styles.streakDotOn : ''}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.moodRow}>
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  type="button"
                  className={`${styles.moodPill} ${mood === m.label ? styles.moodActive : ''}`}
                  onClick={() => logMood(m.label)}
                >
                  <span className={styles.moodIcon}><m.Icon size={26} /></span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Link to="/companion" className={styles.aiCard} style={{ textDecoration: 'none' }}>
            <span className={styles.aiTag}><SparkleIcon size={12} /> AI Assistant</span>
            <h2 className={styles.aiTitle}>Need a moment to talk?</h2>
            <p className={styles.aiBody}>Earn +20 XP for your morning check-in</p>
            <div className={styles.aiCta}>
              <span className={styles.aiCtaIcon}><ChatIcon size={18} /></span>
              <span>Tap to start conversation</span>
            </div>
          </Link>
        </section>

        <section className={styles.row}>
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div className={styles.cardTitle}>Your Journey</div>
              <div className={styles.levelTag}>LEVEL {u.level}</div>
            </div>
            <div className={styles.xpRow}>
              <span>XP Progress</span>
              <span>{xpInLevel} / {xpRange}</span>
            </div>
            <div className={styles.xpBar}><div className={styles.xpFill} style={{ width: `${xpPct}%` }} /></div>

            <div className={styles.badges}>
              <div className={styles.badgesLabel}>RECENT BADGES</div>
              <div className={styles.badgeRow}>
                {earnedBadges.length === 0 && (
                  <span style={{ fontSize: 12, color: 'var(--hb-text-muted)' }}>Complete sessions to start earning.</span>
                )}
                {earnedBadges.map((b) => {
                  const Icon = ICON_MAP[b.icon] || AwardIcon;
                  return <span key={b.id} className={styles.badge} title={b.description}><Icon size={22} /></span>;
                })}
                {lockedFill.map((b) => (
                  <span key={b.id} className={`${styles.badge} ${styles.badgeLocked}`} title={b.progress}>
                    <LockIcon size={18} />
                  </span>
                ))}
              </div>
              <Link to="/profile" className={styles.viewMore}>View all rewards &rarr;</Link>
            </div>
          </div>

          <div className={styles.cardPlain}>
            <div className={styles.cardHead}>
              <div>
                <div className={styles.cardTitle}>Live Biometrics</div>
                <div className={styles.cardSub}>Streaming from your connected wearables</div>
              </div>
              <div className={styles.tabBtns}>
                <span className={`${styles.tabBtn} ${styles.tabBtnActive}`}>LIVE</span>
                <Link to="/activity" className={styles.tabBtn} style={{ textDecoration: 'none' }}>HISTORY</Link>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
              <LiveMetric label="HRV" value={`${reading.hrv}`} unit="ms" color="var(--hb-primary)" />
              <LiveMetric label="HEART RATE" value={`${reading.heartRate}`} unit="bpm" color="var(--hb-accent)" />
              <LiveMetric label="STRESS" value={`${reading.stressLevel}`} unit="%" color="var(--hb-mint)" />
            </div>

            <div style={{ marginTop: 20, height: 70 }}>
              <svg viewBox="0 0 400 70" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="pulseG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--hb-accent)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--hb-accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {(() => {
                  const pts = pulseHistory.length ? pulseHistory : [70, 72, 68, 74, 71];
                  const w = 400;
                  const step = w / Math.max(1, pts.length - 1);
                  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${60 - ((p - 50) / 40) * 50}`).join(' ');
                  return (
                    <>
                      <path d={`${path} L ${w} 70 L 0 70 Z`} fill="url(#pulseG)" />
                      <path d={path} fill="none" stroke="var(--hb-accent)" strokeWidth={2} />
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        </section>

        <section className={styles.bottomRow}>
          <div className={styles.eventCard}>
            <div className={styles.eventHead}>
              <span className={styles.eventTag}>RECENT ACTIVITY</span>
              <Link to="/activity" style={{ fontSize: 11, color: 'var(--hb-primary)', fontWeight: 600 }}>View all</Link>
            </div>
            {data.activities.slice(0, 4).map((a) => (
              <div key={a._id} className={styles.eventPerson}>
                <span className={styles.personAvatar} style={{ background: 'var(--hb-mint-pale)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--hb-primary)' }}>
                  {a.type === 'meditation' && <MeditationIcon size={16} />}
                  {a.type === 'breathwork' && <WindIcon size={16} />}
                  {a.type === 'journal' && <EditIcon size={16} />}
                  {a.type === 'therapy' && <HeartIcon size={16} />}
                  {a.type === 'check-in' && <LeafIcon size={16} />}
                  {a.type === 'session' && <StarIcon size={16} />}
                </span>
                <div style={{ flex: 1 }}>
                  <div className={styles.personName}>{a.title}</div>
                  <div className={styles.personRole}>
                    {new Date(a.createdAt).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--hb-accent)', fontWeight: 600 }}>+{a.xpEarned} XP</span>
              </div>
            ))}
            {data.activities.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--hb-text-muted)', padding: 12 }}>
                No activities yet &mdash; log a mood above to start your streak.
              </div>
            )}
          </div>

          <button type="button" className={styles.focusCard} onClick={startMusic}>
            <div className={styles.focusBg} />
            <div className={styles.focusOverlay} />
            <div className={styles.focusBody}>
              <div className={styles.focusEyebrowRow}>
                <span className={styles.focusEyebrow}>TODAY'S FOCUS</span>
                <span className={styles.focusXpChip}>Earn 50 XP</span>
              </div>
              <div className={styles.focusTitle}>Morning Serenity Flow</div>
              <div className={styles.focusSub}>12 Minutes &middot; Guided Visualization</div>
            </div>
            <span className={styles.focusPlay}><PlayIcon size={18} /></span>
          </button>
        </section>
      </div>
    </>
  );
}

function LiveMetric({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div style={{ background: 'var(--hb-surface-2)', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontSize: 10.5, letterSpacing: '0.16em', color: 'var(--hb-text-muted)', fontWeight: 600 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6, fontFamily: 'var(--hb-font-serif)' }}>
        <span style={{ fontSize: 22, fontWeight: 600, color }}>{value}</span>
        <span style={{ fontSize: 11, color: 'var(--hb-text-muted)' }}>{unit}</span>
      </div>
    </div>
  );
}
