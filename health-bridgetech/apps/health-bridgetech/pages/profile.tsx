import { useEffect, useState } from 'react';
import styles from './profile.module.css';
import { Topbar } from '../shell/topbar.js';
import {
  MeditationIcon,
  MoonIcon,
  HeartIcon,
  TrophyIcon,
  LeafIcon,
  LockIcon,
  AwardIcon,
  WindIcon,
  StarIcon,
  CompanionIcon,
  EditIcon,
} from '../components/icons.js';
import { api } from '../api/client.js';
import { useAuth } from '../api/auth-context.js';
import type { Activity, Badge } from '../api/types.js';

const ICON_MAP: Record<string, typeof MeditationIcon> = {
  leaf: LeafIcon,
  meditation: MeditationIcon,
  moon: MoonIcon,
  heart: HeartIcon,
  wind: WindIcon,
  edit: EditIcon,
  companion: CompanionIcon,
  trophy: TrophyIcon,
  award: AwardIcon,
  star: StarIcon,
};

type Dash = {
  badges: Badge[];
  activities: Activity[];
  stats: { totalActivities: number; meditationCount: number };
};

/** Profile page — real badges with progress towards each milestone */
export function ProfilePage() {
  const { user } = useAuth();
  const [data, setData] = useState<Dash | null>(null);

  useEffect(() => {
    api<Dash>('/api/dashboard').then(setData).catch(() => undefined);
  }, [user?.xp]);

  if (!user) return null;

  const earned = data?.badges.filter((b) => b.earned) || [];
  const locked = data?.badges.filter((b) => !b.earned) || [];

  return (
    <>
      <Topbar
        title="Profile"
        tabs={[
          { label: 'Therapy', to: '/therapy' },
          { label: 'Metrics', to: '/activity' },
          { label: 'Community', to: '/community' },
        ]}
      />

      <div className={styles.page}>
        <div>
          <div className={styles.heroCard}>
            <div className={styles.heroBanner} />
            <div className={styles.heroBody}>
              <div className={styles.avatar}>
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop'}
                  alt={user.displayName}
                />
              </div>
              <div className={styles.heroInfo}>
                <div className={styles.name}>{user.fullName}</div>
                <div className={styles.tagline}>
                  Level {user.level} &bull; {user.problemAreas.join(' \u00b7 ') || 'No focus areas yet'} &bull; Joined{' '}
                  {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div className={styles.heroActions}>
                <button type="button" className={styles.btnPrimary}>Edit Profile</button>
              </div>
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaCard}>
                <div className={styles.metaLabel}>TOTAL XP</div>
                <div className={styles.metaVal}>{user.xp.toLocaleString()}</div>
                <div className={styles.metaSub}>Lvl {user.level}</div>
              </div>
              <div className={styles.metaCard}>
                <div className={styles.metaLabel}>SESSIONS</div>
                <div className={styles.metaVal}>{data?.stats.totalActivities ?? 0}</div>
                <div className={styles.metaSub}>{data?.stats.meditationCount ?? 0} meditation</div>
              </div>
              <div className={styles.metaCard}>
                <div className={styles.metaLabel}>STREAK</div>
                <div className={styles.metaVal}>{user.streak}d</div>
                <div className={styles.metaSub}>Best: {user.longestStreak}d</div>
              </div>
              <div className={styles.metaCard}>
                <div className={styles.metaLabel}>BADGES</div>
                <div className={styles.metaVal}>{earned.length}</div>
                <div className={styles.metaSub}>{locked.length} to unlock</div>
              </div>
            </div>
          </div>

          <div className={styles.card} style={{ marginTop: 22 }}>
            <div className={styles.cardTitle}>Achievements</div>
            <div className={styles.cardSub}>
              Each badge is earned through real practice &mdash; not given out for free.
            </div>
            <div className={styles.achievements}>
              {data?.badges.map((b) => {
                const Icon = ICON_MAP[b.icon] || AwardIcon;
                return (
                  <div
                    key={b.id}
                    className={`${styles.achievement} ${b.earned ? styles.achievementEarned : ''}`}
                  >
                    <span className={`${styles.achIcon} ${b.earned ? '' : styles.achIconLocked}`}>
                      {b.earned ? <Icon size={22} /> : <LockIcon size={18} />}
                    </span>
                    <div className={styles.achBody}>
                      <div className={styles.achName}>{b.name}</div>
                      <div className={styles.achDesc}>{b.description}</div>
                      <div className={styles.achProgress}>{b.earned ? 'Earned' : b.progress}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.card} style={{ marginTop: 22 }}>
            <div className={styles.cardTitle}>Recent Activity</div>
            <div className={styles.cardSub}>The last few moments of your journey.</div>
            <div className={styles.timeline}>
              {data?.activities.slice(0, 6).map((a) => {
                const Icon =
                  a.type === 'meditation' ? MeditationIcon :
                  a.type === 'breathwork' ? WindIcon :
                  a.type === 'journal' ? EditIcon :
                  a.type === 'therapy' ? HeartIcon :
                  a.type === 'session' ? StarIcon :
                  LeafIcon;
                return (
                  <div key={a._id} className={styles.tlItem}>
                    <span className={styles.tlIcon}>
                      <Icon size={16} />
                    </span>
                    <div className={styles.tlBody}>
                      <div className={styles.tlTitle}>{a.title}</div>
                      <div className={styles.tlMeta}>
                        {new Date(a.createdAt).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })} &bull; {a.durationMinutes} min
                      </div>
                    </div>
                    <span className={styles.tlXp}>+{a.xpEarned} XP</span>
                  </div>
                );
              })}
              {!data?.activities.length && (
                <div style={{ fontSize: 12.5, color: 'var(--hb-text-muted)', padding: 12 }}>
                  No activity yet. Start a session to fill your timeline.
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className={styles.side}>
          <div className={styles.streakCard}>
            <div className={styles.streakLabel}>CURRENT STREAK</div>
            <div className={styles.streakBig}>{user.streak} days</div>
            <div className={styles.streakBody}>
              {user.streak > 0
                ? `Keep your rhythm — best streak ${user.longestStreak} days.`
                : 'Log a mood today to start your streak.'}
            </div>
            <div className={styles.streakDots}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <span key={i} className={`${styles.sDot} ${i <= Math.min(7, user.streak) ? styles.sDotOn : ''}`} />
              ))}
            </div>
          </div>

          <div className={styles.preferencesCard}>
            <div className={styles.cardTitle}>Focus Areas</div>
            <div className={styles.cardSub}>From your assessment.</div>
            {user.problemAreas.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--hb-text-muted)' }}>None selected yet.</div>
            )}
            {user.problemAreas.map((p) => (
              <div key={p} className={styles.prefRow}>
                <span className={styles.prefName}>{p[0].toUpperCase() + p.slice(1)}</span>
                <span className={styles.prefVal}>Active</span>
              </div>
            ))}
          </div>

          <div className={styles.preferencesCard}>
            <div className={styles.cardTitle}>Preferences</div>
            <div className={styles.cardSub}>Quick glance at your settings.</div>
            <div className={styles.prefRow}>
              <span className={styles.prefName}>Timezone</span>
              <span className={styles.prefVal}>{user.timezone || 'Pacific Time'}</span>
            </div>
            <div className={styles.prefRow}>
              <span className={styles.prefName}>Primary Goal</span>
              <span className={styles.prefVal}>{user.primaryGoal || 'focus'}</span>
            </div>
            <div className={styles.prefRow}>
              <span className={styles.prefName}>Email</span>
              <span className={styles.prefVal}>{user.email}</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
