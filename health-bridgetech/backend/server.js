import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUrl = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || 'healthbridge';
const jwtSecret = process.env.JWT_SECRET || 'healthbridge-secret';

app.use(cors());
app.use(express.json());

let db;
let usersCollection;
let tracksCollection;

async function connectDb() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  db = client.db(dbName);
  usersCollection = db.collection('users');
  tracksCollection = db.collection('tracks');

  const count = await tracksCollection.countDocuments();
  if (count === 0) {
    await tracksCollection.insertMany([
      { id: '1', title: 'Calm Morning', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', artist: 'BridgeTech Wellness', duration: 240 },
      { id: '2', title: 'Focus Flow', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', artist: 'BridgeTech Wellness', duration: 210 },
      { id: '3', title: 'Evening Unwind', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', artist: 'BridgeTech Wellness', duration: 270 },
    ]);
  }
}

function createToken(user) {
  return jwt.sign({ id: user._id.toString() }, jwtSecret, { expiresIn: '7d' });
}

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    displayName: user.displayName,
    dateOfBirth: user.dateOfBirth,
    isMinor: user.isMinor,
    parentConsent: user.parentConsent || { verifiedAt: null },
    problemAreas: user.problemAreas || [],
  };
}

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing auth token' });
  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await usersCollection.findOne({ _id: new ObjectId(payload.id) });
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, fullName, displayName, dateOfBirth } = req.body;
  if (!email || !password || !fullName || !dateOfBirth) {
    return res.status(400).json({ error: 'Missing signup fields' });
  }

  const existing = await usersCollection.findOne({ email });
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const isMinor = (() => {
    const birth = new Date(dateOfBirth);
    const ageDiff = Date.now() - birth.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970) < 18;
  })();

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    email,
    fullName,
    displayName: displayName || fullName.split(' ')[0],
    dateOfBirth,
    isMinor,
    parentConsent: { verifiedAt: null },
    problemAreas: [],
    passwordHash,
    createdAt: new Date(),
  };

  const result = await usersCollection.insertOne(user);
  const savedUser = await usersCollection.findOne({ _id: result.insertedId });
  const token = createToken(savedUser);
  return res.json({ token, user: sanitizeUser(savedUser), needsParentConsent: isMinor });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing login credentials' });
  }
  const user = await usersCollection.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
  const token = createToken(user);
  return res.json({ token, user: sanitizeUser(user) });
});

app.post('/api/auth/google', async (req, res) => {
  const { email, fullName, avatar } = req.body;
  if (!email || !fullName) {
    return res.status(400).json({ error: 'Missing Google profile fields' });
  }
  let user = await usersCollection.findOne({ email });
  if (!user) {
    const newUser = {
      email,
      fullName,
      displayName: fullName.split(' ')[0],
      dateOfBirth: new Date().toISOString().slice(0, 10),
      isMinor: false,
      parentConsent: { verifiedAt: new Date() },
      problemAreas: [],
      passwordHash: '',
      createdAt: new Date(),
      avatar,
    };
    const result = await usersCollection.insertOne(newUser);
    user = await usersCollection.findOne({ _id: result.insertedId });
  }
  const token = createToken(user);
  return res.json({ token, user: sanitizeUser(user) });
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
});

app.get('/api/music', async (req, res) => {
  const tracks = await tracksCollection.find({}).toArray();
  return res.json(tracks.map((track) => ({ id: track.id, title: track.title, url: track.url, artist: track.artist, duration: track.duration })));
});

app.post('/api/ai', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
  const normalized = prompt.toLowerCase();
  let answer = 'I hear you. Let’s keep this focused on wellness, self-care, and healthy support.';

  if (normalized.includes('anxiety') || normalized.includes('stress')) {
    answer = 'It sounds like you’re dealing with stress or anxiety. Try taking a few deep breaths, grounding yourself, and focusing on one small step at a time.';
  } else if (normalized.includes('sleep')) {
    answer = 'A consistent bedtime routine can help. Limit screens before bed, keep your room calm, and try a relaxation exercise like gentle breathing.';
  } else if (normalized.includes('motivation')) {
    answer = 'Start with a tiny step you can complete today. Small progress builds confidence and keeps your momentum going.';
  }

  return res.json({ response: answer });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend listening on http://localhost:${port}`);
      console.log(`MongoDB connected at ${mongoUrl}/${dbName}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start backend:', err);
    process.exit(1);
  });
