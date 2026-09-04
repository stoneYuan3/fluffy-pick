"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { HelperFigure } from "@/components/helper-figure";
import { useFoods } from "@/hooks/use-foods";
import { FoodCard } from "@/components/cards/food-card/food-card";
import { TwoColBoard } from "@/components/two-col-board/two-col-board";
import type { Food } from "@/lib/schemas";

export default function FoodPage() {
    const t = useTranslations("food");
    const {
        foods: normalFoods,
        setFoods: setNormalFoods,
        setStatus,
        error: normalError,
        reload: reloadNormal,
    } = useFoods("normal");
    const {
        foods: activeFoods,
        setFoods: setActiveFoods,
        setStatus: setActiveStatus,
        updatingStatus: activeUpdating,
        error: activeError,
    } = useFoods("active");
    const statusError = normalError ?? activeError;
    const [modalFood, setModalFood] = useState<Food | null>(null);

    const handleCheckOff = async (foodId: number) => {
        if (await setActiveStatus([foodId], "normal")) {
            reloadNormal();
        }
    };

    return (
        <div className="flex flex-1 flex-col">
            <main className="flex flex-1 flex-col items-center justify-center gap-[2.2222vw] p-[2.2222vw] relative overflow-hidden">
                <TwoColBoard
                    title={t("foodTitle")}
                    onDropToActive={(item) => {
                        const food = item as Food;
                        setNormalFoods((prev) => prev?.filter((f) => f.id !== food.id) ?? null);
                        setActiveFoods((prev) => [{ ...food, status: "active" }, ...(prev ?? [])]);
                        setStatus([food.id], "active");
                    }}
                >
                    <TwoColBoard.ActiveColumn title={t("activeFoodTitle")} error={statusError}>
                        {activeFoods?.map((f) => (
                            <FoodCard
                                key={f.id}
                                food={f}
                                state="active"
                                onClick={() => setModalFood(f)}
                                onCheckClick={() => handleCheckOff(f.id)}
                                checkDisabled={activeUpdating}
                            />
                        ))}
                    </TwoColBoard.ActiveColumn>

                    <TwoColBoard.NormalColumn title={t("storedFoodTitle")}>
                        {normalFoods?.map((f) => (
                            <TwoColBoard.Draggable key={f.id} id={f.id} item={f}>
                                <FoodCard food={f} onClick={() => setModalFood(f)} />
                            </TwoColBoard.Draggable>
                        ))}
                    </TwoColBoard.NormalColumn>

                    <TwoColBoard.DragOverlay>
                        {(item) => <FoodCard food={item as Food} />}
                    </TwoColBoard.DragOverlay>

                    <TwoColBoard.Modal open={!!modalFood} onClose={() => setModalFood(null)}>
                        {modalFood && (
                            <div className="flex flex-col gap-[2vh]">
                                <div className="grid grid-cols-3 gap-[1vh]">
                                    {modalFood.photos.map((src, i) => (
                                        <div key={i} className="aspect-square rounded overflow-hidden bg-white/40">
                                            <img src={src} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <h1 className="text-[4vh]">{modalFood.name}</h1>
                                {modalFood.description && (
                                    <p className="text-[1.7vh] whitespace-pre-wrap">{modalFood.description}</p>
                                )}
                                <button type="button" className="btn btn--secondary" onClick={() => setModalFood(null)}>
                                    {t("close")}
                                </button>
                            </div>
                        )}
                    </TwoColBoard.Modal>
                </TwoColBoard>
                <HelperFigure
                    links={[
                        { href: "/food/add-food", label: "添加菜单" },
                    ]}
                />
            </main>
        </div>
    );
}
