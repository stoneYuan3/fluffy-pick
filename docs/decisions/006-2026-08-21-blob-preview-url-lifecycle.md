# ADR 006: Blob preview URL managed in useEffect

**Status**: Accepted
**Date**: 2026-08-21

## Decision

For image previews from a picked `File`, own the `URL.createObjectURL(file)` lifecycle inside a `useEffect` whose cleanup calls `URL.revokeObjectURL(url)`. Rerun the effect when the underlying file changes.

## Rationale

Blob URLs are process-scoped and leak memory if never revoked. Tying create/revoke to the file dependency guarantees that (a) each new file gets a fresh URL, (b) the previous URL is released the moment it's no longer visible, and (c) unmount cleans up the last URL. Doing this inside the component that renders the preview keeps ownership local.
