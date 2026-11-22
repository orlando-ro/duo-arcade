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

const GAME_MOD_CODE: Record<string, string> = {
  gato: "MOD. 01 / TIC-TAC-TOE",
  "conecta-4": "MOD. 02 / CONNECT-4",
  "piedra-papel-tijera": "MOD. 03 / RPS-DUEL",
  memoria: "MOD. 04 / MEMORY-4X4",
  "puntos-y-cajas": "MOD. 05 / DOTS-BOXES",
};

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
  const [lastEmoji, setLastEmoji] = useState<string>("---");
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

  const modeOperatorText =
    mode === "1p"
      ? "STATE: ACTIVE // OPERATOR: 1P VS IA TÁCTICA"
      : mode === "local"
      ? "STATE: ACTIVE // OPERATOR: 2P LOCAL ARENA"
      : roomCode
      ? `STATE: ACTIVE // OPERATOR: 2P REMOTO (${roomCode})`
      : "STATE: STANDBY // OPERATOR: 2P REMOTO EN LÍNEA";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Ad Slot */}
      <div className="mb-6">
        <AdSlot format="leaderboard" className="hidden sm:flex" />
        <AdSlot format="mobile-banner" className="flex sm:hidden" />
      </div>

      {/* Meta System Bar / Breadcrumb / Mode Selection */}
      <div className="border border-on-surface bg-surface-container-lowest mb-8 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase hover:text-primary transition-colors pr-4 border-r border-on-surface"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Index</span>
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-grotesk font-bold uppercase tracking-tight text-on-surface">
                {game.title}
              </h1>
              <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-primary text-white tracking-widest">
                {GAME_MOD_CODE[game.slug] ?? `MOD // ${game.badge}`}
              </span>
            </div>
            <p className="text-[11px] font-mono text-outline uppercase tracking-wider mt-0.5">
              {modeOperatorText}
            </p>
          </div>
        </div>

        {/* Mode Selector Controls (Rigid Segmented Buttons) */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex border border-on-surface divide-x divide-on-surface text-xs font-mono uppercase font-semibold">
            <button
              type="button"
              onClick={() => onModeChange("1p")}
              className={`px-3.5 py-2 transition-colors cursor-pointer ${
                mode === "1p"
                  ? "bg-on-surface text-surface-container-lowest"
                  : "bg-surface hover:bg-surface-container-high text-on-surface"
              }`}
            >
              1P vs IA
            </button>
            <button
              type="button"
              onClick={() => onModeChange("local")}
              className={`px-3.5 py-2 transition-colors cursor-pointer ${
                mode === "local"
                  ? "bg-on-surface text-surface-container-lowest"
                  : "bg-surface hover:bg-surface-container-high text-on-surface"
              }`}
            >
              2P Local
            </button>
            <button
              type="button"
              onClick={() => onModeChange("remote")}
              className={`px-3.5 py-2 transition-colors cursor-pointer ${
                mode === "remote"
                  ? "bg-on-surface text-surface-container-lowest"
                  : "bg-surface hover:bg-surface-container-high text-on-surface"
              }`}
            >
              2P Remoto
            </button>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            className="h-9 px-3.5 border border-on-surface bg-surface hover:bg-primary hover:text-white hover:border-primary text-xs font-mono uppercase font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reiniciar partida"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 2-Column Content Grid: Board (Col 1-7) & Technical Drawer (Col 8-12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT REGION: Scoreboard, Turn Telemetry & Match Board */}
        <div className="lg:col-span-7 flex flex-col gap-6">{children}</div>

        {/* RIGHT REGION: Technical Drawer, Telemetry & Room Specs */}
        <aside className="lg:col-span-5 flex flex-col gap-6">
          {/* Technical Room Parameters */}
          <div className="border border-on-surface bg-surface-container-lowest">
            <div className="p-3 border-b border-on-surface bg-surface-container flex items-center justify-between">
              <span className="text-xs font-grotesk uppercase font-bold tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 bg-on-surface" />
                Parámetros de Sala
              </span>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 font-semibold ${
                  mode === "remote" && roomCode
                    ? "bg-primary text-white"
                    : "bg-surface border border-on-surface text-on-surface"
                }`}
              >
                {mode === "remote"
                  ? roomCode
                    ? `SYNC (#${roomCode})`
                    : "REMOTO STANDBY"
                  : "MODO LOCAL"}
              </span>
            </div>

            <div className="p-4 space-y-4">
              {mode === "remote" && roomCode ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-outline tracking-wider block mb-1">
                      CÓDIGO DE ENLACE ARCADE
                    </span>
                    <div className="flex items-stretch border border-on-surface">
                      <span className="px-3 py-2 bg-surface font-mono font-bold text-base flex-1 tracking-widest text-on-surface">
                        #{roomCode}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-4 bg-primary text-white hover:bg-on-surface font-mono text-xs uppercase font-bold border-l border-on-surface flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>OK</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Connection Status Pill */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 border border-on-surface/20 bg-surface-container-low font-mono text-xs">
                    <span className="font-bold">
                      ROL: JUGADOR {playerRole ?? (isHost ? 1 : 2)}
                    </span>
                    {roomStatus === "connected" ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        <Wifi className="h-3.5 w-3.5" /> RIVAL CONECTADO
                      </span>
                    ) : roomStatus === "opponent_left" ? (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                        <WifiOff className="h-3.5 w-3.5" /> RIVAL SALIÓ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-outline">
                        <span className="h-2 w-2 bg-primary animate-pulse" />
                        ESPERANDO J2...
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => shareDialogRef.current?.showModal()}
                      className="flex-1 py-2 px-3 bg-on-surface text-surface-container-lowest hover:bg-primary hover:text-white font-mono text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Modal Invitación</span>
                    </button>
                    <button
                      type="button"
                      onClick={onLeaveRoom}
                      className="py-2 px-3 border border-on-surface hover:bg-surface-container-high font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
                    >
                      Salir
                    </button>
                  </div>

                  {usingDemoFallback && (
                    <p className="text-[11px] font-mono text-amber-700 dark:text-amber-400 border border-amber-500/40 bg-amber-500/10 p-2">
                      {"// MODO DEMO LOCAL (BroadcastChannel): Abre el link en otra pestaña de este navegador para probarlo."}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={onCreateRoom}
                      className="flex-1 py-2.5 px-3 bg-primary text-white hover:bg-on-surface font-mono text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      <span>+ Crear Sala P2P</span>
                    </button>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (joinInput.trim()) onJoinRoom(joinInput.trim());
                      }}
                      className="flex items-stretch border border-on-surface"
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
                        className="w-24 bg-surface px-2.5 py-1.5 text-xs font-mono font-bold uppercase focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 bg-on-surface text-surface-container-lowest hover:bg-primary hover:text-white font-mono text-xs font-bold uppercase border-l border-on-surface transition-colors cursor-pointer"
                      >
                        Unirse
                      </button>
                    </form>
                  </div>
                  <p className="text-[11px] font-mono text-outline leading-tight">
                    PROTOCOLO P2P SIN REGISTRO. Crea una sala o introduce un
                    código para sincronizar partidas remotas en tiempo real.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Telemetry & Quick Signal Dispatch */}
          <div className="border border-on-surface bg-surface-container-lowest">
            <div className="p-3 border-b border-on-surface bg-surface-container flex items-center justify-between">
              <span className="text-xs font-grotesk uppercase font-bold tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 bg-primary" />
                Telemetría y Reacciones
              </span>
              <span className="text-[10px] font-mono uppercase text-outline">
                DISPATCH READY
              </span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-6 gap-2">
                {["🔥", "👏", "😱", "🤖", "GG", "🎯"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setLastEmoji(`${emoji} [SENT]`)}
                    className={`h-10 border border-on-surface font-mono flex items-center justify-center transition-colors cursor-pointer ${
                      emoji === "GG"
                        ? "text-xs font-bold hover:bg-on-surface hover:text-surface-container-lowest"
                        : "text-lg hover:bg-surface-container"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="mt-3 p-2 bg-surface border border-surface-container-highest flex items-center justify-between font-mono text-xs">
                <span className="text-[10px] text-outline uppercase tracking-wider">
                  ÚLTIMO DISPATCH:
                </span>
                <span className="font-bold text-sm tracking-widest">
                  {lastEmoji}
                </span>
              </div>
            </div>
          </div>

          {/* Specification & Tactical Module */}
          <div className="border border-on-surface bg-surface-container-lowest">
            <div className="p-3 border-b border-on-surface bg-surface-container flex items-center justify-between">
              <span className="text-xs font-grotesk uppercase font-bold tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 bg-on-surface" />
                Especificación Táctica
              </span>
              <span className="text-[10px] font-mono uppercase text-primary font-bold">
                {game.duration}
              </span>
            </div>
            <div className="p-4 space-y-3 font-mono text-xs">
              <div className="border border-surface-container-highest p-3 bg-surface">
                <span className="font-bold uppercase text-[11px] block text-on-surface mb-0.5">
                  01. Resumen Operativo
                </span>
                <p className="text-[11px] text-outline leading-normal font-inter">
                  {game.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 border border-on-surface bg-surface-container-low text-center">
                  <span className="text-[9px] uppercase tracking-wider block text-outline">
                    LATENCIA
                  </span>
                  <span className="font-bold text-xs">~12ms</span>
                </div>
                <div className="p-2 border border-on-surface bg-surface-container-low text-center">
                  <span className="text-[9px] uppercase tracking-wider block text-outline">
                    MODALIDAD
                  </span>
                  <span className="font-bold text-xs uppercase">{mode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Ad */}
          <AdSlot format="rectangle" />
        </aside>
      </div>

      {/* SEO & AdSense Content Section: Rules and Strategy (Swiss Grid) */}
      <section
        aria-labelledby="rules-strategy-heading"
        className="mt-10 border border-on-surface bg-surface-container-lowest divide-y md:divide-y-0 md:divide-x divide-on-surface grid grid-cols-1 md:grid-cols-2"
      >
        <div className="p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold mb-1">
            {"// PROTOCOLO REGLAMENTARIO"}
          </div>
          <h2
            id="rules-strategy-heading"
            className="text-base font-grotesk font-bold uppercase text-on-surface"
          >
            Reglas de {game.title}
          </h2>
          <ul className="mt-4 space-y-2 text-xs sm:text-sm text-on-surface/80 leading-relaxed list-disc pl-5">
            {game.rules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>

        <div className="p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-secondary font-bold mb-1">
            {"// HEURÍSTICA Y CONSEJOS"}
          </div>
          <h2 className="text-base font-grotesk font-bold uppercase text-on-surface">
            Consejos y estrategia
          </h2>
          <ul className="mt-4 space-y-2 text-xs sm:text-sm text-on-surface/80 leading-relaxed list-disc pl-5">
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

      {/* Native <dialog> Share Room Modal (Swiss Style) */}
      <dialog
        ref={shareDialogRef}
        aria-labelledby="share-dialog-title"
        {...({ closedby: "any" } as Record<string, string>)}
        className="m-auto w-[calc(100%-2rem)] max-w-md border-2 border-on-surface bg-surface-container-lowest p-6 text-on-surface shadow-[8px_8px_0px_0px_var(--foreground)]"
      >
        <div className="flex items-center justify-between border-b border-on-surface/20 pb-3">
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
          Comparte este enlace directo por WhatsApp o Discord para que tu rival
          entre inmediatamente a tu sala <strong>{roomCode}</strong>.
        </p>

        <div className="mt-4 flex items-stretch border border-on-surface bg-surface">
          <input
            type="text"
            readOnly
            value={shareUrl}
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
              className="border border-on-surface px-4 py-2 text-xs font-mono font-bold uppercase hover:bg-on-surface hover:text-surface-container-lowest transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
}
