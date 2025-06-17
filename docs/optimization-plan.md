# LuxEstate Optimization Plan

This sweep focuses on the optimizations that make LuxEstate easier to trust,
maintain, and contribute to as an open-source project.

## Completed in this pass

- Added root-level API linting so backend code is checked by the same local and
  CI quality gate as tests and the frontend build.
- Hardened API id handling with strict MongoDB ObjectId validation before
  database lookups, avoiding accidental cast errors surfacing as server errors.
- Tightened listing payload validation for numeric ranges, whole-room counts,
  address length, and image URL schemes.
- Replaced the inline rate limiter with a tested reusable middleware that emits
  standard rate-limit response headers and sweeps expired entries.
- Added contributor-facing project hygiene: contribution guide, security policy,
  license file, PR template, and issue templates.
- Updated package metadata and kept `npm audit` passing after dependency lockfile
  refresh.
- Added functional marketplace depth for the showcase: saved listings, listing
  status management, sent inquiries, and reply threads.

## Next sensible improvements

- Move uploaded listing images to object storage, or add an upload ownership
  collection before automatic local file cleanup. Without ownership tracking, a
  cleanup job could delete another user's file if a copied local upload URL is
  reused.
- Add integration tests backed by an ephemeral MongoDB instance for auth,
  listing CRUD, and inquiry workflows.
- Add lightweight end-to-end checks for search, sign-in, listing creation, and
  inquiry submission.
- Add observability hooks for structured request logs and API error rates.
