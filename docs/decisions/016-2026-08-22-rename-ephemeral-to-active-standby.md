# ADR 016: Rename ephemeral state to active | standby

**Status**: Accepted
**Date**: 2026-08-22

## Decision

The derived state returned by `GET /chara` uses the names `active` and `standby`, not `active` and `normal`.

## Rationale

`normal` is already meaningful in the lifecycle enum (`CardStatus.normal`, see ADR 013). Reusing it for the ephemeral opposite-of-active would create two different "normals" living in the same domain — one persistent, one derived — and readers of the code would constantly have to disambiguate which one is meant.

## User feedback

User directly asked: "to aviod confusion with the normal used in lifecycle manangement use Active | Standby instead".
