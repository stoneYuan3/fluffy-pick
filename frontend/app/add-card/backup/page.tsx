"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { CharaCreateResponse } from "@/lib/schemas";
import { CharaCard } from "@/components/cards/chara-card/chara-card";
import { CharaAdder } from "@/components/cards/chara-card/chara-adder";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function AddCardPage() {
  const router = useRouter();
  const t = useTranslations("addCard");
  const { user, loading } = useAuth();
  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState<File | null>(null);

  const [addedCharas, setAddedCharas] = useState<{ name: string; avatar: File | null }[]>([]);
  const latestChara = addedCharas[addedCharas.length - 1] ?? null;
  const [latestAvatarUrl, setLatestAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!latestChara?.avatar) {
      setLatestAvatarUrl(null);
      return;
    }
    const url = URL.createObjectURL(latestChara.avatar);
    setLatestAvatarUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [latestChara?.avatar]);

  const handleAddCard = () => {
    if (!newName.trim()) return;
    setAddedCharas((prev) => [...prev, { name: newName, avatar: newAvatar }]);
    setNewName("");
    setNewAvatar(null);
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleDone = async () => {
    if (addedCharas.length === 0 || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = await Promise.all(
        addedCharas.map(async (c) => ({
          name: c.name,
          avatar: c.avatar ? await fileToBase64(c.avatar) : null,
        })),
      );
      await apiFetch(
        "/chara",
        { method: "POST", body: JSON.stringify({ charas: payload }) },
        CharaCreateResponse,
      );
      setAddedCharas([]);
      router.push("/home");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("failedSave"));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-500">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="chara-adder flex flex-1 flex-col gap-[4.4444vw] items-center justify-center px-[1.1111vw]"> {/* gap-16 px-4 */}
        <div className="card-adder flex flex-row items-center justify-center w-full gap-[2vw] pb-[6vw]">
          <div className="relative z-0 w-[min(17.0833vw,24.0234vh)] translate-x-[45%] translate-y-[2%] rotate-[-5deg]"> {/* 246px @ 1440x1024 */}
            <CharaCard id={null} name={null} avatar={null} state="deco" />
          </div>
          <div className="relative z-10 w-[min(17.0833vw,24.0234vh)]">
            <CharaAdder
              value={newName}
              onValueChange={setNewName}
              avatar={newAvatar}
              onAvatarChange={setNewAvatar}
            />
          </div>
          <div className="relative z-0 w-[min(17.0833vw,24.0234vh)] translate-x-[-45%] translate-y-[2%] rotate-[5deg]">
            {latestChara ? (
              <CharaCard id={null} name={latestChara.name} avatar={latestAvatarUrl} state="normal" />
            ) : (
              <CharaCard id={null} name={null} avatar={null} state="deco" />
            )}
          </div>
        </div>
        <div className="flex flex-col items-center gap-[0.5556vw] absolute bottom-[10%]"> {/* gap-2 */}
          <div className="flex flex-row gap-[1.1111vw]"> {/* gap-4 */}
            <button className="btn btn--primary text-[1.6667vw]" onClick={handleAddCard}> {/* 24px */}
              {t("addCard")}
            </button>
            <button
              className="btn btn--secondary text-[1.6667vw] disabled:opacity-50" /* 24px */
              onClick={handleDone}
              disabled={submitting || addedCharas.length === 0}
            >
              {submitting ? t("saving") : t("done")}
            </button>
          </div>
          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        </div>
      </main>
    </div>
  );
}
