# ADR 027: Native `<dialog>` for modals

**Status**: Accepted
**Date**: 2026-09-02

## Decision

Modals use the HTML5 `<dialog>` element, opened via `dialogRef.current?.showModal()` and closed via `.close()`. Content is conditionally rendered based on a paired `modalX: X | null` state; `onClose` clears that state so the next open shows fresh content, not a stale render. Backdrop styled via Tailwind's `backdrop:` variant (`backdrop:bg-black/40`). First use: chara delete-confirm dialog on `/chara`; extended to the food detail modal on `/food`.

## Rationale

`<dialog>` is native, gets focus trap, Escape-to-close, `::backdrop`, and modal semantics for free — no need for `react-modal`, portals, or focus-lock libraries. `showModal()`/`close()` are imperative but small, and pairing them with a `modalX` state prop keeps the "which record is showing?" question in React while the "is the dialog open?" question lives in the DOM. Splitting these two concerns is what makes the reopen-with-fresh-content pattern work.

## User feedback

User specified "use html5 native dialog tag" and asked that modal styling reference the existing chara delete-dialog pattern rather than introduce a new modal system.