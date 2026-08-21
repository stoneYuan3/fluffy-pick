"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

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
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-black/[.08] bg-white px-6 py-4 dark:border-white/[.08] dark:bg-zinc-950">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">fluffy-pick</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">{user.email}</span>
          <button
            onClick={() => {
              logout();
              router.replace("/");
            }}
            className="rounded-md border border-black/[.12] px-3 py-1 text-xs font-medium hover:bg-black/[.04] dark:border-white/[.16] dark:hover:bg-white/[.06]"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Welcome, {user.name}
        </h1>
      </main>
    </div>
  );
}
