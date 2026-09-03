# ADR 021: express-rate-limit with trust proxy for Railway

**Status**: Accepted
**Date**: 2026-08-25

## Decision

Backend applies `express-rate-limit`: a stricter limiter on `/auth` routes and a looser global limiter on everything else. `app.set("trust proxy", ...)` is enabled so the client IP is read from `X-Forwarded-For` rather than the Railway edge-proxy IP.

## Rationale

Auth endpoints need the tighter limit because they are the highest-value target for credential stuffing / brute force; general routes still want protection against abuse but at a threshold that won't disrupt normal use. `trust proxy` is not optional on Railway — without it every request appears to come from the same upstream IP and rate limiting silently degrades to a global bucket, effectively disabling per-user throttling.

## User feedback

Added as a hardening pass before the first public deploy, alongside Railway config (`railway.toml`, `.nvmrc`).