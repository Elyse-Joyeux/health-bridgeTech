import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './topbar.module.css';
import { BellIcon, CoinIcon, SparkleIcon, HeartIcon, MoonIcon } from '../components/icons.js';
import { useAuth } from '../api/auth-context.js';
import { useNotifications } from '../api/notifications-context.js';

export type TopbarProps = {
  title?: string;
  tabs?: { label: string; to?: string; active?: boolean }[];
  showXp?: boolean;
  showCta?: boolean;
  ctaLabel?: string;
  ctaTo?: string;
  showBell?: boolean;
  variant?: 'avatar' | 'pill';
  right?: ReactNode;
};

const ICONS = { reminder: BellIcon, achievement: HeartIcon, message: MoonIcon, insight: SparkleIcon };

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** Top bar with router-driven tabs, notifications popover, XP chip, and avatar */
export function Topbar({
  title,
  tabs = [
    { label: 'Therapy', to: '/therapy' },
    { label: 'Metrics', to: '/activity' },
    { label: 'Community', to: '/community' },
  ],
  showXp = false,
  showCta = false,
  ctaLabel = 'Start Session',
  ctaTo = '/meditation',
  showBell = true,
  variant = 'avatar',
  right,
}: TopbarProps) {
  const { user } = useAuth();
  const { items, unread, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [popOpen, setPopOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!popOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setPopOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [popOpen]);

  return (
    <header className={styles.topbar}>
      {title && <div className={styles.title}>{title}</div>}
      <nav className={styles.tabs}>
        {tabs.map((t) =>
          t.to ? (
            <Link
              key={t.label}
              to={t.to}
              className={`${styles.tab} ${t.active ? styles.tabActive : ''}`}
            >
              {t.label}
            </Link>
          ) : (
            <button
              key={t.label}
              type="button"
              className={`${styles.tab} ${t.active ? styles.tabActive : ''}`}
            >
              {t.label}
            </button>
          ),
        )}
      </nav>

      <div className={styles.right}>
        {right}
        {showXp && (
          <div className={styles.xpChip}>
            <CoinIcon size={16} />
            <span>{(user?.xp || 0).toLocaleString()} XP</span>
          </div>
        )}
        {showCta && (
          <Link to={ctaTo} className={styles.cta}>
            {ctaLabel}
          </Link>
        )}
        {showBell && (
          <div className={styles.bellWrap} ref={popRef}>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Notifications"
              onClick={() => setPopOpen((o) => !o)}
            >
              <BellIcon size={20} />
              {unread > 0 && <span className={styles.dot}>{unread}</span>}
            </button>
            {popOpen && (
              <div className={styles.popover}>
                <div className={styles.popHead}>
                  <div className={styles.popTitle}>Notifications</div>
                  {unread > 0 && (
                    <button type="button" className={styles.popMark} onClick={markAllRead}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div className={styles.popList}>
                  {items.length === 0 && (
                    <div className={styles.popEmpty}>You&rsquo;re all caught up.</div>
                  )}
                  {items.map((n) => {
                    const Icon = ICONS[n.type] || BellIcon;
                    return (
                      <div
                        key={n._id}
                        className={`${styles.popItem} ${!n.read ? styles.popUnread : ''}`}
                      >
                        <span className={styles.popIcon}>
                          <Icon size={14} />
                        </span>
                        <div>
                          <div className={styles.popTitleText}>{n.title}</div>
                          <div className={styles.popBody}>{n.body}</div>
                          <div className={styles.popTime}>{relativeTime(n.createdAt)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {variant === 'pill' ? (
          <button type="button" className={styles.userPill} onClick={() => navigate('/profile')}>
            <span className={styles.avatar}>
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop'}
                alt={user?.displayName || 'Profile'}
              />
            </span>
            <span>{user?.displayName || 'Profile'}</span>
          </button>
        ) : (
          <button type="button" className={styles.avatar} onClick={() => navigate('/profile')}>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop'}
              alt={user?.displayName || 'Profile'}
            />
          </button>
        )}
      </div>
    </header>
  );
}
