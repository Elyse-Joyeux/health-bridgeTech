import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '../../.env' });

const mongoUrl = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || 'healthbridge';

async function seed() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db(dbName);
  const users = db.collection('users');

  const existing = await users.findOne({ email: 'demo@local' });
  if (existing) {
    console.log('Demo user already exists:', existing.email);
    await client.close();
    return;
  }

  const passwordHash = await bcrypt.hash('password123', 10);
  const demo = {
    email: 'demo@local',
    fullName: 'Demo User',
    displayName: 'Demo',
    dateOfBirth: '2000-01-01',
    isMinor: false,
    parentConsent: { verifiedAt: new Date() },
    problemAreas: ['stress'],
    passwordHash,
    createdAt: new Date(),
  };

  const result = await users.insertOne(demo);
  console.log('Inserted demo user id', result.insertedId.toString());
  await client.close();
}

seed().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});
