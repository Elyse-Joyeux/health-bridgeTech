import mongoose, { Schema, Document } from 'mongoose';

/** A registered Health BridgeTech user */
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  displayName: string;
  fullName: string;
  dateOfBirth: string;
  isMinor: boolean;
  parentConsent?: {
    parentName: string;
    parentEmail: string;
    requestedAt: Date;
    verifiedAt?: Date;
    token: string;
  };
  problemAreas: string[];
  assessmentAnswers: Record<string, string>;
  level: number;
  xp: number;
  streak: number;
  longestStreak: number;
  lastCheckIn?: Date;
  badges: string[];
  avatar?: string;
  timezone?: string;
  primaryGoal?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String, required: true },
  fullName: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  isMinor: { type: Boolean, default: false },
  parentConsent: {
    parentName: String,
    parentEmail: String,
    requestedAt: Date,
    verifiedAt: Date,
    token: String,
  },
  problemAreas: { type: [String], default: [] },
  assessmentAnswers: { type: Schema.Types.Mixed, default: {} },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCheckIn: Date,
  badges: { type: [String], default: [] },
  avatar: String,
  timezone: { type: String, default: 'America/Los_Angeles' },
  primaryGoal: { type: String, default: 'focus' },
  createdAt: { type: Date, default: Date.now },
});

/** A connected wearable device */
export interface IDevice extends Document {
  userId: string;
  name: string;
  type: 'apple-watch' | 'oura-ring' | 'whoop' | 'garmin' | 'fitbit';
  paired: boolean;
  lastSync?: Date;
  battery?: number;
  serial?: string;
  metrics: { label: string; value: string; unit?: string }[];
  createdAt: Date;
}

const DeviceSchema = new Schema<IDevice>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  paired: { type: Boolean, default: true },
  lastSync: { type: Date, default: Date.now },
  battery: { type: Number, default: 82 },
  serial: String,
  metrics: { type: [{ label: String, value: String, unit: String }], default: [] },
  createdAt: { type: Date, default: Date.now },
});

/** A biometric reading captured for a user */
export interface IBiometric extends Document {
  userId: string;
  recordedAt: Date;
  hrv: number;
  heartRate: number;
  stressLevel: number;
  sleepMinutes?: number;
  sleepScore?: number;
  steps?: number;
}

const BiometricSchema = new Schema<IBiometric>({
  userId: { type: String, required: true, index: true },
  recordedAt: { type: Date, default: Date.now, index: true },
  hrv: Number,
  heartRate: Number,
  stressLevel: Number,
  sleepMinutes: Number,
  sleepScore: Number,
  steps: Number,
});

/** A completed practice / activity session that earns XP */
export interface IActivity extends Document {
  userId: string;
  type: 'meditation' | 'breathwork' | 'journal' | 'therapy' | 'check-in' | 'session';
  title: string;
  durationMinutes: number;
  xpEarned: number;
  notes?: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
  userId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  durationMinutes: { type: Number, default: 0 },
  xpEarned: { type: Number, default: 0 },
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

/** AI companion conversation message */
export interface IMessage extends Document {
  userId: string;
  role: 'user' | 'ai';
  text: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  userId: { type: String, required: true, index: true },
  role: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

/** Notification surfaced to a user */
export interface INotification extends Document {
  userId: string;
  title: string;
  body: string;
  type: 'reminder' | 'achievement' | 'message' | 'insight';
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, default: 'reminder' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const User: mongoose.Model<IUser> =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>('User', UserSchema);
export const Device: mongoose.Model<IDevice> =
  (mongoose.models.Device as mongoose.Model<IDevice>) ||
  mongoose.model<IDevice>('Device', DeviceSchema);
export const Biometric: mongoose.Model<IBiometric> =
  (mongoose.models.Biometric as mongoose.Model<IBiometric>) ||
  mongoose.model<IBiometric>('Biometric', BiometricSchema);
export const Activity: mongoose.Model<IActivity> =
  (mongoose.models.Activity as mongoose.Model<IActivity>) ||
  mongoose.model<IActivity>('Activity', ActivitySchema);
export const Message: mongoose.Model<IMessage> =
  (mongoose.models.Message as mongoose.Model<IMessage>) ||
  mongoose.model<IMessage>('Message', MessageSchema);
export const Notification: mongoose.Model<INotification> =
  (mongoose.models.Notification as mongoose.Model<INotification>) ||
  mongoose.model<INotification>('Notification', NotificationSchema);
