"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";


export interface HelperLink {
  href: string;
  label: ReactNode;
}

export function HelperFigure({ links }: { links: HelperLink[] }) {
  const [opened, setOpened] = useState(false);
  const t = useTranslations("home");

  return (
    <div className="helper-figure absolute right-[2%] bottom-[-8%] flex flex-col items-center gap-[2.2222vw]"> {/* gap-8 */}
      <div className="helper-actions flex flex-col items-center gap-[1.1111vw]">
        {opened && (
          <>
            {
              links.map((l, i) => (
                <Link key={`${l.href}-${i}`} className="btn btn--secondary" href={l.href}>
                  {l.label}
                </Link>
              ))
            }
            <Link className="btn btn--secondary" href="/home">
              {t("back")}
            </Link>
          </>
        )
        }

      </div>

      <button onClick={() => setOpened((v) => !v)}>
        <img src="./helper.svg" alt="" className="w-[16vw] aspect-[265/390] cursor-pointer" />
      </button>
    </div>
  );
}
