# cognis

Monorepo containing the backend and frontend applications.

```
cognis/
├── backend/    NestJS API
└── frontend/   Next.js app
```

## Getting started

Each app is self-contained with its own dependencies, so install and run them separately.

### Backend (NestJS)

```bash
cd backend
npm install
npm run start:dev
```

Runs on http://localhost:3000

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:3001 if the backend is already using port 3000 (Next will ask to use another port).

## Notes

- Both apps use npm and keep their own `package.json` / lockfile.
- Build outputs (`dist/`, `.next/`), `node_modules/` and env files are ignored by the root `.gitignore`.
