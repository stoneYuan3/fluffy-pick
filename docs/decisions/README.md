# Architecture Decision Records

Lightweight ADRs — one file per decision, chronological (higher number = later decision).

Each entry: **Decision** + **Rationale**. Where the "why" was driven by an explicit user preference or correction in dialogue, a **User feedback** section captures that.

Dates are the actual dates the decision was made (from git + conversation timestamps, user local time — Pacific).

## Index

- [001 — Local font loading via next/font/local for xiangcui-song](001-2026-08-21-local-font-loading.md)
- [002 — aspect-ratio over height % for proportional scaling](002-2026-08-21-aspect-ratio-for-proportional-scaling.md)
- [003 — String union over enum for CardState](003-2026-08-21-string-union-over-enum.md)
- [004 — Split Card into Shell + variant components](004-2026-08-21-shell-plus-variants-component-split.md)
- [005 — Single `<input type="file">` for cross-platform image picking](005-2026-08-21-single-input-file-picker.md)
- [006 — Blob preview URL managed in useEffect](006-2026-08-21-blob-preview-url-lifecycle.md)
- [007 — Base64 image storage in DB (MVP)](007-2026-08-21-base64-avatar-storage.md)
- [008 — POST /chara at root; allow duplicate names](008-2026-08-21-post-chara-root-allow-duplicates.md)
- [009 — Prisma $transaction for atomic batch insert](009-2026-08-21-prisma-transaction-batch-insert.md)
- [010 — Container queries (cqw) for board-scoped scaling](010-2026-08-22-container-queries-for-board-scaling.md)
- [011 — vw + aspect-ratio (not vw + vh) for helper image](011-2026-08-22-vw-aspect-ratio-for-helper.md)
- [012 — Lazy derivation over scheduled sweep for active state](012-2026-08-22-lazy-derivation-over-scheduled-sweep.md)
- [013 — Split lifecycle status from ephemeral state](013-2026-08-22-split-lifecycle-from-ephemeral-state.md)
- [014 — currentCutoff as a pure function](014-2026-08-22-cutoff-helper-pure-function.md)
- [015 — POST /chara/commit for batch activation](015-2026-08-22-post-chara-commit-endpoint.md)
- [016 — Rename ephemeral state to active | standby](016-2026-08-22-rename-ephemeral-to-active-standby.md)
- [017 — Selected vs active as visually distinct marks](017-2026-08-22-selected-vs-active-marks.md)
- [018 — useSelection custom hook](018-2026-08-22-useselection-custom-hook.md)
