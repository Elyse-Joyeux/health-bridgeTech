import { NavLink, Link } from 'react-router-dom';
import styles from './sidebar.module.css';
import {
  DashboardIcon,
  CompanionIcon,
  ActivityIcon,
  ResourcesIcon,
  MeditationIcon,
  ProfileIcon,
  SettingsIcon,
  MessagesIcon,
  ArrowRightIcon,
} from '../components/icons.js';
import { useAuth } from '../api/auth-context.js';

const MAIN_LINKS = [
  { to: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { to: '/companion', label: 'AI Companion', Icon: CompanionIcon },
  { to: '/activity', label: 'Activity', Icon: ActivityIcon },
  { to: '/resources', label: 'Resources', Icon: ResourcesIcon },
  { to: '/meditation', label: 'Meditation', Icon: MeditationIcon },
  { to: '/therapy', label: 'Therapy', Icon: HeartLink },
  { to: '/community', label: 'Community', Icon: CommunityLink },
];

const ACCOUNT_LINKS = [
  { to: '/profile', label: 'Profile', Icon: ProfileIcon },
  { to: '/settings', label: 'Settings', Icon: SettingsIcon },
  { to: '/messages', label: 'Messages', Icon: MessagesIcon },
];

function HeartLink(props: { size?: number }) {
  return (
    <svg width={props.size ?? 18} height={props.size ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.7A4 4 0 0119 10c0 5.5-7 10-7 10z" />
    </svg>
  );
}

function CommunityLink(props: { size?: number }) {
  return (
    <svg width={props.size ?? 18} height={props.size ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="3" />
      <circle cx="17" cy="11" r="2.5" />
      <path d="M3 19c.5-3 3-5 6-5s5.5 2 6 5" />
      <path d="M15 17c.4-1.6 1.7-2.5 3.5-2.5s3.1.9 3.5 2.5" />
    </svg>
  );
}

/** Left sidebar pinned to viewport — only middle content scrolls */
export function Sidebar() {
  const { user, logout } = useAuth();
  const initials = (user?.displayName || user?.fullName || 'A')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Link to="/dashboard" className={styles.brandLink}>
          <div className={styles.brandName}>Health BridgeTech</div>
          <div className={styles.brandTag}>Digital Sanctuary</div>
        </Link>
      </div>

      <div className={styles.scroll}>
        <nav className={styles.group}>
          <div className={styles.groupLabel}>Main</div>
          {MAIN_LINKS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <span className={styles.navIcon}>
                <Icon size={18} />
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <nav className={styles.group}>
          <div className={styles.groupLabel}>Account</div>
          {ACCOUNT_LINKS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <span className={styles.navIcon}>
                <Icon size={18} />
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <Link to="/profile" className={styles.userCard}>
        <div className={styles.userAvatar}>
          {user?.avatar ? <img src={user.avatar} alt={user.displayName} /> : initials}
          <span className={styles.userBadge}>{user?.level || 1}</span>
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.displayName || user?.fullName || 'Guest'}</span>
          <span className={styles.userLevel}>Level {user?.level || 1} Voyager</span>
        </div>
        <button
          type="button"
          className={styles.logout}
          onClick={(e) => {
            e.preventDefault();
            logout();
            window.location.href = '/';
          }}
          aria-label="Sign out"
        >
          <ArrowRightIcon size={14} />
        </button>
      </Link>
    </aside>
  );
}
