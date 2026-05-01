# RescueLink Backend API

Hono + Cloudflare Workers backend for RescueLink. Handles AI chat streaming and rescuer lookups.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017/rescuelink`)
- OpenRouter API key

### Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create .env file**

   ```bash
   cp .env.example .env
   ```

   Then fill in:
   - `MONGODB_URI` — your MongoDB connection string
   - `OPENROUTER_API_KEY` — your OpenRouter API key
   - `OPENROUTER_MODEL` — optional model override, defaults to `openai/gpt-4o-mini`
   - `CLIENT_URL` — frontend URL (http://localhost:5173 for dev)

3. **Seed the database with rescuers**

   ```bash
   npm run seed
   ```

   This populates MongoDB with verified rescuers for 5 Karnataka cities.

4. **Start the dev server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

## 📚 API Routes

### Health Check

```
GET /api/health
```

Returns `{ status: "ok", timestamp: "..." }`

### Chat (Streaming)

```
POST /api/chat
Content-Type: application/json

{
  "message": "I found an injured pigeon",
  "animal": "pigeon",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:** Server-sent events (SSE) stream with tokens

### Rescuers by City

```
GET /api/rescuers?city=bangalore&specialty=birds
```

Returns array of verified rescuers for that city/specialty.

### All Cities with Rescuers

```
GET /api/rescuers/cities
```

Returns list of cities that have rescuer data.

### Submit Rescuer (Unverified)

```
POST /api/rescuers
Content-Type: application/json

{
  "name": "Local Wildlife Shelter",
  "city": "bangalore",
  "phone": "+91-...",
  "whatsapp": "+91-...",
  "specialties": ["birds", "mammals"],
  "lat": 12.9716,
  "lng": 77.5946,
  "address": "..."
}
```

Returns `{ message: "...", rescuerId: "..." }` with status 201

## 🗂️ Folder Structure

```
server/
├── src/
│   ├── index.js                   # Hono app entry point
│   ├── routes/
│   │   ├── chat.js                # POST /api/chat
│   │   └── rescuers.js            # GET/POST /api/rescuers
│   ├── models/
│   │   └── Rescuer.js             # Mongoose schema
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── middleware/
│   │   └── errorHandler.js        # Error handling
│   └── prompts/
│       └── wildlifeSystemPrompt.js # AI system prompt
├── data/
│   └── seed.js                    # Database seeding script
├── dev.js                         # Local Node.js dev server
├── wrangler.toml                  # Cloudflare Workers config
├── .env.example                   # Environment template
└── package.json
```

## 🔌 Database Schema

### Rescuer

```javascript
{
  _id: ObjectId,
  name: String,
  city: String (lowercase, indexed),
  phone: String,
  whatsapp: String (optional),
  specialties: [String] (enum: 'mammals', 'birds', 'reptiles', 'all'),
  available24hr: Boolean,
  lat: Number,
  lng: Number,
  address: String,
  verified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- `city` — for fast city lookups
- `city + verified` — efficient filtering
- `lat + lng` — for geographic queries

## 🤖 AI System Prompt

The AI system prompt is defined in `src/prompts/wildlifeSystemPrompt.js`. It instructs the model to:

- Be calm and reassuring
- Provide actionable, specific steps
- Ask follow-up questions
- Recommend professional help for serious cases
- Never diagnose with certainty

The frontend never sees the system prompt — it's always used server-side only.

## 🚀 Deployment

### Cloudflare Workers

```bash
npm run deploy
```

Before deploying, set secrets:

```bash
wrangler secret put MONGODB_URI
wrangler secret put OPENROUTER_API_KEY
```

### Environment Variables (Production)

- `MONGODB_URI` — Atlas or self-hosted
- `OPENROUTER_API_KEY` — OpenRouter API key
- `OPENROUTER_MODEL` — optional model override
- `CLIENT_URL` — Your production frontend domain
- `NODE_ENV` — Set to 'production'

## 🛠️ Development

### Running Locally

```bash
npm run dev
# Runs on http://localhost:5000
```

### Testing Chat Streaming

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Found an injured sparrow", "animal":"sparrow", "conversationHistory":[]}'
```

### Reseeding Database

```bash
npm run seed
# Clears existing rescuers and imports fresh data
```

## 📊 Database Stats

After seeding, you should have:

- **Bangalore**: 5+ rescuers
- **Mysore**: 5+ rescuers
- **Mangalore**: 5+ rescuers
- **Hubli-Dharwad**: 5+ rescuers
- **Belgaum**: 5+ rescuers

All marked as `verified: true`. Future user submissions will have `verified: false` until approved.

## ⚠️ Common Issues

### MongoDB Connection Failed

- Ensure MongoDB is running: `mongod` or Docker `docker run -d -p 27017:27017 mongo`
- Check `MONGODB_URI` in .env

### API Key Auth Failed

- Verify `OPENROUTER_API_KEY` is correct and not expired
- Check OpenRouter usage limits

### CORS Errors

- Ensure `CLIENT_URL` in .env matches your frontend domain
- In production, update CORS to your production domain

## 📞 Support

For issues or feature requests, check the main README or open a GitHub issue.
