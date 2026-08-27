"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { CharaCreateResponse } from "@/lib/schemas";
import { CharaCard } from "@/components/cards/chara-card";
import { CharaAdder } from "@/components/chara-adder";
import { useMeasure } from "@uidotdev/usehooks";

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
  const [addedAvatarUrls, setAddedAvatarUrls] = useState<(string | null)[]>([]);

  const [ref, { width, height }] = useMeasure();
  const [cardRef, { height: imgHeight }] = useMeasure();

  useEffect(() => {
    const urls = addedCharas.map((c) => (c.avatar ? URL.createObjectURL(c.avatar) : null));
    setAddedAvatarUrls(urls);
    return () => {
      urls.forEach((u) => u && URL.revokeObjectURL(u));
    };
  }, [addedCharas]);

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


  
  console.log(width)
  console.log(height)

  const total = 12 + 1 + addedCharas.length;
  const radius = Math.max(width || 0, height || 0);
  const size = radius * 2;
  const h = imgHeight ?? 0;

  const getSlotStyle = (index: number) => {
    const angleRad = (index / total) * 2 * Math.PI;
    const r = radius - h / 2;
    const cx = radius - r * Math.sin(angleRad);
    const cy = radius - r * Math.cos(angleRad);
    return {
      top: `${cy - h / 2}px`,
      left: `${cx - h / 2}px`,
      transform: `rotate(${(-angleRad * 180) / Math.PI}deg)`,
    };
  };

  return (
    <div className="flex flex-1 flex-col">
      <main className="w-[100vw] h-[100vh] flex flex-col overflow-hidden items-center"> {/* gap-16 px-4 */}

        <div ref={ref} className="w-full h-full">
          <div className="chara-adder-circle relative" style={{ width: `${size}px`, height: `${size}px` }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`deco-${i}`}
                ref={i === 0 ? cardRef : undefined}
                className="w-[min(17.0833vw,22vh)] absolute"
                style={getSlotStyle(i)}
              >
                <CharaCard id={null} name={null} avatar={null} state="deco" />
              </div>
            ))}
            <div className="w-[min(17.0833vw,22vh)] absolute" style={getSlotStyle(3)}>
              <CharaAdder
                value={newName}
                onValueChange={setNewName}
                avatar={newAvatar}
                onAvatarChange={setNewAvatar}
              />
            </div>
            {addedCharas.map((c, i) => (
              <div key={`chara-${i}`} className="w-[min(17.0833vw,22vh)] absolute" style={getSlotStyle(4 + i)}>
                <CharaCard id={null} name={c.name} avatar={addedAvatarUrls[i] ?? null} />
              </div>
            ))}
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
