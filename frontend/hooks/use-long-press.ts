import { useCallback, useRef } from "react";

export interface LongPressHandlers {
  onPointerDown: () => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
  onPointerCancel: () => void;
}

export interface UseLongPressResult {
  bind: LongPressHandlers;
  consumeIfFired: () => boolean;
}

export function useLongPress(onLongPress: () => void, delay = 1000): UseLongPressResult {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clear();
    firedRef.current = false;
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      timerRef.current = null;
      onLongPress();
    }, delay);
  }, [onLongPress, delay, clear]);

  const consumeIfFired = useCallback(() => {
    if (firedRef.current) {
      firedRef.current = false;
      return true;
    }
    return false;
  }, []);

  return {
    bind: {
      onPointerDown: start,
      onPointerUp: clear,
      onPointerLeave: clear,
      onPointerCancel: clear,
    },
    consumeIfFired,
  };
}
