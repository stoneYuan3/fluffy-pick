"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    useDraggable,
    useDroppable,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { HelperFigure } from "@/components/helper-figure";
import { useFoods } from "@/hooks/use-foods";
import { FoodCard } from "@/components/cards/food-card/food-card";
import type { Food } from "@/lib/schemas";

const ACTIVE_ZONE_ID = "active-zone";

function DraggableFoodCard({ food, onClick }: { food: Food; onClick?: () => void }) {
    const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
        id: `food-${food.id}`,
    });
    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{
                transform: CSS.Translate.toString(transform),
                opacity: isDragging ? 0.4 : 1,
                touchAction: "none",
            }}
        >
            <FoodCard food={food} onClick={onClick} />
        </div>
    );
}

function ActiveDropZone({ error, children }: { error: Error | null; children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id: ACTIVE_ZONE_ID });
    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col gap-[1.5vh] p-[1.5vh] overflow-y-auto flex-1 transition-colors ${isOver ? "bg-white/20" : ""}`}
        >
            {error && (
                <p className="text-[1.6vh] text-red-600">{error.message}</p>
            )}
            {children}
        </div>
    );
}

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
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    );
    const [draggingFood, setDraggingFood] = useState<Food | null>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [modalFood, setModalFood] = useState<Food | null>(null);

    const openModal = (food: Food) => {
        setModalFood(food);
        dialogRef.current?.showModal();
    };
    const closeModal = () => {
        dialogRef.current?.close();
    };

    const handleDragStart = (e: DragStartEvent) => {
        const id = Number(String(e.active.id).replace("food-", ""));
        setDraggingFood(normalFoods?.find((f) => f.id === id) ?? null);
    };

    const handleDragEnd = async (e: DragEndEvent) => {
        setDraggingFood(null);
        const { active, over } = e;
        if (!over || over.id !== ACTIVE_ZONE_ID) return;
        const foodId = Number(String(active.id).replace("food-", ""));
        if (Number.isNaN(foodId)) return;
        const moved = normalFoods?.find((f) => f.id === foodId);
        if (!moved) return;
        setNormalFoods((prev) => prev?.filter((f) => f.id !== foodId) ?? null);
        setActiveFoods((prev) => [{ ...moved, status: "active" }, ...(prev ?? [])]);
        setStatus([foodId], "active");
    };

    const handleCheckOff = async (foodId: number) => {
        if (await setActiveStatus([foodId], "normal")) {
            reloadNormal();
        }
    };

    return (
        <div className="flex flex-1 flex-col">
            <main className="flex flex-1 flex-col items-center justify-center gap-[2.2222vw] p-[2.2222vw] relative overflow-hidden">
                <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="section-bg w-[112.109vh] h-[82.031vh] p-[2vh] flex flex-col gap-[2vh] items-center">
                        <h1 className="text-[5vh]">{t("foodTitle")}</h1>
                        <div className="flex-1 flex flex-row w-full gap-[2vh]">
                            <div className="flex flex-col flex-[0.4] border-board">
                                <h2 className="text-[3vh] mx-auto pt-[2vh] mb-0">用膳计划</h2>
                                <ActiveDropZone error={statusError}>
                                    {activeFoods?.map((f) => (
                                        <FoodCard
                                            key={f.id}
                                            food={f}
                                            state="active"
                                            onClick={() => openModal(f)}
                                            onCheckClick={() => handleCheckOff(f.id)}
                                            checkDisabled={activeUpdating}
                                        />
                                    ))}
                                </ActiveDropZone>
                            </div>
                            <div className="flex flex-col flex-[0.6] yellow-board">
                                <h2 className="text-[3vh] mx-auto pt-[2vh] mb-0">菜谱</h2>
                                <div className="grid grid-cols-2 gap-[1.5vh] p-[1.5vh] overflow-y-auto">
                                    {normalFoods?.map((f) => (
                                        <DraggableFoodCard key={f.id} food={f} onClick={() => openModal(f)} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <DragOverlay dropAnimation={null}>
                        {draggingFood && <FoodCard food={draggingFood} />}
                    </DragOverlay>
                    <dialog
                        ref={dialogRef}
                        onClose={() => setModalFood(null)}
                        className="m-auto rounded-lg p-[2vh] w-[min(90vw,50vh)] bg-white text-black shadow-xl backdrop:bg-black/40 max-h-[90vh] overflow-auto"
                    >
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
                                <button type="button" className="btn btn--secondary" onClick={closeModal}>
                                    {t("close")}
                                </button>
                            </div>
                        )}
                    </dialog>
                </DndContext>
                <HelperFigure
                    links={[
                        { href: "/food/add-food", label: "添加菜单" },
                    ]}
                />
            </main>
        </div>
    );
}
