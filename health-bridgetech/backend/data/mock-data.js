// Moved from frontend/data/mock-data.ts
export const MOODS = [
  { label: 'Calm', iconKey: 'leaf', active: true },
  { label: 'Energized', iconKey: 'bolt' },
  { label: 'Pensive', iconKey: 'cloud' },
  { label: 'Flow', iconKey: 'wave' },
];

export const VOYAGERS = [
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

export const PRACTITIONERS = [
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

export const CIRCLES = [
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

export const POSTS = [
  {
    id: 'p1',
    author: 'Marcus Aurelius',
    avatar: '',
    initials: 'MA',
    posted: '2 hours ago in Anxiety Support',
    badge: 'COMMUNITY STAR',
    body: 'Finally managed to practice the 5-4-3-2-1 grounding technique during a high-stress meeting today. It really works! Grateful for the tips shared in yesterday’s circle. 🌿',
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
    body: '“Your calm mind is the ultimate weapon against your challenges.” — Just a small reminder for anyone who needs it today. We are all growing at our own pace. 🌙',
    likes: 89,
    comments: 3,
  },
];

export const KNOWLEDGE = [
  { title: 'Understanding Cortisol Spikes', meta: '5 min read • By Dr. Aris' },
  { title: 'Circadian Rhythms & Recovery', meta: '8 min read • Sleep Science' },
  { title: 'Neuroplasticity in Adult Brains', meta: '12 min read • Behavioral Science' },
];

export const GUIDES = [
  {
    name: 'Dr. Aris Thorne',
    role: 'Clinical Psychologist',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&h=120&fit=crop',
  },
  {
    name: 'Maya Wu',
    role: 'Experience Designer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop',
  },
];
