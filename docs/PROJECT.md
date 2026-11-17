# cognis — project knowledge base

Cognis is a simple face-recognition based attendance system. Members enroll a face once; at an event they stand in front of a camera, the app recognizes them and records attendance. Admins manage members, events and attendance reports.

Status: scaffold only (commit `923dac2`). This document is the intended design, not a description of implemented features.

## Product requirements

### Admin dashboard
- **Members management** — create, list, edit, deactivate members; enroll/update their face.
- **Events management** — create and manage events (name, schedule, location, status).
- **Attendance report** — per-event attendance list; who attended, when; export.

### Main user page
- **Submit face** — capture from camera so the member can be recognized (enrollment or check-in).
- **Submit attendance** — identify the member from a captured face and record attendance for the active event.

## Architecture

```
Browser (Next.js)
  camera frame -> face detection -> crop -> embedding (client-side)
        |  POST embedding (+ event id)
        v
NestJS API
  -> pgvector similarity search over face_embeddings
  -> nearest member above threshold
  -> insert attendance row (idempotent per member/event)
  -> respond member + attendance status
        |
        v
PostgreSQL + pgvector
```

### Frontend responsibilities
- Camera access and frame capture (`getUserMedia`).
- Face detection and alignment in the browser.
- Embedding extraction in the browser (per requirements).
- Calling the backend with the numeric embedding; rendering match result and attendance state.
- Admin CRUD screens and attendance report.

### Backend responsibilities
- Own all persistence (Postgres) and business rules.
- Store enrolled embeddings with member id, model name and dimension.
- 1:N nearest-neighbor lookup via pgvector, with a configurable similarity threshold.
- Persist attendance scoped to an event, avoiding duplicates.
- Serve admin APIs and reports. No raw video is required by the design.

Backend must stay model-agnostic but must validate the embedding dimension/model it accepts. The frontend and backend must agree on one embedding model and version.

## Proposed stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Frontend | Next.js 16 App Router, React 19, Tailwind CSS 4 | Already scaffolded |
| Backend | NestJS 12, ESM, Vitest | Already scaffolded |
| Primary DB | PostgreSQL | Planned |
| Vector search | pgvector extension | Suggested; stores embeddings in the primary DB |
| Face/embedding | Browser-side library, TBD | Open decision, see `MEMORY.md` |
| API contract | REST + OpenAPI | `@nestjs/swagger` is first-party |

Nest first-party packages should be checked before adding third-party libraries (see `backend/AGENTS.md`): `@nestjs/typeorm` or `@nestjs/drizzle` for Postgres, `@nestjs/config`, `@nestjs/swagger`, `@nestjs/throttler`, `@nestjs/terminus`.

## Draft data model

Names are provisional; pick one ORM and keep migrations in the backend.

```sql
-- extension
CREATE EXTENSION IF NOT EXISTS vector;

members (
  id           uuid primary key,
  full_name    text not null,
  identifier   text unique,          -- student no. / employee no.
  email        text unique,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

face_embeddings (
  id           uuid primary key,
  member_id    uuid not null references members(id) on delete cascade,
  embedding    vector(512) not null,  -- dimension depends on model
  model        text not null,         -- e.g. "arcface-r100", "face-api-128"
  quality      real,                  -- optional capture score
  created_at   timestamptz not null default now()
);
CREATE INDEX ON face_embeddings USING hnsw (embedding vector_cosine_ops);

events (
  id           uuid primary key,
  name         text not null,
  description  text,
  location     text,
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  status       text not null default 'draft',  -- draft | active | closed
  created_at   timestamptz not null default now()
);

attendance (
  id                 uuid primary key,
  event_id           uuid not null references events(id) on delete cascade,
  member_id          uuid not null references members(id) on delete cascade,
  checked_in_at      timestamptz not null default now(),
  similarity_score   real not null,
  matched_embedding  uuid references face_embeddings(id),
  source             text not null default 'face',  -- face | manual
  unique (event_id, member_id)
);
```

Notes:
- The `unique (event_id, member_id)` constraint makes check-in idempotent; treat a repeat scan as "already checked in" rather than an error.
- HNSW index is good for online lookups; IVFFlat needs training data. Both depend on the chosen distance operator — match it exactly (`vector_cosine_ops` with `<=>`).
- Store the model name so embeddings from different models are never mixed. A model change requires re-enrollment.

## Draft API

```
POST   /members                     create member
GET    /members                     list/search members
GET    /members/:id
PATCH  /members/:id
DELETE /members/:id                 soft delete (is_active = false)

POST   /members/:id/embeddings      enroll one face embedding
GET    /members/:id/embeddings      count/metadata, never return vectors to clients
DELETE /members/:id/embeddings/:eid

POST   /events
GET    /events                      filter by status/date
GET    /events/:id
PATCH  /events/:id

POST   /attendance/identify         { embedding, eventId } -> match or no-match
POST   /attendance                  confirm check-in (optional two-step flow)
GET    /events/:id/attendance       report rows for an event
GET    /events/:id/attendance.csv   export

GET    /health                      readiness/liveness
```

`POST /attendance/identify` should not leak member lists on failure: return `matched: false` with a generic reason. The optional two-step flow (identify, then confirm) makes manual correction possible; the single-step flow is simpler for the user page.

## Key risks and constraints

- **Biometrics are sensitive data.** Embeddings are personal data. Keep them server-side, never expose vectors in API responses or logs, require consent for enrollment, and allow deletion of a member's embeddings. Admin endpoints need auth before this goes anywhere real.
- **Matching quality.** A fixed threshold will produce false accepts/negatives. Plan to tune it against enrolled data and to surface confidence. Consider rejecting low-quality captures at the frontend.
- **Multiple faces in frame.** Define behavior: use the largest face, or reject until exactly one face is present.
- **Liveness / spoofing** (photo of a photo) is out of scope for v1; record it as known debt.
- **Browser embedding cost.** Model download size and inference speed matter on low-end phones; prefer a small model and load it lazily.
- **Event scoping.** Attendance must belong to an event. Decide how the user page knows which event is active (admin-selected active event, QR code, or URL path).

## Out of scope for v1

- Payroll/HR integration, notifications, offline mode, native mobile apps.
- Anti-spoofing / liveness detection.
- Multi-tenant organizations.
