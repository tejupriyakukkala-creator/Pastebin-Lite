# Pastebin Lite

A fast, minimalist, and secure pastebin application designed for sharing text, code snippets, and notes with optional time-to-live (TTL) expiration and atomic view limits.

---

## Overview & Architecture

Pastebin Lite is organized as a decoupled full-stack monorepo:
- **Backend:** Node.js, Express, TypeScript, Mongoose, Zod validation, Helmet security headers, CORS, generous rate limiting, and structured logging via Pino.
- **Frontend:** Next.js (App Router), React, TypeScript, CSS Modules with global design tokens, Lucide icons, responsive layout, and full light/dark theme toggle.
- **Persistence:** MongoDB Atlas via Mongoose with atomic view count increments and secondary TTL cleanup indexing.
- **Testing:** Vitest, Supertest, and MongoMemoryServer supporting deterministic test clocks and concurrency verification.

---

## Persistence Layer

Pastebin Lite utilizes **MongoDB Atlas** managed document database paired with **Mongoose**.

### Design Decision & Rationale:
1. **Atomic Access Control:** To prevent race conditions under concurrent traffic, view counts are decremented atomically using MongoDB's `findOneAndUpdate` with a composite condition:
   ```javascript
   {
     pasteId: id,
     $and: [
       { $or: [ { expiresAt: null }, { expiresAt: { $gt: now } } ] },
       { $or: [ { maxViews: null }, { $expr: { $lt: ["$views", "$maxViews"] } } ] }
     ]
   }
   ```
   Updating `{ $inc: { views: 1 } }` in a single atomic database operation guarantees that when `max_views` is configured (e.g. 5 concurrent requests on a 5-view paste), exactly 5 requests succeed and subsequent requests are rejected.
2. **Deterministic Time Independence:** Documents store `purgeAt` independently from application expiry logic. `purgeAt` is indexed with MongoDB's background TTL index (`{ expireAfterSeconds: 0 }`) set to real server time plus `PURGE_GRACE_SECONDS` (default 24 hours). This prevents artificial client-supplied test clocks from accidentally triggering premature physical database purges while keeping disk usage bounded.
3. **No Global State:** No mutable global in-memory maps are used, ensuring horizontal scalability and compatibility across serverless and multi-instance container runtimes.

---

## Local Development & Setup

### Prerequisites
- Node.js >= 20.0.0
- npm >= 9.0.0
- A MongoDB Atlas connection string (or accessible MongoDB instance)

### 1. Install Dependencies
Install dependencies for both projects:
```bash
# In backend directory
cd backend
npm ci

# In frontend directory
cd ../frontend
npm ci
```

### 2. Configure Environment Variables
Create `.env` in both `backend/` and `frontend/` by copying the respective example files:

```bash
# Backend configuration
cd backend
cp .env.example .env

# Frontend configuration
cd ../frontend
cp .env.example .env
```

Set the required environment keys in `backend/.env`:
- `PORT`: Server port (e.g., 5000)
- `MONGODB_URI`: Your MongoDB Atlas URI (`mongodb+srv://<user>:<password>@<cluster>/pastebin_lite?retryWrites=true&w=majority`)
- `BASE_URL`: Public frontend origin used for constructing shareable links (e.g., the frontend address printed by the Next.js dev server or `https://your-frontend.example.com`)
- `FRONTEND_URL`: CORS origin allowed to communicate with the backend
- `TEST_MODE`: Set to `1` to enable deterministic time testing via `x-test-now-ms`

Set the required key in `frontend/.env`:
- `BACKEND_URL`: The host and port of the running backend server (e.g., the address printed by the backend dev server)

### 3. Run Backend
```bash
cd backend
npm run dev
```
The backend server will validate configuration, connect to MongoDB, verify indexes (`await Paste.init()`), and start listening on the configured port.

### 4. Run Frontend
```bash
cd frontend
npm run dev
```
The frontend dev server will launch and display its local listening address in the terminal. Next.js automatically rewrites `/api/*` requests to the configured `BACKEND_URL`.

### 5. Running Tests
To run backend unit and integration tests (including time boundary and concurrency checks):
```bash
cd backend
npm test
```

### 6. Building for Production
```bash
# Backend build
cd backend
npm run build

# Frontend build
cd ../frontend
npm run build
```

---

## API Documentation

All API responses return `Content-Type: application/json` and `Cache-Control: no-store`.

### 1. Health Check
- **Endpoint:** `GET /api/healthz` (alias: `GET /api/health`)
- **Status:** `200 OK` (or `503 Service Unavailable` if MongoDB ping fails)
- **Response:**
  ```json
  {
    "ok": true,
    "details": {
      "uptime_seconds": 360,
      "latency_ms": 12
    }
  }
  ```

### 2. Create Paste
- **Endpoint:** `POST /api/pastes`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "content": "Secret code snippet or note",
    "ttl_seconds": 3600,
    "max_views": 5
  }
  ```
  - `content`: Required non-empty string. Whitespace-only strings are rejected. Maximum 1,000,000 characters.
  - `ttl_seconds`: Optional integer >= 1 (max 315,360,000). `null` means unconstrained.
  - `max_views`: Optional integer >= 1 (max 1,000,000). `null` means unconstrained.
- **Success Response (201 Created):**
  ```json
  {
    "id": "abc123xyz456",
    "url": "https://your-frontend.example.com/p/abc123xyz456",
    "expires_at": "2026-10-15T12:00:00.000Z",
    "max_views": 5,
    "delete_token": "token_random_secret_string"
  }
  ```

### 3. Fetch Paste (Consumes View)
- **Endpoint:** `GET /api/pastes/:id`
- **Behavior:** Consumes exactly 1 view per successful call.
- **Success Response (200 OK):**
  ```json
  {
    "content": "Secret code snippet or note",
    "remaining_views": 4,
    "expires_at": "2026-10-15T12:00:00.000Z"
  }
  ```
- **Unavailable Cases (404 Not Found):**
  - Expired: `{ "success": false, "error": { "code": "PASTE_EXPIRED", "message": "Paste has expired" } }`
  - Limit Reached: `{ "success": false, "error": { "code": "PASTE_VIEW_LIMIT_REACHED", "message": "Paste view limit reached" } }`
  - Missing/Malformed: `{ "success": false, "error": { "code": "PASTE_NOT_FOUND", "message": "Paste not found" } }`

### 4. Paste Metadata (Non-Consuming)
- **Endpoint:** `GET /api/pastes/:id/meta`
- **Behavior:** Checks paste availability without consuming a view.
- **Response (200 OK):**
  ```json
  {
    "id": "abc123xyz456",
    "status": "available",
    "remaining_views": 4,
    "expires_at": "2026-10-15T12:00:00.000Z"
  }
  ```

### 5. Delete Paste
- **Endpoint:** `DELETE /api/pastes/:id`
- **Headers:** `Authorization: Bearer <delete_token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Paste deleted successfully"
  }
  ```

---

## Deterministic Time Testing

When `TEST_MODE=1` is set in the backend environment, the application supports deterministic expiry testing via the `x-test-now-ms` header:
```bash
curl -H "x-test-now-ms: 1750000000000" https://your-frontend.example.com/api/pastes/abc123xyz456
```
- The timestamp must be specified as an integer in milliseconds since the Unix epoch.
- If `TEST_MODE` is not `1`, the header is ignored and real system time is used.
- Expiration boundary: A paste is available strictly while `now < expiresAt`. At `now >= expiresAt`, the paste is considered expired.

---

## Automated Verification Script

An end-to-end verification script simulates the automated grader against any running deployment:

```bash
node scripts/verify.mjs <baseUrl>
```

Example:
```bash
node scripts/verify.mjs https://your-deployed-domain.example.com
```

The script verifies:
1. Health check HTTP 200 and JSON contract.
2. Paste creation, ID formatting, and shareable URL construction.
3. Content retrieval via API and HTML viewer `/p/:id`.
4. Max view count limits (burn after reading `max_views=1`, multi-view `max_views=2`).
5. Time-to-live before and after expiry using `x-test-now-ms`.
6. Combined dual constraints (TTL + View limit).
7. Input validation and 4xx JSON errors.
8. Safe escaping of script tags against XSS.
9. 30 concurrent fetches on a 5-view limit to prove zero view leakage under load.

---

## Production Deployment

### Backend (Render / Railway / Cloud Run)
1. Set the root directory or build context to `backend/`.
2. Build command: `npm ci && npm run build`
3. Start command: `npm start`
4. Health check path: `/api/healthz`
5. Configure Environment Variables:
   - `MONGODB_URI`: Production MongoDB Atlas connection string.
   - `BASE_URL`: The public production origin of the frontend application (e.g. `https://your-app.vercel.app`).
   - `FRONTEND_URL`: Same origin as `BASE_URL`.
   - `TEST_MODE`: `1` (required for automated grader checks).
   - `NODE_ENV`: `production`

### Frontend (Vercel)
1. Set Root Directory to `frontend/`.
2. Framework Preset: Next.js.
3. Configure Environment Variables:
   - `BACKEND_URL`: The public URL of the deployed backend service.
4. Deploy.

---

## System Limitations & Trade-offs

1. **Free-Tier Host Latency & Cold Starts:** On free-tier serverless or container hosting (such as free Render instances), dormant instances spin down after inactivity, causing initial health checks or requests to experience a 30-50 second cold-start delay.
2. **In-Memory Rate Limiting:** The default rate limiter uses an in-memory sliding window per instance. In a horizontally scaled multi-instance cluster, limits apply per instance rather than globally (can be upgraded to Redis in enterprise setups).
3. **Link Preview Crawlers:** Visiting `/p/:id` in an HTML browser or via social media bots (Slack/Discord link unfurling) initiates an HTTP GET request which consumes one view.
4. **Platform Body Limits:** Payloads near the 1,000,000 character limit may approach 1-4MB depending on Unicode encoding; hosting platform reverse proxies must allow the configured `BODY_LIMIT` (default 4MB).
