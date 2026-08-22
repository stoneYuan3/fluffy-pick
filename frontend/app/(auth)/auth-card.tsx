import type { ReactNode } from "react";

export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-black text-center dark:text-zinc-50">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}

export const inputCls =
  "w-full rounded-md border border-black/[.12] bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-black focus:ring-1 focus:ring-black dark:border-white/[.16] dark:focus:border-white dark:focus:ring-white";

export const buttonCls =
  " btn btn--primary";