import type { ReactNode } from "react";

export type CardState =
  | "normal"
  | "add"
  | "deco"
  | "button"
  | "selected"
  | "active"
  | "flipped";

export interface CharaCardShellProps {
  state?: CardState;
  avatar?: ReactNode;
  name?: ReactNode;
}

export function CharaCardShell({ state = "normal", avatar, name }: CharaCardShellProps) {
  return (
    <div data-state={state} className="card flex flex-col relative">
      <div className="w-full aspect-[250/80] bg-[var(--green)]"></div>
      <div className="mx-auto my-4 w-[78%] aspect-square">{avatar}</div>
      <div className="[writing-mode:vertical-rl] flex flex-col items-center">{name}</div>
    </div>
  );
}
