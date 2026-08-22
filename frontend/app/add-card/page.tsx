"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { CharaCard } from "@/components/chara-card";
import { CharaAdder } from "@/components/chara-adder";

export default function AddCardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState<File | null>(null);

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
            <CharaCard id={null} name={null} avatar={null} state="deco" />
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <button className="btn btn--primary text-[24px]">
            Add Card
          </button>
          <button className="btn btn--secondary text-[24px]">
            Done
          </button>          
        </div>
      </main>
    </div>
  );
}
