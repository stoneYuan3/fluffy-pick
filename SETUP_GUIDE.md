# Fluffy Pick — Boilerplate Setup Guide

Next.js frontend (`/frontend`) + Node.js/Express backend (`/backend`), Postgres + Prisma for the database, plain Docker Compose for env management.

Assumes TypeScript for both frontend and backend, Express for the backend. Repo root: `fluffy-pick/`.

## Target layout

```
fluffy-pick/
├── frontend/            ← Next.js app (created by create-next-app)
├── backend/             ← Node.js + Express + Prisma
│   ├── src/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env
├── docker-compose.yml
└── .env                 ← used by docker-compose for Postgres creds
```

---

## 1. Scaffold the frontend

From the repo root (`fluffy-pick/`):

```
npx create-next-app@latest frontend
```

Prompts: TypeScript **Yes**, ESLint **Yes**, Tailwind — your call, App Router **Yes**, `src/` directory — your call, import alias — default is fine.

This creates everything under `frontend/`.

## 2. Scaffold the backend

Still from `fluffy-pick/`:

```
mkdir backend
cd backend
npm init -y
npm install express cors dotenv
npm install -D typescript ts-node-dev @types/express @types/node @types/cors
npx tsc --init
```

Edit `backend/tsconfig.json` — set:
```jsonc
"rootDir": "./src",
"outDir": "./dist"
```

Create `backend/src/index.ts`:
```ts
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend running on port ${port}`));
```

Edit `backend/package.json` scripts:
```json
"scripts": {
  "dev": "ts-node-dev --respawn src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

## 3. Add Prisma (in `backend/`)

```
cd backend
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

This generates `backend/prisma/schema.prisma` and `backend/.env` with a default `DATABASE_URL`.

Edit `backend/prisma/schema.prisma` — confirm the datasource block and add a sample model:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  createdAt DateTime @default(now())
}
```

Edit `backend/.env` — this is what Prisma reads when you run commands **on your host** (outside Docker):
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fluffypick?schema=public"
```

## 4. Root `.env` for docker-compose

Create `fluffy-pick/.env`:
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=fluffypick
POSTGRES_PORT=5432
BACKEND_PORT=4000
FRONTEND_PORT=3000
```

## 5. `backend/Dockerfile`

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "run", "dev"]
```

## 6. `backend/.dockerignore`

```
node_modules
dist
.env
```

## 7. `frontend/Dockerfile`

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

## 8. `frontend/.dockerignore`

```
node_modules
.next
```

## 9. Root `docker-compose.yml` (at `fluffy-pick/docker-compose.yml`)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "${POSTGRES_PORT}:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public
      PORT: 4000
    ports:
      - "${BACKEND_PORT}:4000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    restart: unless-stopped
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:${BACKEND_PORT}
    ports:
      - "${FRONTEND_PORT}:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend

volumes:
  pgdata:
```

Note the two different `DATABASE_URL` hosts: `localhost` in `backend/.env` (for running Prisma CLI on your machine) vs `postgres` (the compose service name) inside `docker-compose.yml` (for the container network).

## 10. Root `.gitignore`

Create `fluffy-pick/.gitignore`:
```
node_modules
.env
frontend/.next
backend/dist
```
(`frontend/.gitignore` is already created by `create-next-app`; `backend/` needs its own or rely on the root one.)

## 11. First run

```
cd fluffy-pick
docker compose up -d postgres
cd backend
npx prisma migrate dev --name init
cd ..
docker compose up --build
```

`prisma migrate dev` creates `backend/prisma/migrations/` and applies the schema to the Postgres container (reachable at `localhost:5432` since you exposed the port).

## 12. Verify

- Backend health check: `http://localhost:4000/health`
- Frontend: `http://localhost:3000`
- Inspect DB: `cd backend && npx prisma studio` (opens on `localhost:5555`, connects via `backend/.env`)
