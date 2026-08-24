"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import {
  ChangePasswordResponse,
  UpdateLocaleResponse,
  UpdateProfileResponse,
  type Locale,
} from "@/lib/schemas";
import { inputCls } from "../(auth)/auth-card";
import { LanguageToggle, setLocaleCookie } from "@/components/language-toggle";

type Toast = { kind: "ok" | "err"; message: string } | null;

export default function SettingsPage() {
  const router = useRouter();
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const { user, loading, setUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [toast, setToast] = useState<Toast>(null);
  const [busy, setBusy] = useState<null | "name" | "email" | "password" | "locale">(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">{tCommon("loading")}</p>
      </div>
    );
  }

  const flashOk = () => setToast({ kind: "ok", message: t("saved") });
  const flashErr = (m: string) => setToast({ kind: "err", message: m });

  const saveName = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy || name === user.name) return;
    setBusy("name");
    setToast(null);
    try {
      const data = await apiFetch(
        "/auth/me",
        { method: "PATCH", body: JSON.stringify({ name }) },
        UpdateProfileResponse,
      );
      setUser(data.user);
      flashOk();
    } catch (err) {
      flashErr(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(null);
    }
  };

  const saveEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy || email === user.email) return;
    setBusy("email");
    setToast(null);
    try {
      const data = await apiFetch(
        "/auth/me",
        { method: "PATCH", body: JSON.stringify({ email }) },
        UpdateProfileResponse,
      );
      setUser(data.user);
      flashOk();
    } catch (err) {
      flashErr(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(null);
    }
  };

  const savePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    if (newPwd.length < 6) {
      flashErr(t("password.tooShort"));
      return;
    }
    if (newPwd !== confirmPwd) {
      flashErr(t("password.mismatch"));
      return;
    }
    setBusy("password");
    setToast(null);
    try {
      await apiFetch(
        "/auth/me/password",
        {
          method: "PATCH",
          body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
        },
        ChangePasswordResponse,
      );
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      flashOk();
    } catch (err) {
      flashErr(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(null);
    }
  };

  const changeLocale = async (next: Locale) => {
    setBusy("locale");
    setToast(null);
    try {
      const data = await apiFetch(
        "/auth/me/locale",
        { method: "PATCH", body: JSON.stringify({ locale: next }) },
        UpdateLocaleResponse,
      );
      setUser(data.user);
      setLocaleCookie(data.user.locale);
      flashOk();
    } catch (err) {
      flashErr(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(null);
    }
  };

  const labelCls = "flex flex-col gap-1.5 text-sm";
  const spanCls = "text-zinc-700 dark:text-zinc-300";
  const rowCls = "flex flex-row items-end gap-2";
  const saveBtnCls = "btn btn--primary text-sm disabled:opacity-50";

  return (
    <div className="flex flex-1 flex-col items-center py-8 px-4">
      <div className="w-full max-w-md flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-center">{t("title")}</h1>

        {toast && (
          <div
            className={`text-sm text-center ${toast.kind === "ok" ? "text-green-600" : "text-red-600"}`}
          >
            {toast.message}
          </div>
        )}

        <section>
          <form onSubmit={saveName} className={rowCls}>
            <label className={`${labelCls} flex-1`}>
              <span className={spanCls}>{t("sections.username")}</span>
              <input
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <button
              type="submit"
              className={saveBtnCls}
              disabled={busy !== null || name === user.name}
            >
              {busy === "name" ? t("saving") : t("save")}
            </button>
          </form>
        </section>

        <section>
          <form onSubmit={saveEmail} className={rowCls}>
            <label className={`${labelCls} flex-1`}>
              <span className={spanCls}>{t("sections.email")}</span>
              <input
                type="email"
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <button
              type="submit"
              className={saveBtnCls}
              disabled={busy !== null || email === user.email}
            >
              {busy === "email" ? t("saving") : t("save")}
            </button>
          </form>
        </section>

        <section>
          <form onSubmit={savePassword} className="flex flex-col gap-3">
            <span className={spanCls}>{t("sections.password")}</span>
            <input
              type="password"
              placeholder={t("password.current")}
              autoComplete="current-password"
              className={inputCls}
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder={t("password.new")}
              autoComplete="new-password"
              minLength={6}
              className={inputCls}
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder={t("password.confirm")}
              autoComplete="new-password"
              minLength={6}
              className={inputCls}
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              required
            />
            <button
              type="submit"
              className={`${saveBtnCls} self-end`}
              disabled={busy !== null}
            >
              {busy === "password" ? t("saving") : t("save")}
            </button>
          </form>
        </section>

        <section className={rowCls}>
          <div className={`${labelCls} flex-1`}>
            <span className={spanCls}>{t("sections.language")}</span>
            <LanguageToggle onBeforeChange={changeLocale} />
          </div>
        </section>

        <button
          type="button"
          className="btn btn--primary self-center mt-4"
          onClick={() => router.push("/home")}
        >
          {tCommon("confirm")}
        </button>
      </div>
    </div>
  );
}