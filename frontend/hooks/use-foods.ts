import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  CommitResponse,
  Food,
  FoodCreateResponse,
  FoodListResponse,
  type FoodStatus,
} from "@/lib/schemas";

export interface FoodDraft {
  name: string;
  description?: string | null;
  photos: File[];
}

export interface UseFoods {
  foods: Food[] | null;
  error: Error | null;
  creating: boolean;
  deleting: boolean;
  updatingStatus: boolean;
  reload: () => Promise<void>;
  create: (item: FoodDraft) => Promise<boolean>;
  remove: (ids: number[]) => Promise<boolean>;
  setStatus: (ids: number[], status: FoodStatus) => Promise<boolean>;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function useFoods(scope: "normal" | "active" | null): UseFoods {
  const [foods, setFoods] = useState<Food[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const reload = useCallback(async () => {
    if (!scope) return;
    try {
      const data = await apiFetch(`/food/${scope}`, {}, FoodListResponse);
      setFoods(data.foods);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [scope]);

  useEffect(() => {
    if (!scope) return;
    let cancelled = false;
    apiFetch(`/food/${scope}`, {}, FoodListResponse)
      .then((data) => {
        if (!cancelled) setFoods(data.foods);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      });
    return () => {
      cancelled = true;
    };
  }, [scope]);

  const runMutation = useCallback(
    async (setFlag: (v: boolean) => void, fn: () => Promise<void>): Promise<boolean> => {
      setFlag(true);
      setError(null);
      try {
        await fn();
        if (scope) await reload();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return false;
      } finally {
        setFlag(false);
      }
    },
    [reload, scope],
  );

  const create = useCallback(
    (item: FoodDraft) =>
      runMutation(setCreating, async () => {
        const photos = await Promise.all(item.photos.map(fileToBase64));
        await apiFetch(
          "/food",
          {
            method: "POST",
            body: JSON.stringify({
              name: item.name,
              description: item.description ?? null,
              photos,
            }),
          },
          FoodCreateResponse,
        );
      }),
    [runMutation],
  );

  const remove = useCallback(
    (ids: number[]) =>
      runMutation(setDeleting, async () => {
        await apiFetch(
          "/food",
          { method: "DELETE", body: JSON.stringify({ ids }) },
          CommitResponse,
        );
      }),
    [runMutation],
  );

  const setStatus = useCallback(
    (ids: number[], status: FoodStatus) =>
      runMutation(setUpdatingStatus, async () => {
        await apiFetch(
          "/food/status",
          { method: "PUT", body: JSON.stringify({ ids, status }) },
          CommitResponse,
        );
      }),
    [runMutation],
  );

  return {
    foods,
    error,
    creating,
    deleting,
    updatingStatus,
    reload,
    create,
    remove,
    setStatus,
  };
}
