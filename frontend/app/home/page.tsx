"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { CharaCard } from "@/components/chara-card";
import type { CardState } from "@/components/chara-card-shell";
import { useSelection } from "@/hooks/use-selection";
import Link from "next/link";

interface Chara {
  id: number;
  name: string;
  avatar: string | null;
  state: "active" | "standby";
}

export default function HomePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [charas, setCharas] = useState<Chara[] | null>(null);
  const [charasError, setCharasError] = useState<string | null>(null);
  const [helperOpened, setHelperOpened] = useState<boolean>(false);
  const selection = useSelection<number>();
  const [committing, setCommitting] = useState<boolean>(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  const loadCharas = useCallback(() => {
    return apiFetch<{ charas: Chara[] }>("/chara")
      .then((data) => setCharas(data.charas))
      .catch((err) => setCharasError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    apiFetch<{ charas: Chara[] }>("/chara")
      .then((data) => { if (!cancelled) setCharas(data.charas); })
      .catch((err) => { if (!cancelled) setCharasError(err instanceof Error ? err.message : "Failed to load"); });
    return () => { cancelled = true; };
  }, [user]);

  const handleConfirm = async () => {
    if (selection.size === 0 || committing) return;
    setCommitting(true);
    try {
      await apiFetch("/chara/commit", {
        method: "POST",
        body: JSON.stringify({ ids: Array.from(selection.ids) }),
      });
      selection.clear();
      await loadCharas();
    } catch (err) {
      setCharasError(err instanceof Error ? err.message : "Failed to commit");
    } finally {
      setCommitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col items-center gap-8 p-8 relative overflow-hidden justify-center items-center">
        <div className="chara-board flex flex-col items-center p-8">
          {charasError && <p className="text-sm text-red-600">{charasError}</p>}
          {charas === null && !charasError && (
            <p className="text-sm text-zinc-500">Loading charas...</p>
          )}
          {charas && charas.length === 0 && (
            <p className="text-sm text-zinc-500">No charas yet.</p>
          )}
          {charas && charas.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,11.76cqw)] gap-[1.5cqw] w-full">
              {charas.map((c) => {
                const displayState: CardState = selection.has(c.id)
                  ? "selected"
                  : c.state === "active"
                    ? "active"
                    : "normal";
                return (
                  <CharaCard
                    key={c.id}
                    id={c.id}
                    name={c.name}
                    avatar={c.avatar}
                    state={displayState}
                    onClick={() => selection.toggle(c.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
        {selection.size > 0 && (
          <div className="flex flex-row gap-4 chara-buttons">
            <button
              className="btn btn--primary text-[20px] disabled:opacity-50"
              onClick={handleConfirm}
              disabled={committing}
            >
              {committing ? "Committing..." : "Confirm"}
            </button>
            <button
              className="btn btn--secondary text-[20px]"
              onClick={() => selection.clear()}
              disabled={committing}
            >
              Cancel
            </button>
          </div>
        )}
        <div className="helper-figure absolute right-[2%] bottom-[-8%] flex flex-col items-center gap-8">
          {helperOpened && (
            <div className="helper-actions flex flex-col items-center gap-4">
              <Link className="btn btn--secondary" href="/add-card">Add Card</Link>
              <button
                onClick={() => {
                  logout();
                  router.replace("/");
                }}
                className="btn btn--secondary"
              >
                Log out
              </button>
            </div>
          )}
          <button onClick={() => setHelperOpened((v) => !v)}>
            <img src="./helper.svg" alt="" className="w-[16vw] aspect-[265/390] cursor-pointer" />
          </button>
        </div>
      </main>
    </div>
  );
}
