# RescueLink Project Description

## Overview

RescueLink is a wildlife first-aid and rescuer discovery web application built for people who find injured, trapped, abandoned, or distressed animals and need quick guidance. The project combines an AI-powered first-aid chat experience, optional animal photo review, a verified local rescuer directory, map-based rescuer discovery, and an admin moderation system for managing rescuer records.

The application is designed around two urgent user needs:

1. Get immediate, calm, practical first-aid steps for a wild or domestic animal emergency, with optional photo context.
2. Find verified rescuers near the user's city and contact them quickly through phone, WhatsApp, or map directions.

The current implementation focuses on Karnataka coverage, including Bangalore, Mysore, Mangalore, Hubli-Dharwad, Belgaum, Bylakuppe, and Madikeri data points. Hubli, Hubballi, Dharwad, and related aliases are normalized to `hubli-dharwad` so users can search using common city names.

## Problem Statement

When someone finds an injured animal, they often do not know whether to touch it, feed it, move it, isolate it, or contact a specialist. Bad advice can harm the animal and endanger the person helping. At the same time, rescuer information is often scattered across social media, outdated posts, and personal contacts.

RescueLink addresses this by providing:

- A single place for emergency wildlife first-aid guidance.
- Optional photo upload so users can share visual context with the AI chat.
- A verified directory of rescuers.
- City-based and location-assisted rescuer discovery.
- Specialty filters for birds, mammals, reptiles, dog/cat rescue, and general rescue.
- A submission form so the community can suggest new rescuers.
- An admin panel so submitted rescuers can be verified before public display.

## Target Users

Primary users:

- People who find injured animals and need immediate guidance.
- Students, residents, and volunteers who want to contact nearby rescuers.
- People in Karnataka searching for wildlife rescue contacts.

Secondary users:

- Wildlife rescuers and NGOs who want to be discoverable.
- RescueLink admins who verify, approve, disable, or update rescuer records.
- Community members who know a rescuer and want to submit their contact details.

## Main Features

### 1. AI Wildlife First-Aid Chat

The chat feature lets users select an animal, describe the situation, and optionally upload a photo of the animal. The backend sends the text and image context to an AI model through OpenRouter and streams the response back to the frontend in real time.

Supported animals include:

- Squirrel
- Pigeon
- Sparrow
- Rabbit
- Crow
- Mongoose
- Owl
- Deer
- Monitor Lizard
- Bat
- Snake
- Other

The chat is intended to provide practical first-aid guidance such as:

- Whether the animal should be isolated.
- How to safely contain the animal.
- Whether feeding should be avoided.
- When professional rescue help is required.
- What not to do in risky situations.

Photo support:

- Users can attach one image per chat message.
- Supported formats are JPG, PNG, and WebP.
- The frontend validates image type and size before sending.
- The user sees an image preview before submitting.
- Uploaded images are shown inside the user chat bubble for context.
- The backend validates image payloads and sends them to OpenRouter using a vision-compatible chat message format.
- If image analysis fails during a demo or API issue, the backend streams a local safety fallback instead of leaving the user with no guidance.

The AI prompt is stored on the server, not in frontend code. This keeps the safety instructions centralized and prevents exposing internal prompt logic to users. The prompt is written so the AI responds like a calm, experienced wildlife rescue volunteer speaking to a stressed person.

### 2. Rescuer Finder

The rescuer finder helps users locate verified rescuers by city.

Key behavior:

- Users can allow browser location access.
- If location is accurate, the app reverse geocodes coordinates and matches them to a supported city.
- If browser location is too approximate, the app falls back to Hubli-Dharwad instead of trusting a wrong location.
- Users can manually enter or change the city.
- City aliases are normalized, for example:
  - `hubli`, `hubballi`, `dharwad`, `hubli dharwad` -> `hubli-dharwad`
  - `bengaluru` -> `bangalore`
  - `mysuru` -> `mysore`
  - `mangaluru` -> `mangalore`
  - `belagavi` -> `belgaum`

The page displays:

- Current matched city.
- Refresh location button.
- Interactive Leaflet map.
- Verified rescuer cards.
- Specialty filters.
- Contact options.

### 3. Interactive Map

The rescuer map uses Leaflet and OpenStreetMap tiles. It plots rescuer coordinates and lets users visually understand where listed rescuers are located.

The map is shown when:

- Rescuers are available.
- User location or manually selected city coordinates are available.

Each rescuer marker can show rescuer identity and address/city context.

### 4. Rescuer Cards

Each rescuer card shows important contact and verification details, including:

- Rescuer or organization name.
- Specialty tags.
- Verification status.
- Phone number.
- WhatsApp link if available.
- Address or city.
- Distance from user coordinates when available.
- Directions link through Google Maps when coordinates exist.

The goal is to make emergency contact fast and reduce unnecessary searching.

### 5. Specialty Filtering

Users can filter rescuers by:

- All
- Bird rescue
- Wildlife rescue
- Snake/Reptile rescue

The backend supports specialty filtering using rescuer specialties. Rescuers marked as `all` can be returned for specialty searches where appropriate.

### 6. Community Rescuer Submission

The `Know a Rescuer?` page lets users submit rescuer details for review.

Submitted data can include:

- Rescuer name.
- City.
- Phone.
- WhatsApp.
- Specialties.
- NGO name.
- Instagram.
- Notes.
- Submitter email.
- Submitter phone.

Community submissions are not immediately visible to public users. They are stored as pending records and require admin approval.

### 7. Admin Moderation System

The admin section supports managing rescuer records.

Admin pages include:

- Admin login.
- Dashboard.
- Pending rescuers.
- Verified rescuers.
- Add rescuer.

Admin actions include:

- Login with email and password.
- View dashboard stats.
- Review pending rescuer submissions.
- Approve or reject submitted rescuers.
- Disable or enable verified rescuers.
- Delete rescuer records.
- Add verified rescuers directly.
- Edit rescuer records.
- Filter verified rescuers by city or specialty.

Authentication uses JWT tokens. Admin passwords are hashed with bcrypt before being stored.

### 8. Static Guide Pages

The guide page provides quick animal-specific do's and don'ts. These guide cards act as a fast reference and can route users into the chat flow for more detailed help.

The about page explains the mission, limitations, safety disclaimer, and project context.

## Frontend Architecture

The frontend is built with:

- React 18
- Vite
- Tailwind CSS
- React Router
- Leaflet
- React Leaflet
- Axios

Important frontend directories:

```text
client/src/pages
client/src/components
client/src/hooks
client/src/services
client/src/utils
client/src/constants
```

Important pages:

- `/` - Landing page.
- `/chat` - AI first-aid chat.
- `/rescuer` - Rescuer finder.
- `/find-rescuer` - Alternate route for rescuer finder.
- `/guide` - Animal quick guides.
- `/about` - Project information and disclaimer.
- `/know-a-rescuer` - Community rescuer submission form.
- `/admin/login` - Admin login.
- `/admin/dashboard` - Admin dashboard.
- `/admin/pending-rescuers` - Pending rescuer moderation.
- `/admin/verified-rescuers` - Verified rescuer management.
- `/admin/add-rescuer` - Admin add-rescuer form.

Important hooks:

- `useChat` manages chat messages, optional image attachments, streaming responses, loading state, and errors.
- `useGeolocation` handles browser geolocation, reverse geocoding, fallback city behavior, and manual city selection.
- `useRescuers` fetches rescuer data, applies specialty filters, computes distance, and sorts results.

Important services:

- `api.jsx` defines API base URL, chat streaming logic, rescuer fetching, city fetching, and community submission.
- `authService.js` handles admin authentication-related API calls.

## Backend Architecture

The backend is built with:

- Hono
- Node local server through `@hono/node-server`
- MongoDB
- Mongoose
- JSON Web Tokens
- bcryptjs
- OpenRouter for AI chat completions
- Wrangler configuration for Cloudflare Worker deployment support

Important backend directories:

```text
server/src/routes
server/src/models
server/src/config
server/src/middleware
server/src/utils
server/src/prompts
server/data
```

Main backend entry:

- `server/src/index.js`

The backend exposes these route groups:

- `/api/health`
- `/api/chat`
- `/api/rescuers`
- `/api/admin`

## API Summary

### Health

```http
GET /api/health
```

Returns server health and timestamp.

### Chat

```http
POST /api/chat
```

Accepts:

- `message`
- `animal`
- `conversationHistory`
- `image` with a `dataUrl`, `name`, `type`, and `size` when a photo is uploaded

Returns a streaming response with AI-generated first-aid guidance. If an image is included, the backend asks the model to describe only visible signs, avoid diagnosis certainty, and give safe first-aid steps.

### Public Rescuers

```http
GET /api/rescuers?city=hubli&specialty=birds
```

Returns verified, approved, enabled rescuers for the requested city.

Behavior:

- Normalizes city aliases.
- Filters by specialty if provided.
- Returns local rescuers first.
- Falls back to nearest known city with verified rescuers if local coverage is empty.

### Rescuer Cities

```http
GET /api/rescuers/cities
```

Returns cities that currently have verified rescuer coverage and their counts.

### Community Submission

```http
POST /api/rescuers/submit
```

Creates a pending rescuer submission.

### Admin Login

```http
POST /api/admin/login
```

Authenticates an admin and returns a token.

### Admin Management

Admin routes support dashboard stats, pending rescuer review, verified rescuer listing, adding, editing, approving, rejecting, disabling, enabling, and deleting rescuers.

## Database Models

### Rescuer

The rescuer model stores public and administrative rescuer information.

Main fields:

- `name`
- `city`
- `phone`
- `whatsapp`
- `specialties`
- `available24hr`
- `lat`
- `lng`
- `address`
- `verified`
- `status`
- `addedBy`
- `disabled`
- `ngoName`
- `instagram`
- `notes`
- `submitterEmail`
- `submitterPhone`
- `submittedAt`
- `verifiedAt`
- `rejectedAt`
- `verifiedBy`
- `updatedBy`

Indexes:

- `city`
- `verified`
- `status`
- `disabled`
- `city + verified`
- `lat + lng`

### Admin

The admin model stores moderation user accounts.

Main fields:

- `email`
- `password`
- `name`
- `isActive`
- `role`
- `lastLogin`

Passwords are hashed before saving.

### ModerationLog

The moderation log tracks admin actions.

Actions include:

- `verify`
- `reject`
- `disable`
- `enable`
- `delete`
- `add`
- `edit`

## City and Location Logic

City normalization exists on both frontend and backend to keep behavior consistent.

Supported city coordinates include:

- Bangalore
- Mysore
- Mangalore
- Hubli-Dharwad
- Bylakuppe
- Madikeri
- Belgaum

The frontend geolocation flow:

1. Ask the browser for location.
2. Check coordinate accuracy.
3. If accuracy is too low, show Hubli-Dharwad as the fallback city.
4. If accuracy is acceptable, reverse geocode coordinates with Nominatim.
5. Normalize the returned city name.
6. If reverse geocoding fails, use the nearest supported city within the fallback radius.
7. Let the user manually change the city at any time.

This prevents incorrect browser/IP-based estimates from showing a wrong city such as Bylakuppe when the user is actually in Hubli.

## AI Safety Approach

The AI chat is built as a first-aid helper, not as a replacement for professional veterinary or wildlife rescue help.

The AI is expected to:

- Start with a reassuring sentence.
- Give calm and practical instructions in short, scannable sections.
- Use a rescue-volunteer tone rather than a textbook tone.
- Avoid certainty in diagnosis.
- Recommend professional rescue help for serious cases.
- Warn users not to handle dangerous animals directly.
- Encourage safe containment only when appropriate.
- Avoid unsafe feeding or treatment instructions.
- Mention what to avoid.
- End with the disclaimer: "This advice is temporary first aid only and does not replace professional wildlife care."

The current response structure is:

- `What to do now:`
- `Avoid:`
- `Get professional help if:`
- Short first-aid disclaimer

For uploaded photos, the AI is instructed to use the image only for visible signs and not to diagnose from the image alone.

The frontend also includes disclaimer messaging to make it clear that the guidance is informational and emergency cases should be handled by qualified rescuers or authorities.

## Local Development Setup

### Prerequisites

- Node.js 18 or newer.
- MongoDB running locally or accessible through a connection string.
- OpenRouter API key for AI chat.

### Client Setup

```bash
cd client
npm install
npm run dev
```

Client runs at:

```text
http://localhost:5173
```

Client environment variable:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Server Setup

```bash
cd server
npm install
npm run seed
npm run dev
```

Server runs at:

```text
http://localhost:5000
```

Server environment variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rescuelink
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_VISION_MODEL=openai/gpt-4o-mini
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
```

## Build and Verification

Frontend production build:

```bash
cd client
npm run build
```

Backend dry-run build/deploy check:

```bash
cd server
npm run build
```

Database seeding:

```bash
cd server
npm run seed
```

## Security Considerations

- OpenRouter API key is kept on the backend only.
- Admin routes are protected with JWT verification.
- Admin passwords are hashed with bcryptjs.
- Community-submitted rescuers are pending by default.
- Public rescuer queries only return verified, approved, enabled rescuers.
- CORS is restricted to the configured frontend URL.
- The app does not intentionally store user browser location.

## Current Limitations

- City coverage is limited to seeded and approved rescuer data.
- Browser geolocation can still be approximate depending on device, browser, and network.
- The AI provides first-aid guidance but cannot physically verify animal condition.
- Photo analysis can describe visible signs only and cannot confirm diagnosis, pain level, fracture, disease, or survival chances.
- Vision support depends on the configured OpenRouter model supporting image input.
- Some rescuer records may need periodic manual review to stay current.
- Production deployment configuration exists, but full production hardening depends on final hosting and database choices.

## Future Enhancements

Possible improvements:

- Expand verified rescuer coverage across more cities and states.
- Add rescuer availability schedules.
- Add emergency authority contact shortcuts by region.
- Improve photo upload with multiple images, compression, and clearer image-quality guidance.
- Add better geospatial querying with radius search.
- Add admin analytics for submission volume and city coverage.
- Add rescuer self-claim and profile update workflow.
- Add SMS or WhatsApp-based contact workflow.
- Add multilingual support for Kannada, Hindi, and other regional languages.
- Add stronger automated tests for chat streaming, city normalization, and admin workflows.

## Project Value

RescueLink is useful because it reduces confusion during animal emergencies. It gives users fast guidance, local contacts, map context, and a path to contribute new rescuer information. The admin approval workflow helps keep public contact data trustworthy, while the AI chat gives immediate first-aid direction until a qualified rescuer can be reached.
