import { CharaCardShell, type CardState } from "./chara-card-shell";

export interface CharaCardProps {
  id: number | null;
  name: string | null;
  avatar: string | null;
  state?: CardState;
  onClick?: () => void;
}

export function CharaCard({ name, avatar, state = "normal", onClick }: CharaCardProps) {
  return (
    <CharaCardShell
      state={state}
      onClick={onClick}
      avatar={
        avatar ? (
          <img src={avatar} alt="" className="w-full h-full rounded-full aspect-square object-cover" />
        ) : (
          <div className="w-full h-full rounded-full bg-zinc-200 dark:bg-zinc-800" />
        )
      }
      name={name ? <span className="m-auto card-name">{name}</span> : null}
    />
  );
}
