# ADR 026: dnd-kit for food drag with optimistic move

**Status**: Accepted
**Date**: 2026-09-02

## Decision

Drag-and-drop on the food page uses `@dnd-kit/core` (`DndContext`, `useDraggable`, `useDroppable`, `DragOverlay`). Configuration:
- `PointerSensor` with `activationConstraint: { distance: 8 }` — plain taps under 8px pass through as clicks, so the same card can be both clickable (opens modal) and draggable without a mode switch.
- `<DragOverlay dropAnimation={null}>` — no fly-back animation; the card visually stops at the drop cursor.
- Optimistic state update: on `handleDragEnd`, mutate `normalFoods` (remove) and `activeFoods` (prepend) via the exposed `setFoods` setters *before* firing `PUT /food/status`. No refetch on success. On failure, the `useFoods` hook surfaces the error into the drop zone.

## Rationale

`dnd-kit` is the modern, accessible, touch-aware choice — react-dnd is heavier and requires a backend provider. The `distance: 8` constraint is what lets click and drag coexist on the same element (no `onMouseDown` guards, no "handle" affordance). Optimistic update was necessary because the initial "wait for PUT, then refetch, then re-render" flow produced a visible flash: the source card's opacity snapped from 0.4 back to 1.0 before the refetch removed it. Trusting the backend and skipping the round-trip refetch eliminates the flash entirely; if the PUT ever fails the user sees the error inline rather than a silent revert.

## User feedback

User called out the flash directly ("the element still briefly flashes in the original location") and explicitly chose the optimistic-update pattern to avoid render issues with the drag — "just do a certain visual change after a change like this and trust the back end is also updated ... only fetch when user refreshes." They then asked that a PUT failure show its error message inside the drop-zone div so the user knows something is wrong behind the scenes — that's why the error surfaces in `ActiveDropZone`, not a toast.