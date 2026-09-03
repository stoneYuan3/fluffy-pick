import { ReactNode } from "react";
import "./small-card.css";

type SmallCardShell = {
  children: ReactNode;
  onClick?: () => void;
}
function SmallCardShell({children, onClick}: SmallCardShell) {

  return (
    <div 
      className="small-card flex flex-row items-center gap-[1.5vh] p-[1.5vh]"
      onClick={onClick}
    >
      {children}
    </div>
  )
}

type SmallCardImageProps = {
  image: string | null;
}
function SmallCardImage({image}: SmallCardImageProps) {
  return (
    <div className="small-card-cover aspect-square w-[8vh] rounded-[1vh] overflow-hidden bg-white/40 shrink-0">
      {image && <img src={image} alt="" className="w-full h-full object-cover" />}
    </div>
  )
}

type SmallCardBodyProps = {
  children: ReactNode;
}
function SmallCardBodyProps({children}: SmallCardBodyProps) {
  return (
    <div className="flex flex-col gap-[1vh]">
      {children}
    </div>
  )
}

function SmallCardTitle({
  text,
}: {
  text?: string;
}) {
  return (
    <span className="text-[2.2vh]">{text}</span>
  );
}

function SmallCardAction({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-1 justify-end">
      {children}
    </div>
  );
}

export const SmallCard = Object.assign(SmallCardShell, {
  Image: SmallCardImage,
  Title: SmallCardTitle,
  Body: SmallCardBodyProps,
  Action: SmallCardAction,
});