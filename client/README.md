# RescueLink Frontend

React 18 + Vite + Tailwind CSS web app for finding wildlife first-aid guidance and local rescuers.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:5000`

### Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create .env file**

   ```bash
   cp .env.example .env
   ```

   Update `VITE_API_BASE_URL` if your backend is on a different URL.

3. **Start dev server**

   ```bash
   npm run dev
   ```

   App runs on `http://localhost:5173`

4. **Build for production**

   ```bash
   npm run build
   # Output in dist/
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 📂 Folder Structure

```
client/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx      # Home page
│   │   ├── Chat.jsx         # AI chat interface
│   │   ├── Rescuer.jsx      # Find rescuers
│   │   ├── Guide.jsx        # Quick animal guides
│   │   └── About.jsx        # About & disclaimer
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx   # Root layout
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── chat/
│   │   │   ├── ChatWindow.jsx      # Main chat container
│   │   │   ├── MessageBubble.jsx   # Single message
│   │   │   ├── QuickReplies.jsx    # Suggestion chips
│   │   │   ├── ChatInput.jsx       # Text input
│   │   │   └── AnimalSelector.jsx  # Animal picker
│   │   ├── rescuer/
│   │   │   ├── RescuerMap.jsx      # Leaflet map
│   │   │   ├── RescuerCard.jsx     # Contact card
│   │   │   └── LocationPrompt.jsx  # Geolocation UI
│   │   └── ui/
│   │       └── UIComponents.jsx    # Badge, Pill, Disclaimer
│   ├── hooks/
│   │   ├── useChat.js        # Chat state & streaming
│   │   ├── useGeolocation.js # Browser location
│   │   └── useRescuers.js    # Fetch & filter rescuers
│   ├── services/
│   │   └── api.js            # Axios + fetch wrappers
│   ├── utils/
│   │   └── formatters.js     # Formatting helpers
│   ├── constants/
│   │   └── animals.js        # Animal list & prompts
│   ├── App.jsx               # Router setup
│   ├── main.jsx              # Entry point
│   └── index.css             # Tailwind + global styles
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── package.json
```

## 🎨 Design System

### Colors (Tailwind extend)

- **Green** (primary): `#3B6D11` (600), `#27500A` (800)
- **Gray**: Standard Tailwind grays
- **Amber/Amber**: For warnings & disclaimers

### Components

- **Button**: `btn-primary`, `btn-secondary`, `btn-ghost`
- **Card**: `card` — rounded + border
- **Badge**: Color variants for status
- **Pill**: Clickable inline tag
- **Message bubbles**: `message-ai`, `message-user`

## 🔑 Key Features

### Landing Page (`/`)

- Hero section with two CTA buttons
- Features overview
- How it works (4 steps)
- Supported animals grid
- Final CTA banner

### Chat Page (`/chat`)

- Animal selector (desktop sidebar, mobile overlay)
- Real-time streaming AI response
- Quick reply suggestions
- Message history
- Disclaimer banner always visible

### Rescuer Page (`/rescuer`)

- Browser geolocation prompt
- Fallback manual city input
- Interactive Leaflet map
- Rescuer contact cards with distance
- Filter by specialty (birds, mammals, reptiles)
- Fallback helplines if no local rescuers

### Guide Page (`/guide`)

- Grid of animal quick-guide cards
- Basic do's & don'ts for each animal
- Link to "/chat?animal=X"

### About Page (`/about`)

- Mission statement
- How AI works (plain language)
- Full disclaimer
- Emergency contact numbers
- Tech stack credits

## 🎯 Hooks

### `useChat()`

Manages message array, streaming, and errors.

```javascript
const { messages, loading, error, sendMessage, clearMessages } = useChat();
```

### `useGeolocation()`

Browser location with reverse geocoding.

```javascript
const { location, city, loading, error, requestLocation, setManualCity } =
  useGeolocation();
```

### `useRescuers(city, userLat, userLng)`

Fetch & filter rescuers by city and specialty.

```javascript
const { rescuers, loading, error, filterBySpecialty, clearFilter } =
  useRescuers(city, lat, lng);
```

## 📡 API Integration

All API calls go through `src/services/api.js`:

```javascript
// Chat streaming
for await (const event of streamChatMessage(message, animal, history)) {
  // Handle token, done, or error
}

// Fetch rescuers
const rescuers = await fetchRescuers(city, specialty);

// Health check
const status = await checkHealth();
```

## 🌐 Environment Variables

**`.env` required:**

```
VITE_API_BASE_URL=http://localhost:5000
```

**Production:**

```
VITE_API_BASE_URL=https://api.rescuelink.com
```

## 📱 Responsive Design

- **Mobile first**: 375px minimum (iPhone SE)
- **Tablet**: 768px breakpoint
- **Desktop**: Full width layout optimization
- **Chat**: Single column on mobile, two-column on desktop
- **Map**: 200px on mobile, 300px on desktop

## 🚀 Deployment (Vercel)

1. **Push to GitHub**
2. **Connect to Vercel**: vercel.com/new
3. **Set environment variables** in Vercel dashboard:
   ```
   VITE_API_BASE_URL=https://api.rescuelink.com
   ```
4. **Deploy** — Vercel handles `npm run build`

### Build Output

- Output directory: `dist/`
- Optimized for production
- No source maps
- Tree-shaken dependencies

## 🛠️ Development

### Running Locally

```bash
npm run dev
# Opens http://localhost:5173
# Proxy configured to http://localhost:5000/api
```

### Hot Module Replacement (HMR)

Changes to components automatically reload in browser.

### Production Build

```bash
npm run build
npm run preview  # Test locally
```

## ⚡ Performance Tips

- Lazy loading: Routes via React Router
- Code splitting: Automatic with Vite
- Image optimization: Use web formats (next step)
- CSS: Tailwind purges unused classes
- Streaming: Fetch ReadableStream for chat (mobile Safari compatible)

## 🎯 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile Safari 14+
- ❌ IE11 (not supported)

## ✅ Quality Checklist

- [ ] No API key in frontend code
- [ ] CORS works with backend
- [ ] Chat streaming on mobile Safari
- [ ] Geolocation gracefully degrades
- [ ] All disclaimers visible
- [ ] No console.log in production
- [ ] Mobile viewport 375px tested
- [ ] Accessibility (alt text, labels)

## 🚨 Common Issues

### API Connection Failed

- Ensure backend is running: `npm run dev` in server/
- Check `VITE_API_BASE_URL` in .env
- Check browser console for CORS errors

### Geolocation Not Working

- Page must be HTTPS in production (localhost works)
- User must grant permission
- Fallback manual city input available

### Chat Streaming Broken

- Check backend is streaming correctly
- Verify ReadableStream API available
- Fallback to EventSource (if needed)

## 📊 Analytics (Optional)

Placeholder for future analytics integration.

## 🤝 Contributing

See main README for contribution guidelines.
