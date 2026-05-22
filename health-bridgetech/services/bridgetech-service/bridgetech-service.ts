import mongoose from 'mongoose';

/** Connects to MongoDB once per process and exposes a simple readiness flag */
export class BridgetechService {
  connected = false;

  /** Connect to MongoDB if a URL is configured */
  async connect(): Promise<void> {
    if (this.connected) return;
    const url = process.env.MONGO_URL;
    if (!url) {
      console.warn('[bridgetech] MONGO_URL not set \u2014 running in in-memory fallback mode');
      return;
    }
    try {
      await mongoose.connect(url, { dbName: 'health_bridgetech' });
      this.connected = true;
      console.log('[bridgetech] Connected to MongoDB');
    } catch (err) {
      console.error('[bridgetech] MongoDB connection failed:', err);
    }
  }

  /** Factory for parity with the bit-app entry */
  static from() {
    return new BridgetechService();
  }
}
