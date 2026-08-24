import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./config";

const COOKIE_NAME = "NEXT_LOCALE";

function parseAcceptLanguage(header: string | null): Locale | undefined {
  if (!header) return undefined;
  for (const raw of header.split(",")) {
    const tag = raw.split(";")[0]?.trim().toLowerCase();
    if (!tag) continue;
    if (tag === "zh-cn" || tag.startsWith("zh")) return "zh-CN";
    if (tag === "en" || tag.startsWith("en")) return "en";
  }
  return undefined;
}

async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(COOKIE_NAME)?.value;
  if (isLocale(cookieValue)) return cookieValue;

  const headerStore = await headers();
  const accept = parseAcceptLanguage(headerStore.get("accept-language"));
  if (accept) return accept;

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  const messages = (await import(`../messages/${locale}.json`)).default;
  return { locale, messages };
});
