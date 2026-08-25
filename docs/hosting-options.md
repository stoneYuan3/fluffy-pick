# Hosting Options

The stack is a Next.js 16 frontend + Express backend + Postgres, so hosting boils down to where each piece lives.

## Simplest / free-tier-friendly

- **Vercel** (frontend) + **Railway** or **Render** (Express + managed Postgres). Split deploy, one repo, both providers auto-build on git push. Backend URL goes into a `NEXT_PUBLIC_API_URL` env var. ~$0–$10/mo at low traffic.

## Single-provider (less moving parts)

- **Railway** or **Render** for everything — frontend, backend, and DB in one dashboard. Slightly slower cold starts for Next.js vs Vercel, but one bill and one deploy pipeline.
- **Fly.io** — deploy both as Docker apps, use Fly Postgres. Good if you want geographic control.

## Cheapest at scale / most control

- A **$5–$10 VPS** (Hetzner, DigitalOcean, Linode) running both services behind Caddy/Nginx with a local Postgres. You manage backups and updates.

## Rework option (fewer deployables)

- Merge the Express routes into Next.js **Route Handlers** (`app/api/*`), then deploy the whole thing to Vercel with **Neon** or **Supabase** as the DB. Removes one service entirely; the tradeoff is porting the Express middleware (JWT, zod) into route handlers.

## App-specific consideration

Avatars are stored as base64 in Postgres. On any managed DB (Neon free = 0.5 GB, Supabase free = 500 MB, Railway = pay by GB), that quota fills fast. If this app grows, moving avatars to object storage (Cloudflare R2, S3, Supabase Storage) is the real cost lever — hosting choice matters less.

## Recommendation

For a personal project: **Vercel (frontend) + Railway (backend + Postgres)**. Fastest to set up, generous free tier, git-push deploys, and easy to migrate off later.