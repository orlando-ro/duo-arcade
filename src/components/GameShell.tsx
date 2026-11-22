"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Check,
  Copy,
  Globe,
  Link2,
  RotateCcw,
  Smartphone,
  Users,
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

  const shareUrl =
    typeof window !== "undefined" && roomCode
      ? `${window.location.origin}/juegos/${game.slug}?sala=${roomCode}`
      : "";

  const handleCopyLink = async () => {
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

    // Safari fallback for closedby="any" (modern-web-guidance)
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Top Ad Slot */}
      <div className="mb-6">
        <AdSlot format="leaderboard" className="hidden sm:flex" />
        <AdSlot format="mobile-banner" className="flex sm:hidden" />
      </div>

      {/* Header + Back */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Volver al catálogo"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {game.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {game.subtitle} · {game.duration}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reiniciar
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-100/80 dark:bg-zinc-900/80 p-1.5">
        <button
          type="button"
          onClick={() => onModeChange("1p")}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            mode === "1p"
              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Bot className="h-4 w-4 shrink-0" />
          <span>1 Jugador</span>
        </button>

        <button
          type="button"
          onClick={() => onModeChange("local")}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            mode === "local"
              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Smartphone className="h-4 w-4 shrink-0" />
          <span>2P Local</span>
        </button>

        <button
          type="button"
          onClick={() => onModeChange("remote")}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            mode === "remote"
              ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Globe className="h-4 w-4 shrink-0" />
          <span>2P Remoto</span>
        </button>
      </div>

      {/* Main Content + Sidebar Ad */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-4 sm:p-6 shadow-sm">
          {/* Remote Room Lobby / Status Bar */}
          {mode === "remote" && (
            <div className="mb-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 p-3.5">
              {!roomCode ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-indigo-500" />
                      Juega con un amigo a distancia
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Crea una sala y comparte el enlace, o únete con un código.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={onCreateRoom}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Crear Sala
                    </button>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (joinInput.trim()) onJoinRoom(joinInput.trim());
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <input
                        type="text"
                        value={joinInput}
                        onChange={(e) =>
                          setJoinInput(e.target.value.toUpperCase())
                        }
                        placeholder="CÓDIGO"
                        maxLength={8}
                        aria-label="Código de sala"
                        className="w-24 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        Unirse
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300">
                      Sala: {roomCode}
                    </span>
                    <span className="text-xs font-medium text-slate-600 dark:text-zinc-300">
                      Eres Jugador {playerRole ?? (isHost ? 1 : 2)}
                    </span>
                    {roomStatus === "connected" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <Wifi className="h-3.5 w-3.5" /> Rival conectado
                      </span>
                    ) : roomStatus === "opponent_left" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <WifiOff className="h-3.5 w-3.5" /> Rival desconectado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-zinc-400">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                        Esperando al Jugador 2...
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => shareDialogRef.current?.showModal()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Invitar / Link
                    </button>
                    <button
                      type="button"
                      onClick={onLeaveRoom}
                      className="rounded-lg border border-slate-300 dark:border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Salir
                    </button>
                  </div>
                </div>
              )}

              {usingDemoFallback && roomCode && (
                <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">
                  Modo Demo local activo (BroadcastChannel): abre el link en otra
                  pestaña de este mismo navegador para probarlo. Configura
                  Supabase en <code>.env.local</code> para juego por internet.
                </p>
              )}
            </div>
          )}

          {children}
        </div>

        {/* Desktop Sidebar Ad + Tips */}
        <aside className="flex flex-col gap-4">
          <AdSlot format="rectangle" />
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-4 text-xs text-slate-600 dark:text-zinc-400">
            <h2 className="font-semibold text-slate-900 dark:text-zinc-100 mb-1.5">
              Resumen rápido
            </h2>
            <p className="leading-relaxed">{game.description}</p>
          </div>
        </aside>
      </div>

      {/* SEO & AdSense Content Section: Rules and Strategy */}
      <section
        aria-labelledby="rules-strategy-heading"
        className="mt-8 grid grid-cols-1 gap-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-5 sm:p-6 md:grid-cols-2"
      >
        <div>
          <h2
            id="rules-strategy-heading"
            className="text-base font-bold text-slate-900 dark:text-zinc-100"
          >
            Reglas de {game.title}
          </h2>
          <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed list-disc pl-5">
            {game.rules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
            Consejos y estrategia
          </h2>
          <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed list-disc pl-5">
            {game.tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bottom Ad Slot */}
      <div className="mt-8">
        <AdSlot format="leaderboard" className="hidden sm:flex" />
        <AdSlot format="mobile-banner" className="flex sm:hidden" />
      </div>

      {/* Native <dialog> Share Room Modal */}
      <dialog
        ref={shareDialogRef}
        aria-labelledby="share-dialog-title"
        {...({ closedby: "any" } as Record<string, string>)}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-slate-900 dark:text-zinc-100 shadow-2xl"
      >
        <h2 id="share-dialog-title" className="text-lg font-bold">
          Invita a tu amigo
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Comparte este enlace por WhatsApp o Discord para que entre directo a tu
          sala <strong>{roomCode}</strong>.
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 p-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            aria-label="Enlace de invitación"
            className="flex-1 bg-transparent px-2 text-xs font-mono text-slate-700 dark:text-zinc-300 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            autoFocus
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
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
              className="rounded-lg border border-slate-200 dark:border-zinc-700 px-4 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
}
