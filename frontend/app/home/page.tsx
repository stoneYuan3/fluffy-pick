"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { CharaListResponse, CommitResponse, type Chara } from "@/lib/schemas";
import { CharaCard } from "@/components/cards/chara-card";
import type { CardState } from "@/components/cards/chara-card-shell";
import { useSelection } from "@/hooks/use-selection";
import { useLongPress } from "@/hooks/use-long-press";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations("home");
  const { user, loading, logout } = useAuth();
  const [charas, setCharas] = useState<Chara[] | null>(null);
  const [charasError, setCharasError] = useState<string | null>(null);
  const [helperOpened, setHelperOpened] = useState<boolean>(false);
  const selection = useSelection<number>();
  const [committing, setCommitting] = useState<boolean>(false);

  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const longPress = useLongPress(() => setDeleteMode(true));

  const [archiving, setArchiving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const deleteDialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  const loadCharas = useCallback(() => {
    return apiFetch("/chara", {}, CharaListResponse)
      .then((data) => setCharas(data.charas))
      .catch((err) => setCharasError(err instanceof Error ? err.message : t("failedLoad")));
  }, [t]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    apiFetch("/chara", {}, CharaListResponse)
      .then((data) => { if (!cancelled) setCharas(data.charas); })
      .catch((err) => { if (!cancelled) setCharasError(err instanceof Error ? err.message : t("failedLoad")); });
    return () => { cancelled = true; };
  }, [user, t]);

  const handleConfirm = async () => {
    if (selection.size === 0 || committing) return;
    setCommitting(true);
    try {
      await apiFetch(
        "/chara/commit",
        { method: "POST", body: JSON.stringify({ ids: Array.from(selection.ids) }) },
        CommitResponse,
      );
      selection.clear();
      await loadCharas();
    } catch (err) {
      setCharasError(err instanceof Error ? err.message : t("failedCommit"));
    } finally {
      setCommitting(false);
    }
  };

  const handleArchive = async () => {
    if (selection.size === 0 || archiving) return;
    setArchiving(true);
    try {
      await apiFetch(
        "/chara/archive",
        { method: "POST", body: JSON.stringify({ ids: Array.from(selection.ids) }) },
        CommitResponse,
      );
      selection.clear();
      setDeleteMode(false);
      await loadCharas();
    } catch (err) {
      setCharasError(err instanceof Error ? err.message : t("failedArchive"));
    } finally {
      setArchiving(false);
    }
  };

  const openDeleteDialog = () => {
    if (selection.size === 0) return;
    deleteDialogRef.current?.showModal();
  };

  const closeDeleteDialog = () => {
    deleteDialogRef.current?.close();
  };

  const handleDelete = async () => {
    if (selection.size === 0 || deleting) return;
    setDeleting(true);
    try {
      await apiFetch(
        "/chara/delete",
        { method: "POST", body: JSON.stringify({ ids: Array.from(selection.ids) }) },
        CommitResponse,
      );
      selection.clear();
      setDeleteMode(false);
      closeDeleteDialog();
      await loadCharas();
    } catch (err) {
      setCharasError(err instanceof Error ? err.message : t("failedDelete"));
      closeDeleteDialog();
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-500">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col items-center gap-[2.2222vw] p-[2.2222vw] relative overflow-hidden justify-center items-center"> {/* gap-8 p-8 */}
        <div className="chara-board flex flex-col items-center p-[2.2222vw]"> {/* p-8 */}
          {charasError && <p className="text-sm text-red-600">{charasError}</p>}
          {charas === null && !charasError && (
            <p className="text-sm text-zinc-500">{t("loadingCharas")}</p>
          )}
          {charas && charas.length === 0 && (
            <p className="text-sm text-zinc-500">{t("empty")}</p>
          )}
          {charas && charas.length > 0 && (
            <div className={`grid grid-cols-[repeat(auto-fill,11.76cqw)] gap-[1.5cqw] w-full ${deleteMode ? 'delete-mode' : ''}`}>
              {charas.map((c) => {
                const displayState: CardState = selection.has(c.id)
                  ? "selected"
                  : c.state === "active"
                    ? "active"
                    : "normal";
                const clickable = c.state !== "active";
                return (
                  <div key={c.id} {...longPress.bind}>
                    <CharaCard
                      id={c.id}
                      name={c.name}
                      avatar={c.avatar}
                      state={displayState}
                      onClick={
                        clickable
                          ? () => {
                            if (longPress.consumeIfFired()) return;
                            selection.toggle(c.id);
                          }
                          : undefined
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {(deleteMode || selection.size > 0) && (
          <div className="flex flex-col items-center gap-[1vw] chara-buttons">
            {
              deleteMode ? (<h4>{t("deleteModeTitle")}</h4>) : (<h4>{t("addModeTitle")}</h4>)
            }
            <div className="flex flex-row gap-[1.1111vw]"> {/* gap-4 */}
              {deleteMode ? (
                <>
                  {selection.size > 0 && (
                    <>
                      <button
                        className="btn btn--secondary disabled:opacity-50"
                        onClick={handleArchive}
                        disabled={archiving || deleting}
                      >
                        {archiving ? t("archiving") : t("moveToArchive")}
                      </button>
                      <button
                        className="btn btn--secondary disabled:opacity-50"
                        onClick={openDeleteDialog}
                        disabled={archiving || deleting}
                      >
                        {t("delete")}
                      </button>
                    </>
                  )}
                  <button
                    className="btn btn--secondary"
                    onClick={() => { setDeleteMode(false); selection.clear(); }}
                  >
                    {t("exitDeleteMode")}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn--primary text-[1.3889vw] disabled:opacity-50" /* 20px */
                    onClick={handleConfirm}
                    disabled={committing}
                  >
                    {committing ? t("committing") : t("commit")}
                  </button>
                  <button
                    className="btn btn--secondary text-[1.3889vw]" /* 20px */
                    onClick={() => selection.clear()}
                    disabled={committing}
                  >
                    {t("cancel")}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="helper-figure absolute right-[2%] bottom-[-8%] flex flex-col items-center gap-[2.2222vw]"> {/* gap-8 */}
          <div className="helper-actions flex flex-col items-center gap-[1.1111vw]">
            {helperOpened && (
              <>
                <Link className="btn btn--secondary" href="/add-card">{t("addCard")}</Link>
                <Link className="btn btn--secondary" href="/settings">{t("settings")}</Link>
                <button
                  onClick={() => {
                    logout();
                    router.replace("/");
                  }}
                  className="btn btn--secondary"
                >
                  {t("logout")}
                </button>
              </>
            )}
          </div>



          <button onClick={() => setHelperOpened((v) => !v)}>
            <img src="./helper.svg" alt="" className="w-[16vw] aspect-[265/390] cursor-pointer" />
          </button>
        </div>

        <dialog
          ref={deleteDialogRef}
          className="delete-dialog m-auto text-center rounded-lg p-6 w-[min(90vw,28rem)] bg-white text-black shadow-xl backdrop:bg-black/40"
        >
          <div className="flex flex-col items-center">
            <h4 className="text-lg font-semibold mb-4">
              {t("deleteConfirm", { count: selection.size })}
            </h4>
            <div className="flex flex-row justify-end gap-3">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={closeDeleteDialog}
                disabled={deleting}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                className="btn btn--primary disabled:opacity-50"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? t("deleting") : t("commit")}
              </button>
            </div>
          </div>

        </dialog>
      </main>
    </div>
  );
}
