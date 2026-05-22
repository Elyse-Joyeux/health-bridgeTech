/** Mock data for the Health BridgeTech app */

export type Mood = {
  label: string;
  emoji?: string;
  iconKey: 'leaf' | 'bolt' | 'cloud' | 'wave';
  active?: boolean;
};

export const MOODS: Mood[] = [
  { label: 'Calm', iconKey: 'leaf', active: true },
  { label: 'Energized', iconKey: 'bolt' },
  { label: 'Pensive', iconKey: 'cloud' },
  { label: 'Flow', iconKey: 'wave' },
];

export type Voyager = {
  rank: number;
  name: string;
  level: string;
  xp: string;
  delta?: string;
  avatar: string;
  isYou?: boolean;
  initials?: string;
};

export const VOYAGERS: Voyager[] = [
  {
    rank: 1,
    name: 'Alex Mercer (You)',
    level: 'LEVEL 4 VOYAGER',
    xp: '2,450 XP',
    delta: '+120 Today',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop',
    isYou: true,
  },
  {
    rank: 2,
    name: 'Sarah J.',
    level: 'LEVEL 5 SAGE',
    xp: '2,380 XP',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop',
  },
  {
    rank: 3,
    name: 'Marcus L.',
    level: 'LEVEL 3 SEEKER',
    xp: '2,100 XP',
    avatar: '',
    initials: 'ML',
  },
];

export type Practitioner = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  description: string;
  price: string;
  image: string;
};

export const PRACTITIONERS: Practitioner[] = [
  {
    id: 'p1',
    name: 'Dr. Elena Vane',
    specialty: 'Trauma & Mindfulness Specialist',
    rating: 4.9,
    reviews: 124,
    description:
      'Pioneering a holistic approach to somatic trauma release, Dr. Vane helps patients navigate complex...',
    price: '$120/hr',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
  },
  {
    id: 'p2',
    name: 'Julian Thorne',
    specialty: 'CBT & Behavioral Design',
    rating: 5.0,
    reviews: 89,
    description:
      'Julian blends traditional cognitive behavioral therapy with modern behavioral science to create...',
    price: '$145/hr',
    image: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop',
  },
];

export type CommunityCircle = {
  id: string;
  title: string;
  description: string;
  status: 'live' | 'active' | 'starting';
  statusLabel: string;
  ctaLabel: string;
  ctaIcon: 'mic' | 'headphones' | 'calendar';
  variant: 'primary' | 'secondary' | 'outline';
  participants?: number;
};

export const CIRCLES: CommunityCircle[] = [
  {
    id: 'c1',
    title: 'Anxiety Support',
    description: 'Navigating social triggers in professional environments with Dr. Aris.',
    status: 'live',
    statusLabel: 'LIVE NOW',
    ctaLabel: 'Join Voice',
    ctaIcon: 'mic',
    variant: 'primary',
    participants: 12,
  },
  {
    id: 'c2',
    title: 'Sleep Science',
    description: 'The relationship between blue light, melatonin, and REM cycles.',
    status: 'active',
    statusLabel: '18 ACTIVE',
    ctaLabel: 'Listen In',
    ctaIcon: 'headphones',
    variant: 'secondary',
  },
  {
    id: 'c3',
    title: 'Mindful Eating',
    description: 'A deep dive into sensory awareness during evening meals with Sarah J.',
    status: 'starting',
    statusLabel: 'STARTING IN 12M',
    ctaLabel: 'Set Reminder',
    ctaIcon: 'calendar',
    variant: 'outline',
  },
];

export type CommunityPost = {
  id: string;
  author: string;
  avatar: string;
  initials?: string;
  posted: string;
  context?: string;
  badge?: string;
  body: string;
  image?: string;
  likes: number;
  comments: number;
};

export const POSTS: CommunityPost[] = [
  {
    id: 'p1',
    author: 'Marcus Aurelius',
    avatar: '',
    initials: 'MA',
    posted: '2 hours ago in Anxiety Support',
    badge: 'COMMUNITY STAR',
    body: 'Finally managed to practice the 5-4-3-2-1 grounding technique during a high-stress meeting today. It really works! Grateful for the tips shared in yesterday\u2019s circle. \uD83C\uDF3F',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&h=500&fit=crop',
    likes: 124,
    comments: 18,
  },
  {
    id: 'p2',
    author: 'Sarah Luna',
    avatar: '',
    initials: 'SL',
    posted: '5 hours ago',
    body: '\u201CYour calm mind is the ultimate weapon against your challenges.\u201D \u2014 Just a small reminder for anyone who needs it today. We are all growing at our own pace. \uD83C\uDF19',
    likes: 89,
    comments: 3,
  },
];

export type KnowledgeItem = {
  title: string;
  meta: string;
};

export const KNOWLEDGE: KnowledgeItem[] = [
  { title: 'Understanding Cortisol Spikes', meta: '5 min read \u2022 By Dr. Aris' },
  { title: 'Circadian Rhythms & Recovery', meta: '8 min read \u2022 Sleep Science' },
  { title: 'Neuroplasticity in Adult Brains', meta: '12 min read \u2022 Behavioral Science' },
];

export type Guide = {
  name: string;
  role: string;
  avatar: string;
};

export const GUIDES: Guide[] = [
  {
    name: 'Dr. Aris Thorne',
    role: 'Clinical Psychologist',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&h=120&fit=crop',
  },
  {
    name: 'Maya Wu',
    role: 'Mindfulness Specialist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop',
  },
];

export type ChatMessage = {
  id: string;
  role: 'ai' | 'user';
  text: string;
  time: string;
};

export const CHAT: ChatMessage[] = [
  {
    id: 'm1',
    role: 'ai',
    text:
      'Good morning! I\u2019ve analyzed your sleep data from last night. You had 45 minutes of deep REM sleep more than your weekly average. How are you feeling?',
    time: '08:15 AM',
  },
  {
    id: 'm2',
    role: 'user',
    text:
      'Honestly, I\u2019m feeling a bit anxious about the upcoming board presentation. My chest feels a little tight.',
    time: '08:17 AM',
  },
  {
    id: 'm3',
    role: 'ai',
    text:
      "I understand. That's a natural physiological response. Your 'Wellness Pulse' reflects this slight tension. I recommend a 3-minute 'Box Breathing' exercise to reset your nervous system.",
    time: '08:18 AM',
  },
];

export type SleepBreakdown = {
  label: string;
  value: string;
  pct: number;
  color: string;
};

export const SLEEP: SleepBreakdown[] = [
  { label: 'Deep Sleep', value: '1h 42m (22%)', pct: 22, color: 'var(--hb-primary)' },
  { label: 'REM Sleep', value: '2h 15m (28%)', pct: 28, color: 'var(--hb-accent)' },
  { label: 'Light Sleep', value: '4h 05m (50%)', pct: 50, color: 'var(--hb-mint)' },
];

export type Conversation = {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  initials?: string;
  preview: string;
  time: string;
  unread?: number;
};

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'cv1',
    name: 'Dr. Sarah Jenkins',
    role: 'Cognitive Behavioral Specialist',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&h=120&fit=crop',
    preview: 'Looking forward to our session at 2pm. Please review the worksheet I sent.',
    time: '10:24 AM',
    unread: 2,
  },
  {
    id: 'cv2',
    name: 'Maya Wu',
    role: 'Mindfulness Specialist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop',
    preview: 'Your meditation streak is impressive. Keep going!',
    time: 'Yesterday',
  },
  {
    id: 'cv3',
    name: 'Anxiety Support Circle',
    role: 'Community Group \u2022 12 members',
    initials: 'AS',
    preview: 'Marcus: Thanks for sharing that grounding technique today.',
    time: 'Yesterday',
    unread: 5,
  },
  {
    id: 'cv4',
    name: 'Dr. Aris Thorne',
    role: 'Clinical Psychologist',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&h=120&fit=crop',
    preview: 'New article available on cortisol regulation \u2014 would love your thoughts.',
    time: 'Mon',
  },
  {
    id: 'cv5',
    name: 'Julian Thorne',
    role: 'CBT & Behavioral Design',
    avatar: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=120&h=120&fit=crop',
    preview: 'Confirming our session on Oct 21 at 2:00 PM.',
    time: 'Sun',
  },
];

export type ThreadMessage = {
  id: string;
  role: 'me' | 'them';
  text: string;
  time: string;
};

export const THREAD: ThreadMessage[] = [
  {
    id: 't1',
    role: 'them',
    text: 'Hi Alex, just checking in ahead of our session tomorrow. How has your week been?',
    time: '9:45 AM',
  },
  {
    id: 't2',
    role: 'me',
    text:
      'Hi Dr. Jenkins! It\u2019s been challenging. The breathing exercises have helped, but I had a tough Wednesday meeting.',
    time: '10:02 AM',
  },
  {
    id: 't3',
    role: 'them',
    text:
      'Thanks for sharing that. Let\u2019s explore the meeting trigger together. I\u2019ve uploaded a short worksheet \u2014 please skim it before we meet.',
    time: '10:18 AM',
  },
  {
    id: 't4',
    role: 'me',
    text: 'Will do. See you at 2pm.',
    time: '10:22 AM',
  },
  {
    id: 't5',
    role: 'them',
    text: 'Looking forward to our session at 2pm. Please review the worksheet I sent.',
    time: '10:24 AM',
  },
];
