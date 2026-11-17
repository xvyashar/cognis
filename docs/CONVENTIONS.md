# Conventions and commands

## Repository layout

```
cognis/
  backend/    NestJS API, self-contained npm project
  frontend/   Next.js app, self-contained npm project
  docs/       Agent knowledge base (this folder)
  README.md   Human quick start
```

Both apps have their own `package.json` and lockfile. Run npm commands from the app directory. Root `.gitignore` covers `node_modules/`, `dist/`, `.next/`, env files, logs, coverage, `*.tsbuildinfo`.

## Commands

Backend (`backend/`):

```bash
npm install
npm run start:dev     # watch mode, http://localhost:3000
npm run start:debug
npm run build
npm run lint          # oxlint --type-aware src/ test/
npm test              # vitest run
npm test:watch
npm test:cov
npm test:e2e
npm run format        # prettier --write src/**/*.ts test/**/*.ts
```

Frontend (`frontend/`):

```bash
npm install
npm run dev           # Next dev; uses 3001 if 3000 is taken
npm run build
npm start
npm run lint          # eslint
```

No frontend test runner is configured yet.

## Backend conventions

- ESM project (`"type": "module"`): relative imports **must** end in `.js` (`./app.module.js`), even from TypeScript.
- `__dirname` does not exist; use `import.meta.dirname` if needed.
- NodeNext module resolution, target ES2023, strict TypeScript, decorators enabled.
- Tests run on **Vitest**. Use `vi.fn()`, not `jest.fn()`. Specs are `*.spec.ts`; e2e specs use `vitest.config.e2e.ts`.
- Prettier: single quotes, trailing commas.
- Linting is oxlint (with `oxlint-tsgolint`), not ESLint.
- Check NestJS first-party packages before adding a library (see `backend/AGENTS.md`): TypeORM/Drizzle, Config, Swagger, Throttler, Terminus, Schedule, BullMQ, etc. Nest docs: https://docs.nestjs.com/llms.txt
- `StandardSchemaValidationPipe` accepts Zod/Valibot/ArkType without decorator metadata; `class-validator` still works via `ValidationPipe`. Prefer schema validation for request payloads.
- No Nest global prefix, CORS enablement, validation, or config module is set up yet. `main.ts` only creates the app and listens on `PORT ?? 3000`.

## Frontend conventions

- Next.js 16 App Router under `src/app`. React 19, TypeScript strict.
- Tailwind CSS 4 is wired through Turbopack loaders in `next.config.ts` (`@tailwindcss/turbopack` for `*.css`) — there is no `postcss.config` / `tailwind.config` to edit by default.
- Path alias `@/*` -> `src/*`.
- Typed routes are enabled by Next: route props are generated (`LayoutProps<"/">`), so use those types rather than hand-written params.
- `next.config.ts` enables `cacheComponents` and `partialPrefetching`, so components follow Next 16 caching semantics; keep client-only code (camera, face models) in `"use client"` components and avoid reading browser globals during render.
- Existing global styles live in `src/app/globals.css` and define the Tailwind/theme tokens and fonts (Geist).
- No API client, state library, or auth exists yet. Add `NEXT_PUBLIC_API_URL` (or similar) rather than hardcoding `http://localhost:3000`.

## Frontend UI design

The owner's preferred style: dark, minimalistic, black and white.

- Near-black page backgrounds with white/near-white text, grayscale surfaces and thin neutral borders (`zinc`/`neutral` tokens fit). Build hierarchy from spacing, type scale and borders, not decoration.
- No decorative color, gradients, glows, heavy shadows or illustrations. Keep motion subtle and functional.
- Color is reserved for state that must stand out (success, error, warning, low-confidence match), used sparingly and with accessible contrast.
- Generous whitespace and simple typography (existing Geist fonts). Keep screens calm and sparse; one clear primary action per view.
- Admin tables and forms stay in the same palette: dense but quiet, no colored headers or zebra striping.
- Camera/check-in screens should emphasize the camera feed and the result state, with minimal chrome around them.

## Working rules

- Keep types shared across apps in one place if a shared package is added; otherwise duplicate small DTO shapes deliberately and document them.
- Every schema change ships as a migration in the backend, never as ad-hoc SQL in the docs.
- Never log embeddings or raw face images. Never send embeddings back to the client.
- Commit only when asked. Do not add comments unless they explain non-obvious constraints.
- Run the relevant lint + test + build commands after changes. There is no CI, so verification is manual.

## Environment

- Windows, PowerShell 5.1. Use `cmd1; if ($?) { cmd2 }` instead of `&&`.
- Git repo at `D:\Dev\Personal\cognis`. No Docker/Postgres setup yet.
