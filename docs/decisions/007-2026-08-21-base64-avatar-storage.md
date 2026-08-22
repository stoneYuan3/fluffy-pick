# ADR 007: Base64 image storage in DB (MVP)

**Status**: Accepted (MVP — revisit)
**Date**: 2026-08-21

## Decision

Store avatar images as base64-encoded strings in a Postgres text column on the `Card` row. Raise `express.json` body limit to 25MB to accept them. No object storage (S3/R2) and no on-disk uploads.

## Rationale

No file infrastructure existed and the goal was to unblock the create-card flow end-to-end. Base64-in-DB works with the existing Prisma schema and Express JSON parsing — zero new dependencies. Known trade-off: doesn't scale (image bytes travel through every row read that touches the card, and the DB balloons). Flagged for revisit once a real upload story is needed.
