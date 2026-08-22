"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { CharaCard } from "@/components/chara-card";
import { CharaAdder } from "@/components/chara-adder";

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
  const { user, loading, logout } = useAuth();
  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState<File | null>(null);

  const [addedCharas, setAddedCharas] = useState<{ name: string; avatar: File | null }[]>([]);
  const latestChara = addedCharas[addedCharas.length - 1] ?? null;
  const [latestAvatarUrl, setLatestAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!latestChara?.avatar) {
      setLatestAvatarUrl(null);
      return;
    }
    const url = URL.createObjectURL(latestChara.avatar);
    setLatestAvatarUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [latestChara?.avatar]);

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
      await apiFetch("/chara", {
        method: "POST",
        body: JSON.stringify({ charas: payload }),
      });
      setAddedCharas([]);
      router.push("/home");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save");
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
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-16 items-center justify-center px-4">
        <div className="card-adder flex flex-row w-full max-w-[750px]">
          <div className="relative z-0 flex-[1_1_250px] translate-x-[45%] translate-y-[2%] rotate-[-5deg]">
            <CharaCard id={null} name={null} avatar={null} state="deco" />
          </div>
          <div className="relative z-10 flex-[1_1_250px]">
            <CharaAdder
              value={newName}
              onValueChange={setNewName}
              avatar={newAvatar}
              onAvatarChange={setNewAvatar}
            />
          </div>
          <div className="relative z-0 flex-[1_1_250px] translate-x-[-45%] translate-y-[2%] rotate-[5deg]">
            {latestChara ? (
              <CharaCard id={null} name={latestChara.name} avatar={latestAvatarUrl} state="normal" />
            ) : (
              <CharaCard id={null} name={null} avatar={null} state="deco" />
            )}
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-row gap-4">
            <button className="btn btn--primary text-[24px]" onClick={handleAddCard}>
              Add Card
            </button>
            <button
              className="btn btn--secondary text-[24px] disabled:opacity-50"
              onClick={handleDone}
              disabled={submitting || addedCharas.length === 0}
            >
              {submitting ? "Saving..." : "Done"}
            </button>
          </div>
          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        </div>
      </main>
    </div>
  );
}
