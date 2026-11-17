# cognis

Face-recognition based attendance system: NestJS API in `backend/`, Next.js app in `frontend/`. Product and technical knowledge lives in [docs/](docs/README.md); read [docs/README.md](docs/README.md) at the start of every session and the topic docs it points to before touching that area.

This file is the single source of truth for every coding agent (Cline, Claude Code, Codex, Cursor, ...). Agent-specific entry points (e.g. `CLAUDE.md`) only point here; never duplicate rules in them.

## Roles

This file is read by two kinds of agent:

- **Leader**: the main session, talking to the user. Follows every section below.
- **Implementer**: a subagent the leader spawned to write code. Follows only [Implementer rules](#implementer-rules) and [Code rules](#code-rules), and treats its task prompt as the spec.

If your tool can't spawn subagents, you are both: work as leader, run the Implementer rules yourself for each task, and keep the verification steps (static checks, review) as separate, explicit passes. Never skip them because you wrote the code yourself.

## Leader workflow

The leader plans, delegates and reviews. Every edit to code (`backend/`, `frontend/`, config files) is made by an implementer; the leader's own edits are limited to `AGENTS.md` and `docs/`. (Without subagents, you make the code edits yourself, one task at a time.)

1. **Spec.** Turn the request into a spec the user agrees with. Whenever behaviour, scope, an edge case or a trade-off is undetermined, ask the user (your tool's ask-the-user / question mechanism) instead of guessing. Done when every open question is answered or explicitly defaulted, and the user has confirmed the spec.
2. **Split.** If the work is big, break it into tasks that each fit one implementer run and can be reviewed on their own (one concern, a coherent diff, tests included). Done when each task has a clear scope and a completion criterion.
3. **Delegate.** Spawn an implementer subagent per task, using a mid-tier coding model (e.g. Sonnet-class) when the tool lets you choose. The prompt must:
   - start with: "Before anything else, load the `ponytail` skill if your tool has one; otherwise skip this step.";
   - carry the full spec for that task (the subagent starts cold), the files and docs it should read, and its completion criterion;
   - say whether to commit (only when the user asked for commits).
4. **Static checks.** When the implementer reports back, run every check yourself and read the output; the implementer's own claims are not evidence. Done when all are green:
   - `backend/`: `npx tsc --noEmit -p tsconfig.json`, `npm run lint`, `npx prettier --check "src/**/*.ts" "test/**/*.ts"`, `npm test` (and `npm run test:e2e` when the change affects HTTP behaviour)
   - `frontend/`: `npx tsc --noEmit`, `npm run lint`, `npm run build`
   - integration tests, see [Integration tests](#integration-tests)
   - run checks in each app the change touches.
5. **Review.** Read the whole diff (`git diff` / `git show`) as a senior code reviewer. Done when every item below has been checked against every changed file:
   - **Tech debt and quality**: clean code, design principles (SOLID, layering, dependency direction), design patterns used where they fit, anti-patterns, code smells, naming, consistency with the surrounding code and [docs/CONVENTIONS.md](docs/CONVENTIONS.md).
   - **Performance**: N+1 queries, needless round trips, unbounded loads, missing indexes, blocking work on the request path, work that should stay off the request path.
   - **Edge cases**, both business (domain rules, state transitions, duplicates) and technical (concurrency and races, partial failure, retries, idempotency, null/empty input, external provider errors). For this domain: low-quality or unreadable frames, multiple faces, near-threshold matches, repeat check-ins, and enrollment/model-version mismatches.
   - **Tests** cover the new behaviour and its edge cases.
6. **Iterate.** Send every finding back to the same implementer (message the existing subagent, so it keeps context), then repeat steps 4–5. Done when checks are green and the review has no findings left.
7. **Report** to the user: what changed, check results, anything deferred (e.g. pending migrations).

## Integration tests

The repo has no integration-test setup yet. When one is added (Postgres/pgvector, containers, etc.), document it in [docs/CONVENTIONS.md](docs/CONVENTIONS.md) and follow these rules:

- Run integration tests against throwaway containers on spare ports, never against the configured development services.
- Start the container runtime yourself if it isn't running, and poll until it responds.
- Pass connection settings through environment variables for the test run only; never write test credentials to `.env` files.
- Always clean up containers afterwards, including after a failed run.

## Implementer rules

- Load the `ponytail` skill before starting, if your tool has one.
- Read the docs the task names and the code the change touches before editing.
- Before reporting, run the checks for the app you changed — `backend/`: `npx tsc --noEmit -p tsconfig.json`, `npm run lint`, the prettier check and `npm test`; `frontend/`: `npx tsc --noEmit`, `npm run lint`, `npm run build` — and fix what fails.
- Report: files changed, what each change does, check results, and any open question or deviation from the spec.

## Code rules

- Comments only where the code can't speak for itself; notes for the user go in the chat reply.
- Match the conventions in [docs/CONVENTIONS.md](docs/CONVENTIONS.md). Backend is ESM (relative imports end in `.js`), tested with Vitest, linted with oxlint; frontend is Next.js 16 App Router with typed routes.
- Do not add a library before checking whether the framework already ships the capability (Nest first-party packages, Next built-ins, platform APIs).
- Never log, return or commit face embeddings or face images. Validate the embedding model and dimension at the boundary, and keep check-in idempotent per member per event.
- Schema changes ship as migrations, never ad-hoc SQL against a real database. If migration generation is the user's step, change only the model/entities and list the pending schema changes in the report.
- No secrets, connection strings or keys in source or docs.

## Project memory

- When the user teaches a new development-flow principle, add it to this file in the section it belongs to.
- When you learn project, domain or technical knowledge that isn't obvious from the code (a business rule, a provider quirk, a reason behind a design), record it in the matching `docs/` file, or a new one linked from [docs/README.md](docs/README.md). Update or delete stale lines there in the same edit.
