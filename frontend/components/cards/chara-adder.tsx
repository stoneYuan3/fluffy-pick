"use client";

import { useEffect, useState } from "react";
import { Images } from "lucide-react";
import { useTranslations } from "next-intl";
import { CharaCardShell } from "./chara-card-shell";
import "./chara-card.css";
import { CardAdderState } from "./chara-card-shell";


export interface CharaAdderProps {
  state: CardAdderState | null
}

export function CharaAdder({ state = "ready" }: CharaAdderProps) {
  const t = useTranslations("addCard");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState<File | null>(null);

  const handleAddCard = () => {
    if (!newName.trim()) return;
    setNewName("");
    setNewAvatar(null);
  };

  useEffect(() => {
    if (!newAvatar) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(newAvatar);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [newAvatar]);

  return (
    <CharaCardShell
      state="add"
      avatar={
        <label className="relative block w-full h-full cursor-pointer rounded-full overflow-hidden group bg-zinc-200 dark:bg-zinc-800">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => setNewAvatar(e.target.files?.[0] ?? null)}
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
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="card-name m-auto border-0 bg-transparent p-0 outline-none focus:ring-0"
          placeholder={t("namePlaceholder")}
        />
      }
    />
  );
}
