/** Earnable badges with concrete progress criteria — earned only after real work */
export type BadgeDef = {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** XP awarded once unlocked */
  reward: number;
  /** Evaluator returns true when the user qualifies */
  criteria: (stats: BadgeStats) => boolean;
  /** Progress text shown until unlocked */
  progress: (stats: BadgeStats) => string;
};

export type BadgeStats = {
  totalActivities: number;
  meditationCount: number;
  breathworkCount: number;
  journalCount: number;
  therapyCount: number;
  streak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
};

export const BADGES: BadgeDef[] = [
  {
    id: 'first-step',
    name: 'First Step',
    description: 'Complete your first guided session.',
    icon: 'leaf',
    reward: 50,
    criteria: (s) => s.totalActivities >= 1,
    progress: (s) => `${Math.min(s.totalActivities, 1)}/1 session`,
  },
  {
    id: 'breathwork-novice',
    name: 'Breathwork Novice',
    description: 'Log 5 breathwork sessions.',
    icon: 'wind',
    reward: 100,
    criteria: (s) => s.breathworkCount >= 5,
    progress: (s) => `${Math.min(s.breathworkCount, 5)}/5 breathwork`,
  },
  {
    id: 'meditator',
    name: 'Meditator',
    description: 'Complete 10 meditation sessions.',
    icon: 'meditation',
    reward: 150,
    criteria: (s) => s.meditationCount >= 10,
    progress: (s) => `${Math.min(s.meditationCount, 10)}/10 meditations`,
  },
  {
    id: 'consistency',
    name: 'Consistency',
    description: 'Maintain a 7-day streak.',
    icon: 'heart',
    reward: 200,
    criteria: (s) => s.streak >= 7,
    progress: (s) => `${Math.min(s.streak, 7)}/7 day streak`,
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete 5 evening wind-down sessions.',
    icon: 'moon',
    reward: 120,
    criteria: (s) => s.meditationCount >= 5 && s.streak >= 3,
    progress: (s) => `${Math.min(s.meditationCount, 5)}/5 sessions`,
  },
  {
    id: 'reflective-mind',
    name: 'Reflective Mind',
    description: 'Write 10 journal reflections.',
    icon: 'edit',
    reward: 180,
    criteria: (s) => s.journalCount >= 10,
    progress: (s) => `${Math.min(s.journalCount, 10)}/10 journals`,
  },
  {
    id: 'therapy-ally',
    name: 'Therapy Ally',
    description: 'Attend 3 therapy sessions with your provider.',
    icon: 'companion',
    reward: 250,
    criteria: (s) => s.therapyCount >= 3,
    progress: (s) => `${Math.min(s.therapyCount, 3)}/3 sessions`,
  },
  {
    id: 'meditator-veteran',
    name: 'Meditator Veteran',
    description: 'Complete 50 meditation sessions \u2014 a true practice.',
    icon: 'trophy',
    reward: 500,
    criteria: (s) => s.meditationCount >= 50,
    progress: (s) => `${Math.min(s.meditationCount, 50)}/50 meditations`,
  },
  {
    id: 'iron-streak',
    name: 'Iron Streak',
    description: 'Hold a 30-day check-in streak.',
    icon: 'award',
    reward: 600,
    criteria: (s) => s.longestStreak >= 30,
    progress: (s) => `${Math.min(s.longestStreak, 30)}/30 day best`,
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'Reach Level 10.',
    icon: 'star',
    reward: 800,
    criteria: (s) => s.level >= 10,
    progress: (s) => `Level ${s.level}/10`,
  },
  {
    id: 'elder-guide',
    name: 'Elder Guide',
    description: 'Earn 3,000 total XP through dedicated practice.',
    icon: 'trophy',
    reward: 1000,
    criteria: (s) => s.totalXp >= 3000,
    progress: (s) => `${Math.min(s.totalXp, 3000)}/3000 XP`,
  },
  {
    id: 'zen-master',
    name: 'Zen Master',
    description: 'Reach Level 20 \u2014 the highest order of practice.',
    icon: 'trophy',
    reward: 2000,
    criteria: (s) => s.level >= 20,
    progress: (s) => `Level ${s.level}/20`,
  },
];

/** Compute level from XP — gentle exponential curve */
export function computeLevel(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1);
}

/** Compute XP needed for next level */
export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}
