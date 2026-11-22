"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Link2,
  RotateCcw,
  Share2,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { GameMeta, GameMode } from "@/lib/games";
import type { PlayerRole, RoomStatus } from "@/lib/useRealtimeRoom";
import { AdSlot } from "./AdSlot";

interface GameShellProps {
  game: GameMeta;
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  roomCode: string;
  isHost: boolean;
  roomStatus?: RoomStatus;
  playerRole?: PlayerRole;
  usingDemoFallback?: boolean;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onLeaveRoom: () => void;
  onReset: () => void;
  children: React.ReactNode;
}

export function GameShell({
  game,
  mode,
  onModeChange,
  roomCode,
  isHost,
  roomStatus,
  playerRole,
  usingDemoFallback,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onReset,
  children,
}: GameShellProps) {
  const [joinInput, setJoinInput] = useState("");
  const [copied, setCopied] = useState(false);
  const shareDialogRef = useRef<HTMLDialogElement>(null);

  const getShareUrl = () => {
    if (typeof window === "undefined" || !roomCode) return "";
    return `${window.location.origin}/juegos/${game.slug}?sala=${roomCode}`;
  };

  const handleCopyLink = async () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  useEffect(() => {
    const dialog = shareDialogRef.current;
    if (!dialog) return;

    if (!("closedBy" in HTMLDialogElement.prototype)) {
      const outside = (e: PointerEvent) => {
        const r = dialog.getBoundingClientRect();
        return (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        );
      };
      let pressedOutside = false;
      const onDown = (e: PointerEvent) => {
        pressedOutside = outside(e);
      };
      const onUp = (e: PointerEvent) => {
        if (pressedOutside && outside(e)) dialog.close();
      };
      dialog.addEventListener("pointerdown", onDown);
      dialog.addEventListener("pointerup", onUp);
      return () => {
        dialog.removeEventListener("pointerdown", onDown);
        dialog.removeEventListener("pointerup", onUp);
      };
    }
  }, []);

  const shareUrlForDialog = getShareUrl();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <AdSlot format="leaderboard" className="hidden sm:flex mb-6" />
      <AdSlot format="mobile-banner" className="flex sm:hidden mb-6" />

      {/* Compact Game Header */}
      <div className="pb-5 mb-6 border-b border-on-surface/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-outline hover:text-primary transition-colors pr-3 border-r border-on-surface/20"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Juegos</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-grotesk font-black uppercase tracking-tight text-on-surface">
            {game.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex border border-on-surface/25 divide-x divide-on-surface/25 font-mono text-xs uppercase font-semibold">
            <button
              type="button"
              onClick={() => onModeChange("1p")}
              className={`px-3 py-2 transition-colors cursor-pointer ${
                mode === "1p"
                  ? "bg-on-surface text-surface-container-lowest"
                  : "bg-surface hover:bg-surface-container text-on-surface"
              }`}
            >
              1P vs IA
            </button>
            <button
              type="button"
              onClick={() => onModeChange("local")}
              className={`px-3 py-2 transition-colors cursor-pointer ${
                mode === "local"
                  ? "bg-on-surface text-surface-container-lowest"
                  : "bg-surface hover:bg-surface-container text-on-surface"
              }`}
            >
              2P Local
            </button>
            <button
              type="button"
              onClick={() => onModeChange("remote")}
              className={`px-3 py-2 transition-colors cursor-pointer ${
                mode === "remote"
                  ? "bg-on-surface text-surface-container-lowest"
                  : "bg-surface hover:bg-surface-container text-on-surface"
              }`}
            >
              2P Remoto
            </button>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="border border-on-surface/25 hover:border-on-surface px-3 py-2 font-mono text-xs uppercase font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-surface"
            title="Reiniciar partida"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Centered Game Column */}
      <div className="max-w-xl mx-auto space-y-5">
        {/* Inline Remote Room Bar (only when mode === "remote") */}
        {mode === "remote" && (
          <div className="border border-on-surface/20 bg-surface-container-lowest p-3.5">
            {!roomCode ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onCreateRoom}
                  className="bg-primary text-white hover:bg-on-surface px-3.5 py-2 font-mono text-xs font-bold uppercase inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  <span>+ Crear sala</span>
                </button>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (joinInput.trim()) onJoinRoom(joinInput.trim());
                  }}
                  className="flex items-stretch border border-on-surface/25"
                >
                  <input
                    type="text"
                    value={joinInput}
                    onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                    placeholder="CÓDIGO"
                    maxLength={10}
                    aria-label="Código de sala"
                    className="flex-1 sm:w-28 bg-surface px-2.5 py-1.5 text-xs font-mono font-bold uppercase focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-on-surface text-surface-container-lowest hover:bg-primary hover:text-white font-mono text-xs font-bold uppercase border-l border-on-surface/25 transition-colors cursor-pointer"
                  >
                    Unirse
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
                    <span className="font-bold text-sm text-on-surface">
                      #{roomCode}
                    </span>
                    <span className="text-outline">
                      J{playerRole ?? (isHost ? 1 : 2)}
                    </span>
                    {roomStatus === "connected" ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <Wifi className="h-3.5 w-3.5" />
                        <span>Rival conectado</span>
                      </span>
                    ) : roomStatus === "opponent_left" ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                        <WifiOff className="h-3.5 w-3.5" />
                        <span>Rival salió</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-outline">
                        <span className="w-2 h-2 bg-primary animate-pulse" />
                        <span>Esperando rival...</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 py-1.5 bg-primary text-white hover:bg-on-surface font-mono text-xs font-bold uppercase inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copiar enlace</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => shareDialogRef.current?.showModal()}
                      aria-label="Compartir invitación"
                      title="Compartir invitación"
                      className="p-1.5 border border-on-surface/25 hover:border-on-surface transition-colors cursor-pointer"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={onLeaveRoom}
                      className="px-2.5 py-1.5 border border-on-surface/25 hover:border-on-surface font-mono text-xs font-semibold uppercase transition-colors cursor-pointer"
                    >
                      Salir
                    </button>
                  </div>
                </div>

                {usingDemoFallback && (
                  <p className="text-[11px] font-mono text-outline">
                    Modo demo local: abre el enlace en otra pestaña para
                    probarlo.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {children}
      </div>

      {/* Rules and Strategy */}
      <section
        aria-labelledby="rules-strategy-heading"
        className="mt-14 pt-8 border-t border-on-surface/15 grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <div>
          <h2
            id="rules-strategy-heading"
            className="font-mono text-xs font-bold uppercase tracking-wider text-primary mb-3"
          >
            Reglas
          </h2>
          <ul className="text-xs sm:text-sm text-on-surface/75 space-y-1.5 list-disc pl-4 leading-relaxed">
            {game.rules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-on-surface/60 mb-3">
            Consejos
          </h2>
          <ul className="text-xs sm:text-sm text-on-surface/75 space-y-1.5 list-disc pl-4 leading-relaxed">
            {game.tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      </section>

      <AdSlot format="leaderboard" className="hidden sm:flex mt-10" />
      <AdSlot format="mobile-banner" className="flex sm:hidden mt-8" />

      {/* Native <dialog> Share Room Modal */}
      <dialog
        ref={shareDialogRef}
        aria-labelledby="share-dialog-title"
        {...({ closedby: "any" } as Record<string, string>)}
        className="m-auto w-[calc(100%-2rem)] max-w-md border border-on-surface bg-surface-container-lowest p-6 text-on-surface shadow-[6px_6px_0px_0px_var(--foreground)]"
      >
        <div className="flex items-center justify-between border-b border-on-surface/15 pb-3">
          <h2
            id="share-dialog-title"
            className="text-lg font-grotesk font-bold uppercase"
          >
            Invita a tu amigo
          </h2>
          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-primary text-white">
            #{roomCode}
          </span>
        </div>

        <p className="mt-3 text-xs font-mono text-on-surface/70 leading-relaxed">
          Comparte este enlace directo para que tu rival entre a tu sala{" "}
          <strong>{roomCode}</strong>.
        </p>

        <div className="mt-4 flex items-stretch border border-on-surface/30 bg-surface">
          <input
            type="text"
            readOnly
            value={shareUrlForDialog}
            aria-label="Enlace de invitación"
            className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-on-surface focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            autoFocus
            className="px-4 py-2 bg-primary text-white hover:bg-on-surface font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copiado
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copiar
              </>
            )}
          </button>
        </div>

        <div className="mt-5 flex justify-end">
          <form method="dialog">
            <button
              type="submit"
              className="border border-on-surface/25 px-4 py-2 text-xs font-mono font-bold uppercase hover:border-on-surface transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
}
