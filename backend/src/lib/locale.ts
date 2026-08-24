import type { Request } from "express";
import { Locale } from "./schemas.js";

const COOKIE_NAME = "NEXT_LOCALE";

function parseCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

function parseAcceptLanguage(header: string | undefined): Locale | undefined {
  if (!header) return undefined;
  for (const raw of header.split(",")) {
    const tag = raw.split(";")[0]?.trim().toLowerCase();
    if (!tag) continue;
    if (tag === "zh-cn" || tag.startsWith("zh")) return "zh-CN";
    if (tag === "en" || tag.startsWith("en")) return "en";
  }
  return undefined;
}

export function resolveRequestLocale(req: Request): Locale {
  const cookie = parseCookie(req.headers.cookie, COOKIE_NAME);
  const cookieParsed = Locale.safeParse(cookie);
  if (cookieParsed.success) return cookieParsed.data;

  const accept = parseAcceptLanguage(req.headers["accept-language"] as string | undefined);
  if (accept) return accept;

  return "en";
}