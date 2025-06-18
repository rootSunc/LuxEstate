# LuxEstate Architecture

```mermaid
flowchart LR
  Browser["Buyer / owner browser"]:::client

  subgraph Frontend["React Frontend"]
    direction TB
    Pages["Route pages<br/>Home, Search, Listing, Profile"]:::frontend
    State["Redux Toolkit<br/>persisted session state"]:::frontend
    ApiClient["API client<br/>fetch with credentials"]:::frontend
    Pages --> State
    Pages --> ApiClient
  end

  subgraph Api["Express API"]
    direction TB
    Edge["Security edge<br/>headers, rate limit, cookies"]:::api
    Auth["Auth controllers<br/>email/password and Google"]:::api
    Listings["Listing controllers<br/>CRUD, search, status"]:::api
    Inquiries["Inquiry controllers<br/>messages, replies, read state"]:::api
    Upload["Upload endpoint<br/>MIME, signature, 5 MB cap"]:::api
    Validators["Validation layer<br/>payloads, ObjectIds, image URLs"]:::api
    Models["Mongoose models<br/>User, Listing, Inquiry"]:::api
    Edge --> Auth
    Edge --> Listings
    Edge --> Inquiries
    Edge --> Upload
    Listings --> Validators
    Upload --> Validators
    Auth --> Models
    Listings --> Models
    Inquiries --> Models
  end

  subgraph Data["Persistence and Assets"]
    direction TB
    Mongo[(MongoDB<br/>users, listings, inquiries)]:::store
    Uploads[(Local uploads<br/>/uploads)]:::store
    Session["HTTP-only JWT cookie<br/>browser session"]:::external
    Firebase["Firebase public certs<br/>Google ID token verification"]:::external
  end

  Browser -->|browse and manage| Pages
  ApiClient -->|/api/* with credentials| Edge
  Auth --> Session
  Auth --> Firebase
  Models --> Mongo
  Upload --> Uploads

  classDef client fill:#eff6ff,stroke:#60a5fa,stroke-width:1px,color:#0f172a;
  classDef frontend fill:#ecfeff,stroke:#22d3ee,stroke-width:1px,color:#164e63;
  classDef api fill:#f0fdf4,stroke:#22c55e,stroke-width:1px,color:#14532d;
  classDef store fill:#fff7ed,stroke:#fb923c,stroke-width:1px,color:#7c2d12;
  classDef external fill:#f8fafc,stroke:#94a3b8,stroke-width:1px,color:#334155;
  style Frontend fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px,color:#0f172a;
  style Api fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px,color:#0f172a;
  style Data fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px,color:#0f172a;
```

## Request Flow

1. The React app calls `/api/*` with `credentials: include`.
2. The API stores the LuxEstate session in an HTTP-only `access_token` cookie.
3. Email/password users are validated against MongoDB.
4. Google users send a Firebase ID token, which the API verifies against Firebase public signing certificates before creating a local session.
5. Listings and inquiries are stored in MongoDB. Uploaded images are validated by MIME type and file signature, then served from `/uploads`.

## Key Boundaries

- `api/controllers/*`: request orchestration and authorization.
- `api/validators/*`: testable request and file validation contracts.
- `api/models/*`: persistence schemas.
- `frontend/src/components/*`: reusable UI surfaces.
- `frontend/src/pages/*`: route-level screens and data fetching.
- `frontend/src/utils/*`: API, upload, and formatting helpers.

## Production Notes

Local file uploads are acceptable for the demo and single-node deployments. For a production serverless deployment, replace `UPLOAD_DIR` with object storage such as S3, R2, or Cloudinary and persist only the public asset URL in `Listing.imageUrls`.
