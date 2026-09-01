"use client";

import { useEffect, useState } from "react";
import { Images } from "lucide-react";
import { useTranslations } from "next-intl";
import { CharaCardShell } from "./chara-card-shell";
import "./chara-card.css";
import { CardAdderState } from "./chara-card-shell";


export interface CharaAdderProps {
  state?: CardAdderState | null;
  value: string;
  onValueChange: (v: string) => void;
  avatar: File | null;
  onAvatarChange: (f: File | null) => void;
}

export function CharaAdder({ value, onValueChange, avatar, onAvatarChange }: CharaAdderProps) {
  const t = useTranslations("addCard");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!avatar) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(avatar);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatar]);

  return (
    <CharaCardShell
      avatar={
        <label className="relative block w-full h-full cursor-pointer rounded-full overflow-hidden group bg-zinc-200 dark:bg-zinc-800">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => onAvatarChange(e.target.files?.[0] ?? null)}
          />
          {previewUrl ? (
            <img src={previewUrl} alt="" className="w-full h-full object-cover aspect-square" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Images className="w-1/3 h-1/3 text-zinc-500" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            {t("changeAvatar")}
          </div>
        </label>
      }
      name={
        <input
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="card-name m-auto border-0 bg-transparent p-0 outline-none focus:ring-0"
          placeholder={t("namePlaceholder")}
        />
      }
    />
  );
}
