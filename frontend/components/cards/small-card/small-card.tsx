"use client";

import "./small-card.css";

export interface SmallCardProps {
  image: string | null;
  text: string;
  onClick?: () => void;
}

export function SmallCard({ image, text, onClick }: SmallCardProps) {
  return (
    <div
      className="small-card flex flex-row items-center gap-[1.5vh] p-[1.5vh]"
      onClick={onClick}
    >
      <div className="small-card-cover aspect-square w-[8vh] rounded-[1vh] overflow-hidden bg-white/40 shrink-0">
        {image && <img src={image} alt="" className="w-full h-full object-cover" />}
      </div>
      <span className="text-[2.2vh]">{text}</span>
    </div>
  );
}
