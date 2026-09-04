# Plan 001: Production loading speed

**Status**: Draft
**Date**: 2026-09-04

## Context

User reports slow loads on production. Frontend is on Vercel; backend (Express + Prisma) and Postgres are on Railway. The question raised was whether the split hosting or the code itself is the primary cause. A code audit answers: mostly the code — split hosting adds modest overhead but is not the dominant factor.

## Confirmed bottlenecks

Findings from an audit of routes, hooks, and middleware:

1. **Base64 images in list endpoints.** `GET /chara`, `/chara/active`, `/food/normal`, `/food/active` all return `avatar` (String) and `photos` (String[]) columns holding base64 payloads (per [ADR 007](../decisions/007-2026-08-21-base64-avatar-storage.md), an explicit MVP shortcut). A list of ~20 foods with 3 photos each is on the order of 6 MB per response. This is the single largest issue.
2. **Auth waterfall.** `useAuth` fires `/auth/me` on mount; some entity hooks gate on `user` being truthy — e.g. [home/page.tsx:26](../../frontend/app/home/page.tsx#L26) uses `useCharas(user ? "active" : null)`. Those fetches don't start until auth resolves, forcing a sequential chain instead of parallel.
3. **No HTTP caching or compression.** No `Cache-Control` / `ETag` headers, no `compression` middleware. Every navigation re-transmits full payloads uncompressed. Base64 gzips extremely well (~70%+ reduction).

## Not a bottleneck

- **Region mismatch / hosting misconfig.** No `vercel.json`, `railway.json`, `railway.toml` regional config in the repo; no evidence of misconfigured routing. Cross-provider latency adds ~50–200 ms per request but is dwarfed by payload size. Railway cold starts may contribute on first request of a session but are not the dominant symptom.

## Phased plan

Ordered by impact-per-effort. Each phase should be measured before proceeding to the next — Phase 2 may be unnecessary if Phase 1 is enough.

### Phase 1 — Quick wins (low risk, ~1 commit)

- Add [`compression`](https://www.npmjs.com/package/compression) middleware to Express. Immediate ~70% payload reduction on base64.
- Fire `/auth/me` and initial entity fetches in parallel. Simplest fix: drop the `user ? "active" : null` gate on `useCharas` in [home/page.tsx](../../frontend/app/home/page.tsx) and let the hook fire immediately — the 401 path is harmless because `useAuth`'s effect already redirects unauthenticated users. Alternative: hoist both into a shared parallel loader.
- Add `Cache-Control: private, max-age=0, must-revalidate` + `ETag` on list endpoints so 304s can skip payload transmission on repeat loads.

### Phase 2 — Strip images from list responses (medium risk, ~2 commits)

- Change `GET /chara`, `/chara/active`, `/food/normal`, `/food/active` to return metadata only (`id`, `name`, `description`, `status` where applicable) — drop `avatar` and `photos`.
- Add per-entity image endpoints:
  - `GET /chara/:id/avatar` → base64 (or stream binary) with `Cache-Control: private, max-age=31536000, immutable`.
  - `GET /food/:id/photos` → same treatment.
- Update `SmallCard.Image` and the food detail modal to fetch by id lazily. Native `<img>` with a URL src gets browser caching for free; `loading="lazy"` handles offscreen cards.
- Update `CharaListResponse` / `FoodListResponse` Zod schemas to reflect the trimmed shape.

Contract change: list callers that expect `avatar` inline will break. Sweep for consumers before shipping.

### Phase 3 — Move images out of Postgres (bigger, optional)

- Migrate base64 → object storage (Vercel Blob, Cloudflare R2, or S3). Store only a URL string in Postgres. CDN-cached, no per-request DB read.
- This graduates [ADR 007](../decisions/007-2026-08-21-base64-avatar-storage.md) — that ADR framed base64-in-DB as an explicit MVP shortcut, so this is the planned graduation, not a reversal. Record as a new ADR when executed.
- Requires: migration script for existing rows, upload endpoint rewrite, storage bucket setup.
- Only pursue if Phases 1–2 leave measurable slowness. Measure before deciding.

### Explicitly not doing (with reasoning)

- **Colocating frontend + backend on one provider.** Audit found no region misconfig; latency contribution is modest vs payload size.
- **Next.js `<Image>` component.** Requires proper image URLs; blocked on Phase 2 or 3.
- **Cron ping to keep Railway warm.** Cheaper to observe first; if Railway sleep is causing user-visible pauses, paid tier eliminates it. Not worth an engineering solution for a config toggle.

## Verification per phase

- **Phase 1**: DevTools Network tab shows `content-encoding: gzip` on `/chara` and `/food/*`; home-page waterfall shows `/auth/me` and `/chara/active` starting near-simultaneously. Repeat loads show `304 Not Modified`. Compare LCP before/after.
- **Phase 2**: `/chara` and `/food/*` response sizes drop from MBs to KBs. Card avatars load progressively (a brief flicker is acceptable). Second visit to a page shows image requests served from cache.
- **Phase 3**: DB size drops significantly; image responses show `age` header climbing on repeat views, served from CDN edge.

## Open questions / follow-ups

- Phase 3 should consider image resizing (thumbnail vs full). Currently the same base64 is used for a 100px card avatar and a full-screen modal — massively oversized regardless of storage backend.
- Add basic RUM (Vercel Speed Insights is free) to measure real user latency instead of guessing at bottleneck priority.
- If backend request latency is a real concern after payloads shrink, consider connection pooling tuning on Prisma + Railway's `DATABASE_URL` params (`connection_limit`, `pgbouncer=true`).
