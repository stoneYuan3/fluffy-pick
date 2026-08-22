# ADR 005: Single `<input type="file">` for cross-platform image picking

**Status**: Accepted
**Date**: 2026-08-21

## Decision

Use one `<input type="file" accept="image/*">` (no `capture` attribute) inside a `<label>` covering the avatar circle. Skip the split-half "album | camera" UI originally sketched.

## Rationale

On iOS and Android, an image-accepting file input without `capture` natively presents a sheet offering Photo Library + Take Photo + Choose Files. The same markup handles desktop OS file pickers. A single input covers both platforms and both intents without OS-specific branches or two separate affordances.

## User feedback

User was unsure "how to keep it intuitive after choosing" a picture and originally imagined a split UI for album vs camera on mobile. Explaining that the OS handles both from one input let us simplify — user accepted the plan as written.
