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
  onClick?: () => void;
}

export function CharaCardShell({ state = "normal", avatar, name, onClick }: CharaCardShellProps) {
  return (
    <div
      data-state={state}
      onClick={onClick}
      className={`card flex flex-col relative ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="card-top-bar w-full aspect-[250/80] bg-[var(--green)]"></div>
      <div className="mx-auto my-[1.4815vh] w-[78%] aspect-square">{avatar}</div>
      <div className="[writing-mode:vertical-rl] flex flex-col flex-1 items-center">{name}</div>
      {(state === "selected" || state === "active") && (
        <div className={`card-mark card-mark--${state}`}>
          {state === "active" && <span>侍寝中</span>}
        </div>
      )}
    </div>
  );
}
