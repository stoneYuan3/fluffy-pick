# ADR 001: Local font loading via next/font/local for xiangcui-song

**Status**: Accepted
**Date**: 2026-08-21

## Decision

Load `xiangcui-song.ttf` via `next/font/local` in `app/layout.tsx` and expose it as the CSS variable `--font-xiangcui`.

## Rationale

The font ships as a local `.ttf`, not a Google Font. `next/font/local` handles subsetting, preload, self-hosting, and CSS-variable wiring without any network dependency — the same ergonomics as `next/font/google` but for local files.

## User feedback

User asked "how do i use this xiangcui-song.ttf font in this app?" — indicating they wanted it treated as a first-class font in the design system, not a one-off `@font-face` declaration.
