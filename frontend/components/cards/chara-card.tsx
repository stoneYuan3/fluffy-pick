"use client";

import { CharaCardShell, type CardState } from "./chara-card-shell";
import { useFitFontSize } from "@/hooks/use-fit-font-size";
import "./chara-card.css";

export interface CharaCardProps {
  id: number | null;
  name: string | null;
  avatar: string | null;
  state?: CardState;
  onClick?: () => void;
}

export function CharaCard({ name, avatar, state = "normal", onClick }: CharaCardProps) {
  const nameRef = useFitFontSize<HTMLSpanElement>([name]);
  return (
    <CharaCardShell
      state={state}
      onClick={onClick}
      avatar={
        avatar ? (
          <img src={avatar} alt="" className="w-full h-full rounded-full aspect-square object-cover" />
        ) : (
          <div className="w-full h-full rounded-full bg-zinc-200 dark:bg-zinc-800" />
        )
      }
      name={name ? <span ref={nameRef} className="m-auto card-name">{name}</span> : null}
    />
  );
}
