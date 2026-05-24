# Health BridgeTech

Local run instructions

1. Copy your env values into `.env` at the project root (already created).

2. Install dependencies:

```bash
npm install
```

3. Start backend (in one terminal):

```bash
npm run start:backend
```

4. Start the frontend dev server (in another terminal):

```bash
npm run dev
```

Or run both concurrently (one-liner):

```bash
npm run start:all
```

Notes

- `.env` is listed in `.gitignore` — do not commit secrets.
- If you want a demo user inserted, run:

```bash
node health-bridgetech/backend/seed.js
```
