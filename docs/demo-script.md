# LuxEstate Demo Script

Use this flow for a portfolio walkthrough or live interview.

## Setup

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
docker compose up -d
npm install
npm install --prefix frontend
npm run db:reset
```

Start the app in two terminals:

```bash
npm run dev
npm run dev:frontend
```

Frontend: `http://localhost:5173`  
API: `http://localhost:3000/api/health`

## Walkthrough

1. Open the homepage and use the hero search to filter by city.
2. Show the search page filters, chips, empty state, and show-more behavior.
3. Sign in as `owner1@luxestate.local` with the configured `SEED_USER_PASSWORD`.
4. Create a listing with uploaded or URL-based images.
5. Edit the listing from the listing detail or profile page and switch its
   status between active, draft, sold, or rented.
6. Sign in as another seeded user, save a listing, and confirm it appears in
   the saved listings area on the profile page.
7. Send an inquiry from a listing detail page.
8. Return to the owner profile, reply to the inquiry, then switch back to the
   sender profile to show the reply thread.
9. Run `npm run verify` to show the automated quality gate.
