"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { CharaCreateResponse } from "@/lib/schemas";
// import { CharaCard } from "@/components/cards/chara-card";
import { CharaAdder } from "@/components/cards/chara-adder";
import { useMeasure } from "@uidotdev/usehooks";
import "./test-adder.css";
// import "../../../components/cards/chara-card.css";

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
  // const [newName, setNewName] = useState("");
  // const [newAvatar, setNewAvatar] = useState<File | null>(null);

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

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [rotation, setRotation] = useState(0);
  const lastWheelRef = useRef(0);
  const touchStartXRef = useRef<number | null>(null);

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


  const total = 16;
  const radius = (width ?? 0) / 2;
  const h = imgHeight ?? 0;
  console.log(h)

  let allowAddCard = addedCharas.length < 12;

  const getSlotStyle = (index: number) => {
    const angleRad = (index / total) * 2 * Math.PI;
    const r = radius - h / 2;
    const cx = radius - r * Math.sin(angleRad);
    const cy = radius - r * Math.cos(angleRad);
    return {
      top: `${cy}px`,
      left: `${cx}px`,
      transform: `rotate(${(-angleRad * 180) / Math.PI}deg)`,
      translate: `-50% -50%`
    };
  };


  const step = 360 / total;

  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelRef.current < 200) return;
    lastWheelRef.current = now;
    const dir = e.deltaY > 0 ? -1 : 1;
    setRotation((prev) => prev + dir * step);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const delta = e.touches[0].clientX - touchStartXRef.current;
    const threshold = 40;
    if (Math.abs(delta) < threshold) return;
    const dir = delta < 0 ? -1 : 1;
    setRotation((prev) => prev + dir * step);
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    touchStartXRef.current = null;
  };

  const activeIndex = ((Math.round((rotation / 360) * total) % total) + total) % total;

  const handleConfirm = () => {

  }

  return (
    <div className="flex flex-1 flex-col">
      <main
        className="w-[100vw] h-[100vh] flex flex-col overflow-hidden items-center"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      > {/* gap-16 px-4 */}

        <div className="w-full h-full flex justify-center">
          <div ref={ref} className="chara-adder-circle w-[200vh] relative aspect-square shrink-0" style={{ transform: `translateY(var(--circle-y)) rotate(${rotation}deg)` }}>

            {Array.from({ length: total }).map((_, i) => (
              <div key={`card-${i}`} className={`w-[min(19vh,22vh)] absolute${i === activeIndex ? ' active' : ''}`} style={getSlotStyle(i)}>
                <CharaAdder
                  state={i === 0 ? 'ready' : 'sleep'}
                />
              </div>
            ))}

          </div>
        </div>

        <div className="flex flex-col gap-[2vh] items-center gap-[0.5556vw] absolute bottom-[10%]"> {/* gap-2 */}
          {
            !allowAddCard && (
              <span className="warning">{t("warningAddExceed")}</span>
            )
          }

          <div className="flex flex-row gap-[1.1111vw]"> {/* gap-4 */}
            {
              allowAddCard && (
                <button className="btn btn--primary text-[1.6667vw]" onClick={handleConfirm}> {/* 24px */}
                  {t("addCard")}
                </button>
              )
            }

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
