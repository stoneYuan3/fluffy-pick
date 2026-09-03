# ADR 020: i18n via next-intl with backend locale mirror

**Status**: Accepted
**Date**: 2026-08-24

## Decision

Frontend uses `next-intl` with server-side locale resolution (`frontend/i18n/request.ts`, `frontend/i18n/config.ts`). Locale is resolved in priority order: `NEXT_LOCALE` cookie → `Accept-Language` header → `"en"` default. The backend mirrors the same resolution in `backend/src/lib/locale.ts` (`resolveRequestLocale`) so API-generated messages match the user's chosen language. The user's chosen locale is also persisted on `User.locale` at signup/login.

## Rationale

Cookie-first resolution lets the user's explicit language toggle survive across navigations and API calls; `Accept-Language` covers first-visit users. Duplicating the resolver on the backend (rather than passing a locale query param on every call) keeps clients dumb and makes locale a request-scoped concern the backend owns. Persisting on `User.locale` supports future email/notification flows where there is no live request.

## User feedback

Language toggle exists as a visible UI control (`frontend/components/language-toggle.tsx`); this ADR captures that toggling must round-trip to the backend for consistent error messages, not just swap frontend strings.