# LuxEstate

LuxEstate is a full-stack real estate marketplace demo built to show production-minded CRUD, authentication, search, image upload, and owner inquiry workflows.

## Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: React, Vite, Redux Toolkit, Tailwind CSS
- Auth: HTTP-only JWT session cookies, email/password, Firebase Google sign-in verification
- Quality: Vitest unit tests, ESLint, npm audit, GitHub Actions CI

## Product Capabilities

- Browse rent and sale listings from a search-first homepage.
- Filter listings by type, offer, parking, furnished state, and sort order.
- Create and update listings with validated fields and up to 6 images.
- Upload images through the API with MIME and file signature validation.
- View listing detail pages with gallery thumbnails, facts, map embed, share action, and owner contact.
- Send and manage owner inquiries from the profile dashboard.
- Seed demo users and listings for repeatable walkthroughs.

## Quick Start

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
docker compose up -d
npm install
npm install --prefix frontend
npm run db:reset
```

Run the API and frontend in separate terminals:

```bash
npm run dev
npm run dev:frontend
```

Frontend: `http://localhost:5173`

API health check: `http://localhost:3000/api/health`

## Environment

Root `.env`:

```bash
MONGO=mongodb://localhost:27017/luxestate
JWT_SECRET=replace_with_a_strong_secret_at_least_32_chars
FIREBASE_PROJECT_ID=lux-estate-5643b
PORT=3000
PUBLIC_BASE_URL=http://localhost:3000
UPLOAD_DIR=uploads
SEED_USER_PASSWORD=ChangeMe123!
```

Frontend `.env`:

```bash
VITE_FIREBASE_API_KEY=replace_with_firebase_web_api_key
```

`MONGO` and `JWT_SECRET` are required for the API. `FIREBASE_PROJECT_ID` is required for Google OAuth because the API verifies Firebase ID tokens before creating a LuxEstate session.

## Demo Users

After `npm run db:reset`, use the configured `SEED_USER_PASSWORD` for:

- `owner1@luxestate.local`
- `owner2@luxestate.local`
- `demo@luxestate.local`

## Scripts

```bash
npm run dev            # API server
npm run dev:frontend   # Vite frontend
npm run db:init        # Upsert seed users/listings
npm run db:reset       # Reset seed users/listings
npm test               # Vitest contract/unit tests
npm run verify         # audit + tests + frontend lint/build
npm run build          # frontend production build
```

## API Surface

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/google`
- `POST /api/auth/signout`
- `GET /api/auth/me`

Listings:

- `GET /api/listings`
- `GET /api/listings/:id`
- `POST /api/listings`
- `PATCH /api/listings/:id`
- `DELETE /api/listings/:id`
- `POST /api/listings/upload`

Inquiries:

- `POST /api/inquiries`
- `GET /api/inquiries/mine`
- `PATCH /api/inquiries/:id/read`

Legacy `/api/listing/*` routes remain mounted for backwards compatibility.

## Quality Gate

Local and CI verification run:

```bash
npm audit --audit-level=moderate
npm test
npm audit --audit-level=moderate --prefix frontend
npm run lint --prefix frontend
npm run build --prefix frontend
```

## Architecture And Demo

- [Architecture notes](docs/architecture.md)
- [Demo script](docs/demo-script.md)

## Deployment Notes

The current upload implementation stores files in `UPLOAD_DIR` and serves them from `/uploads`. This is suitable for local demos and single-node deployments. For serverless production, move image storage to S3, R2, or Cloudinary and store only public asset URLs in MongoDB.
