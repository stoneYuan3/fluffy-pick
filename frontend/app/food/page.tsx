"use client";

import { useTranslations } from "next-intl";
import { HelperFigure } from "@/components/helper-figure";
import { useFoods } from "@/hooks/use-foods";
import { FoodCard } from "@/components/cards/food-card/food-card";

export default function FoodPage() {
    const t = useTranslations("food");
    const { foods: normalFoods } = useFoods("normal");
    const { foods: activeFoods } = useFoods("active");
    return (
        <div className="flex flex-1 flex-col">
            <main className="flex flex-1 flex-col items-center justify-center">
                <div className="section-bg w-[112.109vh] h-[82.031vh] p-[2vh] flex flex-col gap-[2vh] items-center">
                    <h1 className="text-[5vh]">{t("foodTitle")}</h1>
                    <div className="flex-1 flex flex-row w-full gap-[2vh]">
                        <div className="flex flex-col flex-[0.4] border-board">
                            <h2></h2>
                            <div className="flex flex-col gap-[1.5vh] p-[1.5vh] overflow-y-auto">
                                {activeFoods?.map((f) => (
                                    <FoodCard key={f.id} food={f} state="active" />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col flex-[0.6] yellow-board">
                            <h2></h2>
                            <div className="grid grid-cols-2 gap-[1.5vh] p-[1.5vh] overflow-y-auto">
                                {normalFoods?.map((f) => (
                                    <FoodCard key={f.id} food={f} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <HelperFigure
                    links={[
                        { href: "/food/add-food", label: "添加菜单" },
                    ]}
                />
            </main>
        </div>
    )
}
