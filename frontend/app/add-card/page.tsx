"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
// import { CharaCard } from "@/components/cards/chara-card";
import { CharaAdder } from "@/components/cards/chara-adder";
import { useCharas } from "@/hooks/use-charas";
import { useMeasure } from "@uidotdev/usehooks";
import "./circle-adder.css";
// import "../../../components/cards/chara-card.css";

export default function AddCardPage() {
  const router = useRouter();
  const t = useTranslations("addCard");
  const { user, loading } = useAuth();
  // const [newName, setNewName] = useState("");
  // const [newAvatar, setNewAvatar] = useState<File | null>(null);

  const total = 16;

  const [charas, setCharas] = useState<{ name: string; avatar: File | null }[]>(
    () => Array.from({ length: total }, () => ({ name: "", avatar: null })),
  );
  const updateChara = (
    i: number,
    patch: Partial<{ name: string; avatar: File | null }>,
  ) => setCharas((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const [ref, { width, height }] = useMeasure();
  const [cardRef, { height: imgHeight }] = useMeasure();

  const { create, creating, error: createErrorObj } = useCharas(false);
  const submitError = createErrorObj
    ? createErrorObj.message || t("failedSave")
    : null;

  const [rotation, setRotation] = useState(0);
  const lastWheelRef = useRef(0);
  const touchStartXRef = useRef<number | null>(null);

  const filledCharas = charas.filter((c) => c.name.trim().length > 0);

  const handleDone = async () => {
    if (filledCharas.length === 0 || creating) return;
    if (await create(filledCharas)) {
      setCharas(Array.from({ length: total }, () => ({ name: "", avatar: null })));
      router.push("/home");
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


  const radius = (width ?? 0) / 2;
  const h = imgHeight ?? 0;
  console.log(h)

  let allowAddCard = filledCharas.length < 12;

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
  const maxRotation = filledCharas.length * step;
  const clampRotation = (r: number) => Math.max(0, Math.min(maxRotation, r));

  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelRef.current < 200) return;
    lastWheelRef.current = now;
    const dir = e.deltaY > 0 ? 1 : -1;
    setRotation((prev) => clampRotation(prev + dir * step));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const delta = e.touches[0].clientX - touchStartXRef.current;
    const threshold = 40;
    if (Math.abs(delta) < threshold) return;
    const dir = delta < 0 ? 1 : -1;
    setRotation((prev) => clampRotation(prev + dir * step));
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    touchStartXRef.current = null;
  };

  const activeIndex = ((Math.round((rotation / 360) * total) % total) + total) % total;

  const handleConfirm = () => {
    const target = filledCharas.length;
    if (target >= total) return;
    setRotation(clampRotation(target * step));
  };

  const handleCancel = () => router.push("/home");

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

            {charas.map((c, i) => (
              <div key={`card-${i}`} className={`w-[min(19vh,22vh)] absolute${i === activeIndex ? ' active' : ''}`} style={getSlotStyle(i)}>
                <CharaAdder
                  state={i === activeIndex ? 'ready' : 'sleep'}
                  value={c.name}
                  onValueChange={(n) => updateChara(i, { name: n })}
                  avatar={c.avatar}
                  onAvatarChange={(a) => updateChara(i, { avatar: a })}
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
                <button className="btn btn--secondary text-[1.6667vw]" onClick={handleConfirm}> {/* 24px */}
                  {t("addCard")}
                </button>
              )
            }

            <button
              className="btn btn--primary text-[1.6667vw] disabled:opacity-50" /* 24px */
              onClick={handleDone}
              disabled={creating || filledCharas.length === 0}
            >
              {creating ? t("saving") : t("done")}
            </button>
          </div>
            <button className="btn btn--tertiary text-[1.6667vw]" onClick={handleCancel}> {/* 24px */}
                  {t("cancelAddCard")}
            </button>          
          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        </div>
      </main>
    </div>
  );
}
