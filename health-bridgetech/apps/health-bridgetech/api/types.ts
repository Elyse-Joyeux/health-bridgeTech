/** Authenticated user object returned by the backend */
export type User = {
  id: string;
  email: string;
  displayName: string;
  fullName: string;
  dateOfBirth: string;
  isMinor: boolean;
  parentConsent?: {
    parentName: string;
    parentEmail: string;
    requestedAt: string;
    verifiedAt?: string;
  };
  problemAreas: string[];
  level: number;
  xp: number;
  streak: number;
  longestStreak: number;
  badges: string[];
  avatar?: string;
  timezone?: string;
  primaryGoal?: string;
  createdAt: string;
};

/** Live biometric reading */
export type Biometric = {
  recordedAt: string;
  hrv: number;
  heartRate: number;
  stressLevel: number;
  sleepMinutes?: number;
  sleepScore?: number;
  steps?: number;
};

/** Connected wearable device */
export type Device = {
  _id: string;
  userId: string;
  name: string;
  type: string;
  paired: boolean;
  lastSync?: string;
  battery?: number;
  serial?: string;
  metrics: { label: string; value: string; unit?: string }[];
};

/** Tracked practice / activity */
export type Activity = {
  _id: string;
  userId: string;
  type: 'meditation' | 'breathwork' | 'journal' | 'therapy' | 'check-in' | 'session';
  title: string;
  durationMinutes: number;
  xpEarned: number;
  notes?: string;
  createdAt: string;
};

/** Companion chat message */
export type ChatMessage = {
  _id: string;
  userId: string;
  role: 'user' | 'ai';
  text: string;
  createdAt: string;
};

/** Notification entry */
export type Notification = {
  _id: string;
  userId: string;
  title: string;
  body: string;
  type: 'reminder' | 'achievement' | 'message' | 'insight';
  read: boolean;
  createdAt: string;
};

/** Badge with progress */
export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: string;
};

/** Music track */
export type Track = {
  id: string;
  title: string;
  mood: string;
  duration: string;
  url: string;
  cover: string;
};
