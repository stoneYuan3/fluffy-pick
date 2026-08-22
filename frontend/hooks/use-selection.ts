import { useCallback, useState } from "react";

export interface Selection<T> {
  ids: Set<T>;
  has: (id: T) => boolean;
  toggle: (id: T) => void;
  add: (id: T) => void;
  remove: (id: T) => void;
  clear: () => void;
  size: number;
}

export function useSelection<T>(): Selection<T> {
  const [ids, setIds] = useState<Set<T>>(new Set());

  const has = useCallback((id: T) => ids.has(id), [ids]);
  const toggle = useCallback((id: T) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const add = useCallback((id: T) => setIds((prev) => new Set(prev).add(id)), []);
  const remove = useCallback((id: T) => {
    setIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);
  const clear = useCallback(() => setIds(new Set()), []);

  return { ids, has, toggle, add, remove, clear, size: ids.size };
}