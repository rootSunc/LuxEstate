# Contributing to LuxEstate

Thanks for helping improve LuxEstate. This project is intentionally small enough
to review quickly, but it aims to keep production-minded habits around quality,
security, and documentation.

## Development setup

1. Install Node.js 20.20 or newer. CI currently runs on Node.js 22.
2. Install dependencies:

   ```bash
   npm install
   npm install --prefix frontend
   ```

3. Copy environment files:

   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   ```

4. Start MongoDB and seed demo data:

   ```bash
   docker compose up -d
   npm run db:reset
   ```

5. Run the API and frontend in separate terminals:

   ```bash
   npm run dev
   npm run dev:frontend
   ```

## Quality checks

Run the full local gate before opening a pull request:

```bash
npm run verify
```

For quicker loops:

```bash
npm run lint
npm test
npm run build
```

## Pull request expectations

- Keep changes scoped to one problem or product improvement.
- Add or update tests when behavior changes.
- Update README or docs when setup, API behavior, or user-facing workflows
  change.
- Avoid committing local `.env` files, generated builds, or personal uploads.
