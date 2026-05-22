import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './resources.module.css';
import { Topbar } from '../shell/topbar.js';
import { api } from '../api/client.js';
import { useAuth } from '../api/auth-context.js';
import type { Activity, Badge, Device, User } from '../api/types.js';
import {
  AwardIcon, WatchIcon, RefreshIcon, PlusCircleIcon, SparkleIcon, TrophyIcon, StarIcon, LockIcon,
} from '../components/icons.js';

type Dash = { user: User; badges: Badge[]; activities: Activity[] };

/** Resources / Wellness Insights — uses real backend XP history */
export function ResourcesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Dash | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    api<Dash>('/api/dashboard').then(setData).catch(() => undefined);
    api<Device[]>('/api/devices').then(setDevices).catch(() => undefined);
  }, [user?.xp]);

  const days: { day: string; xp: number }[] = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { day: d.toLocaleDateString(undefined, { weekday: 'short' }), xp: 0 };
  });
  data?.activities.forEach((a) => {
    const diff = Math.floor((Date.now() - new Date(a.createdAt).getTime()) / 86400000);
    if (diff >= 0 && diff < 7) days[6 - diff].xp += a.xpEarned;
  });
  const maxXp = Math.max(50, ...days.map((d) => d.xp));

  const earnedCount = data?.badges.filter((b) => b.earned).length ?? 0;
  const totalBadges = data?.badges.length ?? 0;

  return (
    <>
      <Topbar
        title="Wellness Insights"
        tabs={[
          { label: 'Therapy', to: '/therapy' },
          { label: 'Metrics', to: '/activity' },
          { label: 'Community', to: '/community' },
        ]}
        showCta
      />

      <div className={styles.page}>
        <div>
          <h1 className={styles.heading}>Wellness Insights</h1>
          <p className={styles.intro}>Your biometric sanctuary, analyzed for clarity and growth.</p>

          <div className={styles.levelCard}>
            <div>
              <div className={styles.levelEyebrow}>CURRENT LEVEL</div>
              <div className={styles.levelName}>Voyager Lvl {user?.level ?? 1}</div>
            </div>
            <span className={styles.levelIcon}><AwardIcon size={20} /></span>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartHead}>
              <div>
                <div className={styles.chartTitle}>Weekly Overview</div>
                <div className={styles.chartSub}>XP earned per day from real sessions</div>
              </div>
              <div className={styles.legend}>
                <span className={styles.legendChip}>XP</span>
              </div>
            </div>

            <div className={styles.chart}>
              <svg viewBox="0 0 700 260" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                {days.map((b, i) => {
                  const x = i * 100 + 16;
                  const h = (b.xp / maxXp) * 240;
                  return (
                    <g key={i}>
                      <rect x={x} y={260 - h} width={60} height={h} rx={4} fill="var(--hb-mint)" />
                      {b.xp > 0 && (
                        <text x={x + 30} y={260 - h - 6} textAnchor="middle" fontSize="11" fill="var(--hb-text-muted)">
                          {b.xp}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className={styles.chartDays}>
              {days.map((b, i) => (
                <span key={i} className={styles.chartDay}>{b.day}</span>
              ))}
            </div>
          </div>

          <div className={styles.devicesRow}>
            {devices.map((d) => (
              <div key={d._id} className={styles.deviceCard}>
                <span className={styles.deviceIcon}>
                  {d.type === 'apple-watch' ? <WatchIcon size={18} /> : <RefreshIcon size={18} />}
                </span>
                <div className={styles.deviceInfo}>
                  <div className={styles.deviceName}>{d.name}</div>
                  <div className={styles.deviceMeta}>
                    {d.lastSync ? `Synced ${new Date(d.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No sync yet'}
                  </div>
                </div>
                <div className={styles.deviceVal}>
                  <div className={styles.deviceValNum}>{d.battery ?? '\u2014'}</div>
                  <div className={styles.deviceValLabel}>BATTERY</div>
                </div>
              </div>
            ))}
            <Link to="/settings" className={styles.deviceCard} style={{ textDecoration: 'none' }}>
              <span className={styles.deviceIcon}><PlusCircleIcon size={20} /></span>
              <div className={styles.deviceInfo}>
                <div className={styles.deviceName}>Add Device</div>
                <div className={styles.deviceMeta}>Expand Ecosystem</div>
              </div>
            </Link>
          </div>

          <div className={styles.masteryCard}>
            <div className={styles.masteryHead}>
              <div>
                <div className={styles.masteryTitle}>Path to Mastery</div>
                <div className={styles.masterySub}>
                  You&rsquo;ve unlocked <strong>{earnedCount}/{totalBadges}</strong> badges through real practice.
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className={styles.masteryLevel}>Level {user?.level ?? 1} Progress</div>
                <div className={styles.masteryBar}>
                  <div className={styles.masteryFill} style={{ width: `${Math.min(100, ((earnedCount / Math.max(1, totalBadges)) * 100))}%` }} />
                </div>
              </div>
            </div>

            <div className={styles.timeline}>
              <div className={styles.timelineLine} />
              <div className={styles.timelineFill} style={{ width: `${Math.min(92, 8 + (earnedCount / Math.max(1, totalBadges)) * 84)}%` }} />
              <Milestone Icon={CheckIcon} label="Base Camp" />
              <Milestone Icon={StarIcon} label="Flow State" active={earnedCount >= 3} />
              <Milestone Icon={TrophyIcon} label="High Peak" active={earnedCount >= 6} />
              <Milestone Icon={LockIcon} label="Zenith" muted={earnedCount < 9} />
            </div>
          </div>
        </div>

        <aside className={styles.side}>
          <div className={styles.aiCard}>
            <span className={styles.aiLabel}><SparkleIcon size={11} /> AI INSIGHT</span>
            <div className={styles.aiTitle}>Patterns of Practice</div>
            <div className={styles.aiBody}>
              You earn the most XP on days that combine a check-in with a breathwork session. Stack them in the morning.
            </div>
          </div>

          <div className={styles.leaderCard}>
            <div className={styles.leaderHead}>
              <div className={styles.leaderTitle}>YOUR STANDING</div>
              <Link to="/community" className={styles.leaderFull} style={{ textDecoration: 'none' }}>View &rsaquo;</Link>
            </div>
            <div className={`${styles.leaderRow} ${styles.leaderYou}`}>
              <span className={styles.leaderRank}>\u2014</span>
              <span className={styles.leaderDot} style={{ background: 'var(--hb-accent)' }} />
              <span className={styles.leaderName}>You</span>
              <span className={styles.leaderPts}>{(user?.xp ?? 0).toLocaleString()} pts</span>
            </div>
            <div className={styles.leaderRow}>
              <span className={styles.leaderRank}>\u2014</span>
              <span className={styles.leaderDot} />
              <span className={styles.leaderName}>Top Voyager</span>
              <span className={styles.leaderPts}>3,200 pts</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function CheckIcon(props: { size?: number }) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function Milestone({ Icon, label, active, muted }: { Icon: any; label: string; active?: boolean; muted?: boolean }) {
  return (
    <div className={styles.tlNode}>
      <span className={`${styles.tlDot} ${muted ? styles.tlDotMuted : ''} ${active ? styles.tlDotActive : ''}`}>
        <Icon size={16} />
      </span>
      <span className={`${styles.tlLabel} ${muted ? styles.tlLabelMuted : ''}`}>{label}</span>
    </div>
  );
}
