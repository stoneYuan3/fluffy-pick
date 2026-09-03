"use client";

import { SquareCheck } from "lucide-react";
import type { Food } from "@/lib/schemas";
import "./food-card.css";

export type FoodCardState = "normal" | "active";

export interface FoodCardProps {
  food: Food;
  state?: FoodCardState;
  onClick?: () => void;
  onCheckClick?: () => void;
  checkDisabled?: boolean;
}

export function FoodCard({ food, state = "normal", onClick, onCheckClick, checkDisabled }: FoodCardProps) {
  const cover = food.photos[0];
  return (
    <div
      className="food-card flex flex-row items-center justify-between p-[1.5vh]"
      onClick={onClick}
    >
      <div className="flex flex-row items-center gap-[1.5vh]">
        <div className="aspect-square w-[8vh] rounded overflow-hidden bg-white/40 shrink-0">
          {cover && <img src={cover} alt="" className="w-full h-full object-cover" />}
        </div>
        <span className="text-[2.2vh]">{food.name}</span>
      </div>
      {state === "active" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCheckClick?.();
          }}
          disabled={checkDisabled}
          className="disabled:opacity-30"
          aria-label="Mark as consumed"
        >
          <SquareCheck className="w-[2vh] h-[2vh] opacity-50 shrink-0" aria-hidden />
        </button>
      )}
    </div>
  );
}
