# RescueLink

RescueLink is a wildlife first-aid and rescuer finder web app. It gives users two fast paths:

- AI-powered first-aid guidance through a stateless streaming chat
- verified wildlife rescuer contacts near the user, with a nearest-city fallback when local coverage is missing

## Stack

- Frontend: React 18, Vite, Tailwind CSS v3, React Router v6, Leaflet
- Backend: Hono running locally on Node, with Cloudflare Worker config included
- Database: MongoDB + Mongoose
- AI: OpenRouter chat completions, `openai/gpt-4o-mini` by default

## Local setup

1. Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

2. Create env files

`client/.env`

```bash
VITE_API_BASE_URL=http://localhost:5000
```

`server/.env`

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rescuelink
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openai/gpt-4o-mini
CLIENT_URL=http://localhost:5173
```

3. Seed rescuers

```bash
cd server
npm run seed
```

4. Start the backend

```bash
cd server
npm run dev
```

5. Start the frontend in another terminal

```bash
cd client
npm run dev
```

## Seeded coverage

The seed script loads verified Karnataka rescuer coverage for:

- Bangalore
- Mysore
- Mangalore
- Hubli-Dharwad
- Belgaum

New rescuer submissions are stored with `verified: false` and are excluded from user results until approved.

## API

`POST /api/chat`

- accepts `message`, `animal`, and `conversationHistory`
- streams OpenRouter chat output as SSE-style `data:` chunks
- keeps the system prompt server-side
- caps history to the latest 10 messages

`GET /api/rescuers?city=bangalore&specialty=birds`

- normalizes city aliases like `bengaluru -> bangalore`
- returns verified rescuers only
- falls back to the nearest seeded city if no verified local rescuers exist

`GET /api/rescuers/cities`

- returns verified coverage cities and counts

`POST /api/rescuers`

- accepts future rescuer submissions
- saves them as unverified

## Verification

- `client`: `npm run build`
- `server`: `npm run build`

## Notes

- The frontend API base URL points to `http://localhost:5000` by default.
- The Cloudflare Worker config is included in [server/wrangler.toml](/c:/Users/lQQ/OneDrive/Desktop/Projects/Rescue-link/server/wrangler.toml).
- The backend currently runs locally through `@hono/node-server`, which keeps MongoDB local development straightforward.
