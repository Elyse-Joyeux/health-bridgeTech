import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// The platform gateway listens on 5000 and exposes the service under `/bridgetech-service/*`.
// In standalone mode we still need to hit the gateway, not the raw service on 5001.
const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';
const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root,
  plugins: [react()],
  server: {
    // Do NOT proxy `/api` — it would shadow source modules under our local `api/` folder.
    proxy: {
      '/bridgetech-service': {
        target: BACKEND,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bridgetech-service/, ''),
      },
    },
  },
});
