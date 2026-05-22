import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './meditation.module.css';
import { Topbar } from '../shell/topbar.js';
import { api, streamSSE } from '../api/client.js';
import { useAuth } from '../api/auth-context.js';
import { useMusic } from '../api/music-context.js';
import type { Biometric, User } from '../api/types.js';
import {
  HeartPulseIcon, MoonIcon, HeartIcon, ArrowRightIcon, CompanionIcon,
  LeafIcon, EditIcon, CommentIcon, ShieldIcon, WindIcon, PlayIcon,
} from '../components/icons.js';

const SESSIONS = [
  { id: 'breath-5', type: 'breathwork', title: 'Box Breathing Reset', minutes: 5, track: 'binaural', xp: 30, Icon: WindIcon },
  { id: 'med-10', type: 'meditation', title: 'Body Scan', minutes: 10, track: 'ocean', xp: 50, Icon: LeafIcon },
  { id: 'med-15', type: 'meditation', title: 'Loving-kindness', minutes: 15, track: 'piano', xp: 70, Icon: HeartIcon },
  { id: 'sleep-20', type: 'meditation', title: 'Deep Sleep Wind-down', minutes: 20, track: 'rain', xp: 80, Icon: MoonIcon },
];

const QUICK = [
  { Icon: LeafIcon, title: 'Quick Meditate', sub: '5 min breathwork session.', type: 'breathwork', minutes: 5 },
  { Icon: EditIcon, title: 'Reflection', sub: 'Log your morning mood.', type: 'journal', minutes: 5 },
  { Icon: CommentIcon, title: 'Peer Support', sub: 'Join a focused circle.', type: 'session', minutes: 30 },
  { Icon: ShieldIcon, title: 'Crisis Support', sub: 'Immediate human help.', type: null as null | string, minutes: 0 },
];

/** Meditation page — real session logging earns XP and triggers ambient music */
export function MeditationPage() {
  const { user, setUser } = useAuth();
  const { play, tracks, current, stop } = useMusic();
  const [bio, setBio] = useState<Biometric | null>(null);
  const [running, setRunning] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => streamSSE('/api/biometrics/stream', (p: Biometric) => setBio(p)), []);

  const logSession = async (type: string, title: string, minutes: number) => {
    try {
      const before = user?.xp || 0;
      const res = await api<{ user: User }>('/api/activities', {
        method: 'POST',
        body: JSON.stringify({ type, title, durationMinutes: minutes }),
      });
      setUser(res.user);
      setFlash(`Session logged \u2014 +${res.user.xp - before} XP earned`);
      setTimeout(() => setFlash(null), 2800);
    } catch {/* ignore */}
  };

  const startSession = async (s: typeof SESSIONS[number]) => {
    setRunning(s.id);
    const track = tracks.find((t) => t.id === s.track);
    if (track) play(track);
    await logSession(s.type, s.title, s.minutes);
    setTimeout(() => setRunning(null), 4000);
  };

  return (
    <>
      <Topbar
        title="Meditation"
        tabs={[
          { label: 'Therapy', to: '/therapy' },
          { label: 'Metrics', to: '/activity' },
          { label: 'Community', to: '/community' },
        ]}
        variant="pill"
      />

      <div className={styles.page}>
        <section className={styles.heroRow}>
          <div className={styles.heroCard}>
            <div className={styles.heroBg} />
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>Good morning, {user?.displayName.split(' ')[0]}</h1>
              <p className={styles.heroSub}>
                Live HRV: <strong>{bio?.hrv ?? 74} ms</strong>. Pick a practice to start streaming with ambient sound.
              </p>

              <div className={styles.statRow}>
                <div className={styles.statCard}>
                  <span className={styles.statIcon}><HeartPulseIcon size={18} /></span>
                  <div>
                    <div className={styles.statLabel}>HRV</div>
                    <div className={styles.statBig}>
                      <span className={styles.statNum}>{bio?.hrv ?? 74}</span>
                      <span className={styles.statUnit}>ms</span>
                    </div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <span className={`${styles.statIcon} ${styles.statIconMid}`}><MoonIcon size={18} /></span>
                  <div>
                    <div className={styles.statLabel}>SLEEP</div>
                    <div className={styles.statBig}>
                      <span className={styles.statNum}>8h</span>
                      <span className={styles.statUnit}>12m</span>
                    </div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <span className={`${styles.statIcon} ${styles.statIconAlt}`}><HeartIcon size={18} /></span>
                  <div>
                    <div className={styles.statLabel}>STRESS</div>
                    <div className={styles.statBig}>
                      <span className={styles.statNum}>{bio?.stressLevel ?? 30}</span>
                      <span className={styles.statUnit}>%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link to="/companion" className={styles.needCard} style={{ textDecoration: 'none' }}>
            <span className={styles.needBadge}>ACTIVE</span>
            <span className={styles.needIcon}><CompanionIcon size={20} /></span>
            <div className={styles.needTitle}>Need to Talk?</div>
            <div className={styles.needBody}>
              Your Companion is here for a 2-minute breathing reset whenever you need it.
            </div>
            <span className={styles.needBtn}>Begin Session <ArrowRightIcon size={14} /></span>
          </Link>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--hb-font-serif)', fontSize: 18, fontWeight: 600, marginBottom: 14 }}>
            Guided Practices
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {SESSIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => startSession(s)}
                style={{
                  background: 'var(--hb-surface)',
                  borderRadius: 16,
                  padding: 22,
                  boxShadow: 'var(--hb-shadow-sm)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: running === s.id ? '1.5px solid var(--hb-primary)' : '1.5px solid transparent',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'var(--hb-mint-pale)', color: 'var(--hb-primary)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <s.Icon size={18} />
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--hb-primary)', background: 'var(--hb-mint-pale)', padding: '4px 10px', borderRadius: 999 }}>
                    +{s.xp} XP
                  </span>
                </span>
                <div>
                  <div style={{ fontFamily: 'var(--hb-font-serif)', fontSize: 16, fontWeight: 600 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--hb-text-muted)' }}>{s.minutes} minutes &middot; {s.type}</div>
                </div>
                <span style={{
                  marginTop: 6, padding: '8px 14px', borderRadius: 999,
                  background: running === s.id ? 'var(--hb-mint)' : 'var(--hb-primary)',
                  color: running === s.id ? 'var(--hb-primary)' : '#fff',
                  fontSize: 12, fontWeight: 600, alignSelf: 'flex-start',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  <PlayIcon size={11} /> {running === s.id ? 'Playing\u2026' : 'Start'}
                </span>
              </button>
            ))}
          </div>
          {flash && (
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--hb-accent)', fontWeight: 600 }}>{flash}</div>
          )}
        </section>

        <section className={styles.quickRow}>
          {QUICK.map((q) => (
            <button
              key={q.title}
              type="button"
              className={styles.quickCard}
              onClick={() => q.type && logSession(q.type, q.title, q.minutes)}
              style={{ background: 'var(--hb-surface)', border: 'none', textAlign: 'left', cursor: 'pointer' }}
            >
              <span className={`${styles.quickIcon} ${q.title === 'Crisis Support' ? styles.quickIconAlt : ''}`}>
                <q.Icon size={18} />
              </span>
              <div className={styles.quickTitle}>{q.title}</div>
              <div className={styles.quickSub}>{q.sub}</div>
            </button>
          ))}
        </section>

        {current && (
          <div style={{ fontSize: 12.5, color: 'var(--hb-text-muted)' }}>
            Now playing: <strong>{current.title}</strong> &middot;{' '}
            <button onClick={stop} style={{ color: 'var(--hb-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>stop</button>
          </div>
        )}
      </div>
    </>
  );
}
