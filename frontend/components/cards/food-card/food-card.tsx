
import { SquareCheck } from "lucide-react";
import type { Food } from "@/lib/schemas";
import { SmallCard } from "../small-card/small-card";

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
    <SmallCard onClick={onClick}>
      {cover && <SmallCard.Image image={cover} />}
      <SmallCard.Body>
        <SmallCard.Title text={food.name} />
      </SmallCard.Body>
      <SmallCard.Action>
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
      </SmallCard.Action>
    </SmallCard>
  )
}
