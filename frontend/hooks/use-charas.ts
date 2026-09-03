import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  CharaCreateResponse,
  CharaListResponse,
  CommitResponse,
  type Chara,
} from "@/lib/schemas";

export interface CharaDraft {
  name: string;
  avatar: File | null;
}

export interface UseCharas {
  charas: Chara[] | null;
  error: Error | null;
  creating: boolean;
  committing: boolean;
  archiving: boolean;
  deleting: boolean;
  reload: () => Promise<void>;
  create: (items: CharaDraft[]) => Promise<boolean>;
  commit: (ids: number[]) => Promise<boolean>;
  archive: (ids: number[]) => Promise<boolean>;
  remove: (ids: number[]) => Promise<boolean>;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function useCharas(scope: "all" | "active" | null): UseCharas {
  const [charas, setCharas] = useState<Chara[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [creating, setCreating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const reload = useCallback(async () => {
    if (!scope) return;
    const path = scope === "all" ? "/chara" : "/chara/active";
    try {
      const data = await apiFetch(path, {}, CharaListResponse);
      setCharas(data.charas);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [scope]);

  useEffect(() => {
    if (!scope) return;
    let cancelled = false;
    const path = scope === "all" ? "/chara" : "/chara/active";
    apiFetch(path, {}, CharaListResponse)
      .then((data) => {
        if (!cancelled) setCharas(data.charas);
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
    (items: CharaDraft[]) =>
      runMutation(setCreating, async () => {
        const payload = await Promise.all(
          items.map(async (c) => ({
            name: c.name,
            avatar: c.avatar ? await fileToBase64(c.avatar) : null,
          })),
        );
        await apiFetch(
          "/chara",
          { method: "POST", body: JSON.stringify({ charas: payload }) },
          CharaCreateResponse,
        );
      }),
    [runMutation],
  );

  const idsMutation = useCallback(
    (endpoint: string, setFlag: (v: boolean) => void) =>
      (ids: number[]) =>
        runMutation(setFlag, async () => {
          await apiFetch(
            endpoint,
            { method: "POST", body: JSON.stringify({ ids }) },
            CommitResponse,
          );
        }),
    [runMutation],
  );

  const commit = useCallback(idsMutation("/chara/commit", setCommitting), [idsMutation]);
  const archive = useCallback(idsMutation("/chara/archive", setArchiving), [idsMutation]);
  const remove = useCallback(idsMutation("/chara/delete", setDeleting), [idsMutation]);

  return {
    charas,
    error,
    creating,
    committing,
    archiving,
    deleting,
    reload,
    create,
    commit,
    archive,
    remove,
  };
}
