"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { useFoods } from "@/hooks/use-foods";
import './add-food.css';

const MAX_PHOTOS = 6;

export default function AddFoodPage() {
  const router = useRouter();
  const t = useTranslations("addFood");
  const { user, loading } = useAuth();
  const { create, creating, error: createErrorObj } = useFoods(null);
  const submitError = createErrorObj
    ? createErrorObj.message || t("failedSave")
    : null;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [photos]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">{t("loading")}</p>
      </div>
    );
  }

  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPhotos((prev) => [...prev, ...files].slice(0, MAX_PHOTOS));
    e.target.value = "";
  };

  const handleRemovePhoto = (i: number) =>
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed || creating) return;
    const ok = await create({
      name: trimmed,
      description: description.length > 0 ? description : null,
      photos,
    });
    if (ok) router.push("/food");
  };

  const handleCancel = () => router.push("/food");

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col items-center justify-center p-[2vh]">
        <div className="section-bg w-[80vh] max-w-full p-[3vh] flex flex-col gap-[2vh]">
          <h1 className="text-[4vh] text-center">{t("title")}</h1>

          <div className="flex flex-col gap-[1.5vh] w-full">
            <label className="text-[2vh] text-center">
              {t("photos")} ({photos.length}/{MAX_PHOTOS})
            </label>
            <div className="grid grid-cols-3 gap-[1vh]">
              {previews.map((src, i) => (
                <div
                  key={src}
                  className="relative aspect-square bg-white rounded overflow-hidden"
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs"
                    aria-label={t("removePhoto")}
                  >
                    ×
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && photos.length != 0 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square bg-white rounded flex items-center justify-center text-[4vh] text-zinc-400"
                >
                  +
                </button>
              )}
              {
                photos.length === 0 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-white rounded flex items-center justify-center text-[4vh] text-zinc-400"
                  >
                    +
                  </button>
                )
              }
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleAddPhotos}
            />
          </div>

          <div className="flex flex-col gap-[1vh] w-full">
            <label className="text-[2vh] text-center" htmlFor="food-name">
              {t("name")}
            </label>
            <input
              id="food-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-[1vh] rounded bg-white text-black text-[1.5vh]"
              placeholder={t("namePlaceholder")}
              maxLength={255}
            />
          </div>

          <div className="flex flex-col gap-[1vh] w-full">
            <label className="text-[2vh] text-center" htmlFor="food-description">
              {t("description")}
            </label>
            <textarea
              id="food-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-[1vh] rounded bg-white text-black min-h-[25vh] whitespace-pre-wrap text-[1.5vh]"
              placeholder={t("descriptionPlaceholder")}
              maxLength={10000}
            />
          </div>

          {submitError && (
            <p className="text-sm text-red-600 text-center">{submitError}</p>
          )}

          <div className="flex flex-row gap-[1.1111vw] justify-center">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleCancel}
              disabled={creating}
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              className="btn btn--primary disabled:opacity-50"
              onClick={handleSubmit}
              disabled={creating || !name.trim()}
            >
              {creating ? t("saving") : t("save")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
