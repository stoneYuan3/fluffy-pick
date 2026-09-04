"use client";

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import {
    DndContext,
    DragOverlay as DndDragOverlay,
    PointerSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import "./two-col-board.css";

const ACTIVE_ZONE_ID = "two-col-active-zone";

type BoardItem = { id: number };

type Ctx = {
    draggingItem: BoardItem | null;
    registerDraggable: (id: number, item: BoardItem) => void;
};

const TwoColBoardContext = createContext<Ctx | null>(null);

const useTwoColBoard = () => {
    const v = useContext(TwoColBoardContext);
    if (!v) throw new Error("TwoColBoard.* must be used inside <TwoColBoard>");
    return v;
};

type TwoColBoardProps = {
    title: string;
    onDropToActive: (item: BoardItem) => void;
    children: ReactNode;
};

function TwoColBoardShell({ title, onDropToActive, children }: TwoColBoardProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    );
    const registryRef = useRef<Map<number, BoardItem>>(new Map());
    const [draggingItem, setDraggingItem] = useState<BoardItem | null>(null);

    const registerDraggable = (id: number, item: BoardItem) => {
        registryRef.current.set(id, item);
    };

    const handleDragStart = (e: DragStartEvent) => {
        const id = Number(e.active.id);
        setDraggingItem(registryRef.current.get(id) ?? null);
    };

    const handleDragEnd = (e: DragEndEvent) => {
        const dropped = draggingItem;
        setDraggingItem(null);
        if (!dropped || !e.over || e.over.id !== ACTIVE_ZONE_ID) return;
        onDropToActive(dropped);
    };

    const ctx = useMemo(
        () => ({ draggingItem, registerDraggable }),
        [draggingItem],
    );

    return (
        <TwoColBoardContext.Provider value={ctx}>
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="section-bg w-[112.109vh] h-[82.031vh] p-[2vh] flex flex-col gap-[2vh] items-center">
                    <h1 className="text-[5vh]">{title}</h1>
                    <div className="flex-1 flex flex-row w-full gap-[2vh]">
                        {children}
                    </div>
                </div>
            </DndContext>
        </TwoColBoardContext.Provider>
    );
}

function ActiveColumn({
    title,
    error,
    children,
}: {
    title: string;
    error?: Error | null;
    children: ReactNode;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: ACTIVE_ZONE_ID });
    return (
        <div className="flex flex-col flex-[0.4] border-board">
            <h2 className="text-[3vh] mx-auto pt-[2vh] mb-0">{title}</h2>
            <div
                ref={setNodeRef}
                className={`flex flex-col gap-[1.5vh] p-[1.5vh] overflow-y-auto flex-1 transition-colors ${isOver ? "bg-white/20" : ""}`}
            >
                {error && (
                    <p className="text-[1.6vh] text-red-600">{error.message}</p>
                )}
                {children}
            </div>
        </div>
    );
}

function NormalColumn({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="flex flex-col flex-[0.6] yellow-board">
            <h2 className="text-[3vh] mx-auto pt-[2vh] mb-0">{title}</h2>
            <div className="grid grid-cols-2 gap-[1.5vh] p-[1.5vh] overflow-y-auto">
                {children}
            </div>
        </div>
    );
}

function Draggable({
    id,
    item,
    children,
}: {
    id: number;
    item: BoardItem;
    children: ReactNode;
}) {
    const { registerDraggable } = useTwoColBoard();
    registerDraggable(id, item);
    const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({ id });
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
            {children}
        </div>
    );
}

function DragOverlay({ children }: { children: (item: BoardItem) => ReactNode }) {
    const { draggingItem } = useTwoColBoard();
    return (
        <DndDragOverlay dropAnimation={null}>
            {draggingItem ? children(draggingItem) : null}
        </DndDragOverlay>
    );
}

function Modal({
    open,
    onClose,
    children,
}: {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const dlg = ref.current;
        if (!dlg) return;
        if (open && !dlg.open) dlg.showModal();
        else if (!open && dlg.open) dlg.close();
    }, [open]);
    return (
        <dialog
            ref={ref}
            onClose={onClose}
            className="m-auto rounded-lg p-[2vh] w-[min(90vw,50vh)] bg-white text-black shadow-xl backdrop:bg-black/40 max-h-[90vh] overflow-auto"
        >
            {open && children}
        </dialog>
    );
}

export const TwoColBoard = Object.assign(TwoColBoardShell, {
    ActiveColumn,
    NormalColumn,
    Draggable,
    DragOverlay,
    Modal,
});
