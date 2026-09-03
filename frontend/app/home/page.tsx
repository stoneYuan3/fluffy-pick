"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { CardState } from "@/components/cards/chara-card-shell";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations("home");
  const { user, loading, logout } = useAuth();

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col p-[2.2222vw] relative overflow-hidden justify-center items-center"> {/* gap-8 p-8 */}
        <div className="flex flex-row w-[128.516vh] h-[78.418vh] gap-[4vh]"> {/* 1312px, gap 40px */}
          <div className="w-[78.223vh] h-full grid grid-cols-2 gap-[4vh] home-control-panel"> {/* 801px, gap 40px */}
            <Link href="/food" className="flex section-bg aspect-square">{t("linkFood")}</Link>
            <Link href="/chara" className="flex section-bg aspect-square">{t("linkChara")}</Link>
            <Link href="" className="flex section-bg aspect-square">{t("linkPlace")}</Link>
            <div className="flex flex-col flex-1 gap-[3vh]">
              <Link href="" className="flex section-bg w-full h-full">{t("settings")}</Link>
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
          <div className="section-bg w-[46.68vh] flex flex-col py-[4vh] px-[2vh]"> {/* 478px */}
            <div className="flex flex-col flex-[0.45]">
              <h2 className="text-[4vh]">{t("activeChara")}</h2>
            </div>
            <div className="flex flex-row flex-[0.65] gap-[3vh]">
              <div className="flex flex-col">
                <h2 className="text-[4vh]">{t("activeFood")}</h2>
              </div>
              <div className="flex flex-col">
                <h2 className="text-[4vh]">{t("activePlace")}</h2>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
