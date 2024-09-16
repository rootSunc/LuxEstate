# LuxEstate

LuxEstate is a full-stack real estate web application built with:
- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: React, Vite, Redux Toolkit

## Features

- User authentication (email/password and Google OAuth)
- Listing creation, update, and deletion
- Listing search and filtering
- Profile management
- Image upload through backend API (`/api/listing/upload`)

## Requirements

- Node.js 18+
- npm 9+
- MongoDB connection string

## Environment Variables

Create a `.env` file in the project root:

```bash
MONGO=mongodb+srv://<user>:<password>@<cluster>/<database>
JWT_SECRET=replace_with_a_strong_secret
PORT=3000
PUBLIC_BASE_URL=http://localhost:3000
SEED_USER_PASSWORD=ChangeMe123!
```

Notes:
- `MONGO` and `JWT_SECRET` are required.
- `PUBLIC_BASE_URL` is optional but recommended for stable image URLs.
- `SEED_USER_PASSWORD` is optional and used by the database seed script.

## Install Dependencies

```bash
npm install
npm install --prefix frontend
```

## Run in Development

Backend:

```bash
npm run dev
```

Frontend:

```bash
npm run dev --prefix frontend
```

Frontend default URL: `http://localhost:5173`

## Database Initialization

Seed baseline users and listings:

```bash
npm run db:init
```

Reset existing seed users/listings and re-seed:

```bash
npm run db:reset
```

Seed users:
- `owner1@luxestate.local`
- `owner2@luxestate.local`
- `demo@luxestate.local`

Password for seeded users:
- Value of `SEED_USER_PASSWORD`
- If not set, defaults to `ChangeMe123!`

## Build Frontend

```bash
npm run build
```

## API Health Check

```bash
GET /api/health
```

## Important Routes

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/signout`
- `GET /api/auth/me`
- `GET /api/listing/get`
- `POST /api/listing/create`
- `PATCH /api/listing/update/:id`
- `DELETE /api/listing/delete/:id`
- `POST /api/listing/upload`

## Image Upload Constraints

- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Max file size: `5MB`
- Uploaded files are served from `/uploads`

## Troubleshooting

If backend startup fails with:

```text
MONGO and JWT_SECRET must be configured
```

set `MONGO` and `JWT_SECRET` in `.env` and restart the backend process.
