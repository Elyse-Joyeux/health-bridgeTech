import type { SVGProps } from 'react';

/** Common props for stroke-style icons */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const sw = (p: IconProps) => ({
  width: p.size ?? 18,
  height: p.size ?? 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...p,
});

/** Dashboard / grid icon */
export const DashboardIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

/** AI Companion / brain-spark icon */
export const CompanionIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="12" cy="12" r="8" />
    <path d="M9 11.5a3 3 0 016 0" />
    <circle cx="9.5" cy="10" r="0.6" fill="currentColor" />
    <circle cx="14.5" cy="10" r="0.6" fill="currentColor" />
  </svg>
);

/** Activity wave icon */
export const ActivityIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M3 12h3l2-5 3 10 3-8 2 5h5" />
  </svg>
);

/** Resources document icon */
export const ResourcesIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 8h6M9 12h6M9 16h4" />
  </svg>
);

/** Meditation / lotus icon */
export const MeditationIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="12" cy="7" r="2" />
    <path d="M6 18c1.5-3 4-4 6-4s4.5 1 6 4" />
    <path d="M4 18h16" />
    <path d="M8 14c-2 0-3-1.5-3-3s2-2 3-2" />
    <path d="M16 14c2 0 3-1.5 3-3s-2-2-3-2" />
  </svg>
);

/** Profile / user icon */
export const ProfileIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
  </svg>
);

/** Settings / gear icon */
export const SettingsIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3h0a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5h0a1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8v0a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
  </svg>
);

/** Messages / envelope icon */
export const MessagesIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

/** Bell / notifications */
export const BellIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M6 17v-5a6 6 0 1112 0v5" />
    <path d="M4 17h16" />
    <path d="M10 20a2 2 0 004 0" />
  </svg>
);

/** Leaf icon */
export const LeafIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M5 19c1-9 7-13 15-14-1 9-5 14-14 15-1 0-1-1-1-1z" />
    <path d="M5 19c2-3 5-6 9-8" />
  </svg>
);

/** Bolt / energy icon */
export const BoltIcon = (p: IconProps) => (
  <svg {...sw(p)} fill="currentColor" stroke="none">
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
  </svg>
);

/** Cloud icon (pensive) */
export const CloudIcon = (p: IconProps) => (
  <svg {...sw(p)} fill="currentColor" stroke="none">
    <circle cx="8" cy="14" r="3.2" />
    <circle cx="12" cy="11" r="3.5" />
    <circle cx="16" cy="14" r="3.2" />
    <rect x="6" y="14" width="12" height="4" rx="2" />
  </svg>
);

/** Wave / flow icon */
export const WaveIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
    <path d="M3 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
  </svg>
);

/** Sparkle / AI shimmer */
export const SparkleIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z" />
    <path d="M19 16l.7 1.8L21.5 18l-1.8.7L19 20.5l-.7-1.8L16.5 18l1.8-.7z" />
  </svg>
);

/** Chat bubble icon */
export const ChatIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M21 12a8 8 0 01-12 7l-5 1 1-5a8 8 0 1116-3z" />
  </svg>
);

/** Star icon */
export const StarIcon = (p: IconProps) => (
  <svg {...sw(p)} fill="currentColor" stroke="none">
    <path d="M12 2l3 6.5 7 1-5 4.7 1.3 7L12 17.8 5.7 21.2 7 14.2 2 9.5l7-1z" />
  </svg>
);

/** XP coin */
export const CoinIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10M9 9.5a2.5 2.5 0 010 5h6a2.5 2.5 0 000-5z" />
  </svg>
);

/** Trophy icon */
export const TrophyIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M7 4h10v4a5 5 0 01-10 0V4z" />
    <path d="M5 6H3a3 3 0 003 3M19 6h2a3 3 0 01-3 3" />
    <path d="M9 14h6v3H9zM8 21h8" />
    <path d="M12 17v4" />
  </svg>
);

/** Moon icon */
export const MoonIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M20 14a8 8 0 11-10-10 6 6 0 0010 10z" />
  </svg>
);

/** Heart icon */
export const HeartIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.7A4 4 0 0119 10c0 5.5-7 10-7 10z" />
  </svg>
);

/** Heart filled */
export const HeartFilledIcon = (p: IconProps) => (
  <svg {...sw(p)} fill="currentColor" stroke="none">
    <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.7A4 4 0 0119 10c0 5.5-7 10-7 10z" />
  </svg>
);

/** Headphones */
export const HeadphonesIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M4 14v-2a8 8 0 0116 0v2" />
    <rect x="3" y="14" width="4" height="6" rx="1.5" />
    <rect x="17" y="14" width="4" height="6" rx="1.5" />
  </svg>
);

/** Microphone */
export const MicIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <rect x="9" y="3" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0014 0M12 18v3" />
  </svg>
);

/** Calendar */
export const CalendarIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
  </svg>
);

/** Plus */
export const PlusIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

/** Search */
export const SearchIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

/** Filter / sliders */
export const FiltersIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M4 7h12M18 7h2M4 12h6M12 12h8M4 17h10M16 17h4" />
    <circle cx="16" cy="7" r="1.5" />
    <circle cx="11" cy="12" r="1.5" />
    <circle cx="15" cy="17" r="1.5" />
  </svg>
);

/** Chevron right */
export const ChevronRightIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

/** Chevron down */
export const ChevronDownIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/** Arrow right */
export const ArrowRightIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** Comment bubble */
export const CommentIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M21 11a8 8 0 01-12 7l-5 1 1-5a8 8 0 1116-3z" />
  </svg>
);

/** Share */
export const ShareIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="M8.2 11l7.6-4M8.2 13l7.6 4" />
  </svg>
);

/** Send arrow */
export const SendIcon = (p: IconProps) => (
  <svg {...sw(p)} fill="currentColor" stroke="none">
    <path d="M3 21l18-9L3 3v7l13 2-13 2z" />
  </svg>
);

/** Book / knowledge */
export const BookIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M4 19V5a2 2 0 012-2h12v16H6a2 2 0 00-2 2z" />
    <path d="M4 19a2 2 0 012-2h12" />
  </svg>
);

/** Award medal */
export const AwardIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="12" cy="9" r="5" />
    <path d="M8 13l-2 8 6-3 6 3-2-8" />
  </svg>
);

/** Lock */
export const LockIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 018 0v3" />
  </svg>
);

/** Lightbulb */
export const BulbIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 00-4 10.5c.7.6 1 1.5 1 2.5h6c0-1 .3-1.9 1-2.5A6 6 0 0012 3z" />
  </svg>
);

/** Wind / breath */
export const WindIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M3 8h11a3 3 0 100-6M3 12h17a3 3 0 110 6M3 16h7" />
  </svg>
);

/** Heart pulse */
export const HeartPulseIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.7A4 4 0 0119 10c0 5.5-7 10-7 10z" />
    <path d="M8 12h2l1-2 2 4 1-2h2" />
  </svg>
);

/** Watch */
export const WatchIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <rect x="6" y="6" width="12" height="12" rx="3" />
    <path d="M9 6V3h6v3M9 18v3h6v-3M12 9v3l2 1" />
  </svg>
);

/** Refresh */
export const RefreshIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M4 12a8 8 0 0114-5l2-2v6h-6l2-2a5 5 0 00-9 3" />
    <path d="M20 12a8 8 0 01-14 5l-2 2v-6h6l-2 2a5 5 0 009-3" />
  </svg>
);

/** Edit / pencil */
export const EditIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M4 20h4l11-11-4-4L4 16v4z" />
  </svg>
);

/** Play */
export const PlayIcon = (p: IconProps) => (
  <svg {...sw(p)} fill="currentColor" stroke="none">
    <path d="M6 4l14 8L6 20z" />
  </svg>
);

/** Trend up */
export const TrendUpIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M14 7h7v7" />
  </svg>
);

/** Logo mark */
export const LogoMark = (p: IconProps) => (
  <svg {...sw(p)} fill="currentColor" stroke="none">
    <circle cx="12" cy="12" r="10" opacity="0.12" />
    <path d="M8 14c2-4 6-4 8 0M8 14V9M16 14V9" stroke="currentColor" strokeWidth="1.6" fill="none" />
  </svg>
);

/** Shield (security/privacy) */
export const ShieldIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
  </svg>
);

/** Globe */
export const GlobeIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
  </svg>
);

/** Plus circle / add device */
export const PlusCircleIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

/** Paperclip / attach */
export const AttachIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M21 12l-8 8a5 5 0 11-7-7l8-8a3.5 3.5 0 015 5l-8 8a2 2 0 11-3-3l7-7" />
  </svg>
);
