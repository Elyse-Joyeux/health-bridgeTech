import express from 'express';
import cors from 'cors';
import { BridgetechService } from './bridgetech-service.js';
import { registerRoutes } from './routes.js';

/** Bootstraps the Express HTTP service */
export function run() {
  const app = express();
  const port = process.env.PORT || 3000;
  const service = BridgetechService.from();

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );

  // Connect to MongoDB (non-blocking). Routes register immediately so the gateway
  // sees them; in-memory fallback responses still work if MONGO_URL is missing.
  service.connect().catch((err) => console.error(err));

  registerRoutes(app);

  app.get('/', (_req, res) => {
    res.json({ ok: true, service: 'bridgetech-service' });
  });

  const server = app.listen(port, () => {
    console.log(`\uD83D\uDE80  Bridgetech service ready at: http://localhost:${port}`);
  });

  return {
    port,
    stop: async () => {
      server.closeAllConnections();
      server.close();
    },
  };
}
