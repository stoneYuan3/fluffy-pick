"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { CardState } from "@/components/cards/chara-card-shell";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useFoods } from "@/hooks/use-foods";
import { useCharas } from "@/hooks/use-charas";
import { FoodCard } from "@/components/cards/food-card/food-card";
import { SmallCard } from "@/components/cards/small-card/small-card";

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations("home");
  const { user, loading, logout } = useAuth();
  const {
    foods: activeFoods,
    setStatus: setActiveStatus,
    updatingStatus: activeUpdating,
    error: activeError,
  } = useFoods("active");
  const {
    charas: activeCharas,
    error: activeCharasError,
  } = useCharas(user ? "active" : null);

  const handleCheckOff = (foodId: number) => {
    setActiveStatus([foodId], "normal");
  };

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col p-[2.2222vw] relative overflow-hidden justify-center items-center"> {/* gap-8 p-8 */}
        <div className="flex flex-row w-[135vh] h-[78.418vh] gap-[4vh]"> {/* 1312px, gap 40px */}
          <div className="w-[78.223vh] h-full grid grid-cols-2 gap-[4vh] home-control-panel"> {/* 801px, gap 40px */}
            <Link href="/food" className="flex section-bg aspect-square">{t("linkFood")}</Link>
            <Link href="/chara" className="flex section-bg aspect-square">{t("linkChara")}</Link>
            <Link href="" className="flex section-bg aspect-square">{t("linkPlace")}</Link>
            <div className="flex flex-col flex-1 gap-[3vh]">
              <Link href="/settings" className="flex section-bg w-full h-full">{t("settings")}</Link>
              <button
                onClick={() => {
                  logout();
                  router.replace("/");
                }}
                className="flex section-bg w-full h-full"
              >
                {t("logout")}
              </button>
            </div>
          </div>
          <div className="section-bg w-[53vh] flex flex-col py-[4vh] px-[2vh]"> {/* 478px */}
            <div className="flex flex-col flex-[0.45] w-full items-center min-h-0">
              <h2 className="text-[3vh]">{t("activeChara")}</h2>
              <div className="small-card-sm grid grid-cols-2 gap-[1vh] w-full pt-[1vh] overflow-y-auto px-[0.15vh] pb-[0.5vh]">
                {activeCharasError && (
                  <p className="text-[1.6vh] text-red-600 col-span-2">{activeCharasError.message}</p>
                )}
                {activeCharas === null && !activeCharasError && (
                  <p className="text-[1.6vh] text-zinc-500 col-span-2">{t("loadingCharas")}</p>
                )}
                {activeCharas && activeCharas.length === 0 && (
                  <p className="text-[1.6vh] text-zinc-500 col-span-2">{t("empty")}</p>
                )}
                {activeCharas?.map((c) => (
                  <SmallCard key={c.id} image={c.avatar} text={c.name} />
                ))}
              </div>
            </div>
            <div className="flex flex-row flex-[0.65] gap-[2vh] w-full">
              <div className="flex flex-col flex-1 min-h-0">
                <h2 className="text-[3vh] text-center">{t("activeFood")}</h2>
                <div className="small-card-sm flex flex-col gap-[1.5vh] pt-[1.5vh] py-[0.15vh] overflow-y-auto flex-1 w-full">
                  {activeError && (
                    <p className="text-[1.6vh] text-red-600">{activeError.message}</p>
                  )}
                  {activeFoods?.map((f) => (
                    <FoodCard
                      key={f.id}
                      food={f}
                      state="active"
                      onCheckClick={() => handleCheckOff(f.id)}
                      checkDisabled={activeUpdating}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col flex-1">
                <h2 className="text-[3vh] text-center">{t("activePlace")}</h2>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
