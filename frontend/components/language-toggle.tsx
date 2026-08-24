"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/schemas";

const COOKIE_NAME = "NEXT_LOCALE";

export function setLocaleCookie(locale: Locale) {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(locale)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export interface LanguageToggleProps {
  onBeforeChange?: (locale: Locale) => Promise<void> | void;
  className?: string;
}

export function LanguageToggle({ onBeforeChange, className }: LanguageToggleProps) {
  const router = useRouter();
  const current = useLocale() as Locale;
  const t = useTranslations("language");
  const [pending, startTransition] = useTransition();

  const change = (next: Locale) => {
    if (next === current || pending) return;
    startTransition(async () => {
      if (onBeforeChange) await onBeforeChange(next);
      setLocaleCookie(next);
      router.refresh();
    });
  };

  const btn = (locale: Locale, label: string) => (
    <button
      type="button"
      onClick={() => change(locale)}
      disabled={pending}
      aria-pressed={current === locale}
      className={`px-2 py-1 text-sm rounded ${current === locale ? "bg-black text-white dark:bg-white dark:text-black" : "text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white"}`}
    >
      {label}
    </button>
  );

  return (
    <div className={`inline-flex items-center gap-1 ${className ?? ""}`}>
      {btn("en", t("en"))}
      <span className="text-zinc-400">|</span>
      {btn("zh-CN", t("zh"))}
    </div>
  );
}