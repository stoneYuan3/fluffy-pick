import { useLayoutEffect, useRef } from "react";

export function useFitFontSize<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T | null>(null);
  console.log(ref)

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      // child element overflows but parent dont
      const parent = el.parentElement;
      console.log(parent)
      if (!parent) return;
      el.style.fontSize = "";
      const vwPx = window.innerWidth / 100;
      const maxPx = parseFloat(getComputedStyle(el).fontSize);
      let sizePx = maxPx;
      const overflows = () =>
        el.offsetHeight > parent.clientHeight || el.offsetWidth > parent.clientWidth;
      while (overflows() && sizePx > 6) {
        sizePx -= 0.5;
        el.style.fontSize = `${sizePx / vwPx}vw`;
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
