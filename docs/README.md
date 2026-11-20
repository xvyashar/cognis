# cognis docs

Agent-facing knowledge base for this repository. Read `MEMORY.md` first when resuming work; read `PROJECT.md` for product scope and architecture. Working rules live in the root [AGENTS.md](../AGENTS.md).

| File | Contents |
| --- | --- |
| `PROJECT.md` | What cognis is, requirements, architecture, draft data model and API |
| `CONVENTIONS.md` | Stack, commands, code conventions, repo gotchas |
| `MEMORY.md` | Current state, decisions log, open questions, next steps |

Last updated: 2026-11-20 (backend scaffold; admin Members, Devices and Events pages are mock-data UIs).

## Quick reference

```
backend/    NestJS 12 API (ESM, Vitest, oxlint, Prettier)   http://localhost:3000
frontend/   Next.js 16 App Router + Tailwind 4              http://localhost:3001
```

```bash
# backend
npm run start:dev   # in backend/
npm run lint
npm test
npm run build

# frontend
npm run dev         # in frontend/
npm run lint
npm run build
```

No database, migrations, Docker setup, or CI exist yet.
