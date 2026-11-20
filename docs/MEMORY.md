# Memory

Working memory for agents. Update this file as decisions are made. Anything marked "planned" or "open" is not implemented.

## Current state (2026-11-17)

- Repo is a two-app monorepo at commit `923dac2` — scaffold plus these docs.
- `backend/`: fresh NestJS 12 app. Only `AppController` (`GET /` -> "Hello World!"), `AppService`, `AppModule`, `main.ts`. One spec, one e2e spec. No DB, config, auth, validation, CORS, Swagger, or modules yet.
- `frontend/`: Next.js 16 app with the default landing page (`src/app/page.tsx`) and an admin shell. `/admin` redirects to `/admin/members`. The members page is a client-side list UI with mock data, live search, a per-row active toggle, icon-only edit/delete actions, local-only delete, and one native `<dialog>` form shared by "Add member" and per-row editing; all changes stay in local state. Layout is responsive: the admin sidebar becomes a horizontal top nav below `md`, and the members table switches to stacked cards below `lg`. Events and attendance logs are still draft pages. No camera code or API client yet.
- `frontend/` theme: app-wide dark theme tokens in `src/app/globals.css` (`background`, `foreground`, `surface`, `surface-hover`, `line`, `muted`, `success`, `warning`, `danger`). Pages use the semantic Tailwind utilities (`bg-background`, `text-muted`, `border-line`, …), not raw colors. The body paints a CSS dot-grid texture (28px fine grid + offset 56px accent grid) that fades toward the bottom, so page wrappers must stay transparent to let it show.
- No Docker, no Postgres instance, no pgvector, no migrations, no CI, no `.env` files in the repo.
- Backend README/AGENTS still describe Nest defaults; treat nested AGENTS.md as authoritative for backend conventions.

## Decisions log

| Date | Decision | Rationale / status |
| --- | --- | --- |
| 2026-11-17 | Monorepo with separate backend and frontend npm projects | Existing scaffold; keep apps independently runnable |
| 2026-11-17 | Face embedding is computed in the browser and sent to the backend | Given requirement; backend stays agnostic but must record model and dimension |
| 2026-11-17 | PostgreSQL as primary DB, pgvector for embeddings | One datastore, transactional attendance writes plus vector search |
| 2026-11-17 | Attendance is event-scoped with `unique (event_id, member_id)` | Idempotent check-in; reports are naturally per event |
| 2026-11-17 | Store one row per enrollment sample; allow multiple samples per member | More samples improve accuracy; model field prevents mixing |
| 2026-11-17 | UI style is dark, minimalistic, black and white | Owner preference; see Frontend UI design in `CONVENTIONS.md` |

## Open questions (resolve before/during implementation)

1. **Face library and embedding model.** Candidates: `@vladmandic/face-api` (maintained face-api fork, 128-d or 512-d descriptors), MediaPipe Face Mesh + custom embedder, `@tensorflow-models/face-landmarks-detection`, `human`. Decide model, dimension, and license/size tradeoff. Everything else (schema dimension, threshold, index) depends on this.
2. **Matching policy.** Cosine distance with HNSW; what threshold? How many enrollment samples per member are required? What happens on ambiguous match (two members close)?
3. **Event selection on the user page.** Admin marks one event active? QR/URL per event? What is the flow on a shared kiosk?
4. **Auth.** Admin dashboard needs at least a simple login. User page may be kiosk-style (no member login) or per-member. Not designed yet.
5. **Two-step vs one-step check-in.** Identify then confirm (safer, more UI) vs identify-and-insert in one request (simpler). Decide before building the user page.
6. **Report export format and filters.** CSV is assumed; add date/event/status filters only if asked.
7. **Photo storage.** Only embeddings, or also a member profile photo? If photos are stored, use object storage, not the DB.

## Next steps (suggested order)

1. Resolve the embedding library/model question (open question 1); document dimension and version here.
2. Backend: add `@nestjs/config`, Postgres connection (`@nestjs/typeorm` or `@nestjs/drizzle`), pgvector setup and migrations for `members`, `face_embeddings`, `events`, `attendance`.
3. Backend: modules for members, events, attendance; schema validation via `StandardSchemaValidationPipe`; enable CORS for the frontend origin; `GET /health`.
4. Backend: enrollment endpoint and identify endpoint implementing threshold lookup + idempotent insert. Unit-test the matching/attendance logic with Vitest.
5. Frontend: API client + `NEXT_PUBLIC_API_URL`; admin members CRUD; admin events CRUD; attendance report.
6. Frontend: camera capture, face detection, embedding extraction, identify/check-in UI with clear success/duplicate/no-match states.
7. Add auth on admin routes, then hardening: rate limits, embedding deletion, consent copy, no-embedding logging.

## Gotchas

- Relative imports in backend code need the `.js` extension or the build/runtime breaks (ESM + NodeNext).
- Backend tests use Vitest globals (`src/**/*.spec.ts`), not Jest. `vi`, not `jest`.
- `npm run lint` in the backend is oxlint, not ESLint; the frontend uses ESLint.
- Port 3000 is the backend default; frontend dev server falls back to 3001. Point the frontend at the backend explicitly instead of relying on relative URLs.
- `next.config.ts` enables `cacheComponents`/`partialPrefetching`; camera and model code must live in client components.
- `frontend/tsconfig.json` enables typed routes — regenerate types by running the dev server or build; do not hand-write route prop types.
- pgvector index operator class must match the query operator (`<=>` cosine + `vector_cosine_ops`). Changing the embedding dimension requires a new column/table and re-enrollment.
- Do not return embeddings from any API. Do not log them. Treat enrollment data as sensitive personal data.

## Useful references

- NestJS docs index: https://docs.nestjs.com/llms.txt
- Backend agent notes: `backend/AGENTS.md` (first-party packages, ESM rules, Observe telemetry)
- Product/architecture detail: `PROJECT.md`
- Stack and commands: `CONVENTIONS.md`
