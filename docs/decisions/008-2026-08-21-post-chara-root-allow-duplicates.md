# ADR 008: POST /chara at root; allow duplicate names

**Status**: Accepted
**Date**: 2026-08-21

## Decision

Batch chara creation POSTs to `/chara` (the router root), not `/chara/batch`. Drop the `@unique` constraint on `Card.name` — the primary key `id` is the only uniqueness guarantee.

## Rationale

The `id` is the actual identifier — enforcing name uniqueness would block legitimate flows (two charas named the same). Keeping the create route at the router root avoids gratuitous nesting for what is fundamentally a "create resource" operation.

## User feedback

User said: "use /chara as the post link, allow duplicated names - they have id as unique idetifiers anyways". Rejected the initial `/chara/batch` + P2002-handling approach in favor of this simpler shape.
