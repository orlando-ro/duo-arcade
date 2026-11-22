"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Copy, LogIn, RefreshCw, Share2 } from "lucide-react";
import { GAMES } from "@/lib/games";
import { generateRoomCode } from "@/lib/useRoomState";
import { AdSlot } from "@/components/AdSlot";

const GAME_NUMS: Record<string, string> = {
  gato: "01",
  "conecta-4": "02",
  "piedra-papel-tijera": "03",
  memoria: "04",
  "puntos-y-cajas": "05",
};

export default function SalasPage() {
  const router = useRouter();
  const [selectedSlug, setSelectedSlug] = useState<string>(GAMES[0].slug);
  const [roomCode, setRoomCode] = useState<string>("DUO942");
  const [joinInput, setJoinInput] = useState<string>("");
  const [roundRule, setRoundRule] = useState<"bo3" | "bo5" | "free">("bo3");
  const [timerRule, setTimerRule] = useState<"off" | "15s" | "30s">("15s");
  const [copied, setCopied] = useState(false);

  const selectedGame =
    GAMES.find((g) => g.slug === selectedSlug) ?? GAMES[0];

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/juegos/${selectedGame.slug}?sala=${roomCode}`
      : `https://duo-arcade-pearl.vercel.app/juegos/${selectedGame.slug}?sala=${roomCode}`;

  const handleRegenerateCode = () => {
    setRoomCode(generateRoomCode());
    setCopied(false);
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const handleShareWhatsApp = () => {
    const text = `¡Juguemos ${selectedGame.title} en DuoArcade! Entra a mi sala (${roomCode}): ${shareUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `DuoArcade — ${selectedGame.title}`,
          text: `Únete a mi sala ${roomCode} en DuoArcade`,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyShareLink();
    }
  };

  const handleLaunchHostRoom = () => {
    router.push(`/juegos/${selectedGame.slug}?sala=${roomCode}&host=1`);
  };

  const handleJoinGuestRoom = () => {
    const clean = joinInput.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
    const targetCode = clean || roomCode;
    router.push(`/juegos/${selectedGame.slug}?sala=${targetCode}`);
  };

  const typeKey = (k: string) => {
    setJoinInput((prev) => (prev.length < 10 ? prev + k : prev));
  };

  const backspaceKey = () => {
    setJoinInput((prev) => prev.slice(0, -1));
  };

  const pasteClipboardCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      try {
        const url = new URL(text);
        const paramSala = url.searchParams.get("sala");
        if (paramSala) {
          setJoinInput(paramSala.trim().toUpperCase().slice(0, 10));
          return;
        }
      } catch {
        // Not a URL, use raw text
      }
      setJoinInput(text.trim().toUpperCase().slice(0, 10));
    } catch {
      // Clipboard permission denied
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-12 space-y-12">
      {/* Top Ad */}
      <div>
        <AdSlot format="leaderboard" className="hidden sm:flex" />
        <AdSlot format="mobile-banner" className="flex sm:hidden" />
      </div>

      {/* 1. Stark Swiss Headline & Technical Subheader */}
      <section className="border-b border-on-surface/15 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold tracking-widest uppercase">
              <span className="inline-block w-3 h-0.5 bg-primary" />
              <span>02 / SALAS REMOTAS — MULTIJUGADOR P2P</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-grotesk font-black text-on-surface tracking-tight uppercase leading-[0.95]">
              Interconexión Instantánea{" "}
              <span className="text-primary">Sin Registro</span>
            </h1>
          </div>
          <div className="lg:col-span-4 border-l border-on-surface/15 lg:pl-6 space-y-2">
            <p className="font-mono text-xs text-on-surface/70 leading-relaxed uppercase">
              {"// Canales de datos efímeros en tiempo real. Negociación determinista de estado, semilla sincronizada y latencia mínima en el navegador."}
            </p>
            <div className="flex items-center gap-4 text-[11px] font-mono text-on-surface/50 pt-1">
              <span>LATENCIA: ~14MS</span>
              <span>•</span>
              <span>PROTOCOLO: REALTIME P2P</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Structured Grid Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT MODULE: CREAR NUEVA SALA (HOST) (7 Cols) */}
        <div className="lg:col-span-7 border border-on-surface/20 bg-surface-container-lowest p-6 sm:p-8 space-y-7">
          {/* Module Header */}
          <div className="flex items-start justify-between border-b border-on-surface/10 pb-4">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-primary font-bold">
                Módulo A.1 // Anfitrión
              </div>
              <h2 className="text-xl sm:text-2xl font-grotesk font-bold text-on-surface uppercase tracking-tight mt-0.5">
                Crear Nueva Sala
              </h2>
              <p className="text-xs font-mono text-on-surface/60 mt-1">
                Configura parámetros de sesión y genera enlace maestro.
              </p>
            </div>
            <span className="font-mono text-xs uppercase px-2 py-0.5 bg-primary text-white font-bold tracking-wider">
              HOST_MODE
            </span>
          </div>

          {/* Game Selector: Clean Typographic Grid / Modernist Table */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline font-mono text-xs uppercase text-on-surface">
              <span className="font-bold tracking-wider">
                {"// 01 Seleccionar Minijuego"}
              </span>
              <span className="text-on-surface/50 text-[11px]">
                0{GAMES.length} PROTOCOLOS DISPONIBLES
              </span>
            </div>
            <div className="border border-on-surface/20 divide-y divide-on-surface/15">
              {GAMES.map((game) => {
                const isSelected = game.slug === selectedSlug;
                const num = GAME_NUMS[game.slug] ?? "00";
                return (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => setSelectedSlug(game.slug)}
                    className={`w-full p-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-on-surface text-surface-container-lowest"
                        : "bg-surface-container-lowest hover:bg-surface-container text-on-surface"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-xs font-bold ${
                          isSelected ? "text-primary" : "text-on-surface/40"
                        }`}
                      >
                        {num}
                      </span>
                      <div>
                        <div className="font-grotesk font-bold text-sm tracking-tight uppercase">
                          {game.title}
                        </div>
                        <div
                          className={`font-mono text-[11px] uppercase ${
                            isSelected
                              ? "text-surface-container-lowest/70"
                              : "text-on-surface/60"
                          }`}
                        >
                          {game.subtitle} • {game.duration}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <>
                          <span className="font-mono text-[10px] tracking-wider px-1.5 py-0.5 bg-primary text-white font-bold">
                            SELECCIONADO
                          </span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      ) : (
                        <span className="font-mono text-[10px] tracking-wider px-1.5 py-0.5 border border-on-surface/20 text-on-surface/60">
                          STANDBY
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rules Configuration: Swiss Segmented Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Rondas */}
            <div className="space-y-2">
              <span className="block font-mono text-[11px] font-bold text-on-surface uppercase tracking-wider">
                {"// 02 Regla de Victoria"}
              </span>
              <div className="grid grid-cols-3 border border-on-surface/25 bg-surface-container-lowest p-0.5 divide-x divide-on-surface/20">
                {(
                  [
                    { id: "bo3", label: "M3 (BO3)" },
                    { id: "bo5", label: "M5 (BO5)" },
                    { id: "free", label: "LIBRE" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRoundRule(item.id)}
                    className={`py-2 text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                      roundRule === item.id
                        ? "bg-on-surface text-surface-container-lowest"
                        : "text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Temporizador */}
            <div className="space-y-2">
              <span className="block font-mono text-[11px] font-bold text-on-surface uppercase tracking-wider">
                {"// 03 Ritmo de Turno"}
              </span>
              <div className="grid grid-cols-3 border border-on-surface/25 bg-surface-container-lowest p-0.5 divide-x divide-on-surface/20">
                {(
                  [
                    { id: "off", label: "00s (OFF)" },
                    { id: "15s", label: "15 SEG" },
                    { id: "30s", label: "30 SEG" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTimerRule(item.id)}
                    className={`py-2 text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                      timerRule === item.id
                        ? "bg-primary text-white"
                        : "text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Swiss CTA Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleLaunchHostRoom}
              className="flex-1 py-4 px-6 bg-on-surface text-surface-container-lowest hover:bg-primary hover:text-white transition-all duration-150 flex items-center justify-between group font-mono text-sm font-bold uppercase tracking-wider border border-on-surface cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-primary group-hover:bg-white inline-block" />
                <span>ABRIR Y ENTRAR A SALA ({roomCode})</span>
              </span>
              <span className="font-mono text-xs opacity-75 group-hover:translate-x-1 transition-transform">
                [↵ LAUNCH]
              </span>
            </button>
            <button
              type="button"
              onClick={handleRegenerateCode}
              title="Generar nuevo código"
              className="py-4 px-4 border border-on-surface bg-surface hover:bg-surface-container font-mono text-xs font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>NUEVO CÓDIGO</span>
            </button>
          </div>

          {/* SHARE MODULE: Minimal Swiss Framing & High Contrast */}
          <div className="border border-on-surface/25 bg-surface-container-low p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-on-surface/15 pb-2.5">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 bg-emerald-600 inline-block" />
                <span>PUNTO DE ACCESO GENERADO</span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-on-surface text-surface-container-lowest tracking-widest">
                ROOM: {roomCode}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              {/* High-Contrast Swiss Minimal QR Frame */}
              <div className="sm:col-span-4 flex flex-col items-center">
                <div className="p-3 bg-white border border-on-surface/30 w-32 h-32 flex items-center justify-center relative">
                  <svg
                    className="w-full h-full text-black"
                    fill="currentColor"
                    viewBox="0 0 100 100"
                  >
                    <rect fill="#000000" height="30" width="30" x="0" y="0" />
                    <rect fill="#ffffff" height="22" width="22" x="4" y="4" />
                    <rect fill="#000000" height="14" width="14" x="8" y="8" />
                    <rect fill="#000000" height="30" width="30" x="70" y="0" />
                    <rect fill="#ffffff" height="22" width="22" x="74" y="4" />
                    <rect fill="#000000" height="14" width="14" x="78" y="8" />
                    <rect fill="#000000" height="30" width="30" x="0" y="70" />
                    <rect fill="#ffffff" height="22" width="22" x="4" y="74" />
                    <rect fill="#000000" height="14" width="14" x="8" y="78" />
                    <rect height="6" width="6" x="36" y="6" />
                    <rect height="6" width="6" x="48" y="6" />
                    <rect height="6" width="6" x="58" y="6" />
                    <rect height="6" width="6" x="36" y="18" />
                    <rect height="6" width="6" x="48" y="24" />
                    <rect height="6" width="12" x="36" y="36" />
                    <rect height="12" width="6" x="54" y="36" />
                    <rect height="6" width="12" x="66" y="36" />
                    <rect height="18" width="6" x="6" y="42" />
                    <rect height="6" width="12" x="18" y="48" />
                    <rect height="18" width="6" x="36" y="54" />
                    <rect height="6" width="18" x="48" y="60" />
                    <rect height="6" width="18" x="72" y="54" />
                    <rect height="12" width="12" x="78" y="66" />
                    <rect height="6" width="18" x="42" y="78" />
                    <rect height="6" width="6" x="48" y="90" />
                    <rect height="12" width="6" x="66" y="84" />
                    <rect height="6" width="12" x="84" y="84" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="w-6 h-6 bg-white border border-black flex items-center justify-center text-primary font-mono font-bold text-xs">
                      +
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-on-surface/60 mt-1 uppercase tracking-tight">
                  QR / P2P LINK
                </span>
              </div>

              {/* Monospaced URL & Actions */}
              <div className="sm:col-span-8 space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[11px] uppercase text-on-surface/70">
                    <span>ENLACE DIRECTO DE INVITACIÓN</span>
                    <span className="text-primary font-bold">READY</span>
                  </div>
                  <div className="flex border border-on-surface/30 bg-surface-container-lowest">
                    <input
                      className="w-full px-3 py-2 font-mono text-xs text-on-surface bg-transparent border-0 focus:outline-none select-all"
                      readOnly
                      type="text"
                      value={shareUrl}
                      aria-label="Enlace directo de sala"
                    />
                    <button
                      type="button"
                      onClick={handleCopyShareLink}
                      className="px-4 py-2 bg-on-surface text-surface-container-lowest hover:bg-primary hover:text-white font-mono text-xs uppercase font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>OK</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>COPIAR</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="py-2 px-3 border border-on-surface/30 bg-surface-container-lowest hover:border-primary hover:text-primary font-mono text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>WHATSAPP</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareNative}
                    className="py-2 px-3 border border-on-surface/30 bg-surface-container-lowest hover:border-on-surface font-mono text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>COMPARTIR OS</span>
                  </button>
                </div>

                <p className="font-mono text-[11px] text-on-surface/60 leading-tight">
                  {"// El jugador invitado se conectará directamente como Jugador 2 al abrir este enlace."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT MODULE: UNIRSE A UNA SALA (GUEST) (5 Cols) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="border border-on-surface/20 bg-surface-container-lowest p-6 sm:p-7 space-y-6">
            <div className="flex items-start justify-between border-b border-on-surface/10 pb-4">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-secondary font-bold">
                  Módulo B.1 // Cliente Remoto
                </div>
                <h2 className="text-xl font-grotesk font-bold text-on-surface uppercase tracking-tight mt-0.5">
                  Unirse a Sala
                </h2>
                <p className="text-xs font-mono text-on-surface/60 mt-1">
                  Introduce el código compartido para entrar al juego{" "}
                  <strong>{selectedGame.title}</strong>.
                </p>
              </div>
              <span className="font-mono text-xs uppercase px-2 py-0.5 border border-on-surface/30 bg-surface-container text-on-surface font-bold tracking-wider">
                GUEST_MODE
              </span>
            </div>

            {/* Monospaced Room Code Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-[11px] uppercase text-on-surface">
                <span className="font-bold">{"// CÓDIGO DE SALA"}</span>
                <span className="text-on-surface/50">FORMATO: [ALFA-NUM]</span>
              </div>
              <div className="border-2 border-on-surface bg-surface-container-lowest p-2">
                <input
                  className="w-full text-center py-2 font-mono text-xl sm:text-2xl font-bold tracking-widest text-on-surface uppercase placeholder:text-on-surface/25 bg-transparent border-0 focus:outline-none"
                  maxLength={10}
                  placeholder="DUO942"
                  type="text"
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            {/* Brutalist / Modernist Numpad with Crisp 1px Borders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-[11px] uppercase text-on-surface/60">
                <span>TECLADO RÁPIDO // INPUT MATRIX</span>
                <button
                  type="button"
                  onClick={() => setJoinInput("")}
                  className="text-primary hover:underline font-bold cursor-pointer"
                >
                  [BORRAR TODO]
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1.5 p-1.5 border border-on-surface/20 bg-surface-container-low font-mono">
                {["1", "2", "3", "A", "4", "5", "6", "B", "7", "8", "9", "C"].map(
                  (key) => {
                    const isLetter = ["A", "B", "C"].includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => typeKey(key)}
                        className={`py-2.5 border border-on-surface/20 text-sm font-bold transition-colors cursor-pointer ${
                          isLetter
                            ? "bg-surface-container text-primary hover:bg-on-surface hover:text-surface-container-lowest"
                            : "bg-surface-container-lowest text-on-surface hover:bg-on-surface hover:text-surface-container-lowest"
                        }`}
                      >
                        {key}
                      </button>
                    );
                  }
                )}
                <button
                  type="button"
                  onClick={() => typeKey("D")}
                  className="py-2.5 bg-surface-container-lowest hover:bg-on-surface hover:text-surface-container-lowest border border-on-surface/20 text-sm font-bold text-on-surface transition-colors cursor-pointer"
                >
                  D
                </button>
                <button
                  type="button"
                  onClick={() => typeKey("0")}
                  className="py-2.5 bg-surface-container-lowest hover:bg-on-surface hover:text-surface-container-lowest border border-on-surface/20 text-sm font-bold text-on-surface transition-colors cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={pasteClipboardCode}
                  className="py-2.5 bg-surface-container border border-on-surface/20 text-xs font-bold text-on-surface hover:bg-on-surface hover:text-surface-container-lowest transition-colors cursor-pointer"
                >
                  PEGAR
                </button>
                <button
                  type="button"
                  onClick={backspaceKey}
                  className="py-2.5 bg-surface-container-high border border-on-surface/20 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                >
                  ⌫
                </button>
              </div>
            </div>

            {/* Join CTA Button */}
            <button
              type="button"
              onClick={handleJoinGuestRoom}
              className="w-full py-3.5 px-6 bg-primary hover:bg-on-surface text-white transition-colors font-mono text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-primary cursor-pointer"
            >
              <span>ENTRAR A LA SALA (CONECTAR P2P)</span>
              <LogIn className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Presets / Architecture Summary */}
          <div className="border border-on-surface/20 bg-surface-container-lowest p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-on-surface/10 pb-2">
              <div className="font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <span>04 // SALAS DE PRUEBA RÁPIDA</span>
              </div>
              <span className="font-mono text-[10px] text-on-surface/50">
                3 CANALES
              </span>
            </div>

            <div className="divide-y divide-on-surface/15 border border-on-surface/15 font-mono text-xs">
              {[
                {
                  initials: "G3",
                  title: "SALA GATO 3×3",
                  code: "GATO01",
                  slug: "gato",
                },
                {
                  initials: "C4",
                  title: "SALA CONECTA 4",
                  code: "CON402",
                  slug: "conecta-4",
                },
                {
                  initials: "PP",
                  title: "SALA PPT SIMULTÁNEO",
                  code: "PPT303",
                  slug: "piedra-papel-tijera",
                },
              ].map((preset) => (
                <div
                  key={preset.code}
                  className="p-2.5 bg-surface-container-lowest hover:bg-surface-container flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-1.5 py-0.5 bg-on-surface text-surface-container-lowest font-bold text-[10px]">
                      {preset.initials}
                    </span>
                    <div>
                      <div className="font-bold text-on-surface">
                        {preset.title}
                      </div>
                      <div className="text-[10px] text-on-surface/60">
                        CÓDIGO: {preset.code} • PÚBLICA
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSlug(preset.slug);
                      setJoinInput(preset.code);
                    }}
                    className="px-2 py-1 border border-on-surface/30 hover:border-primary hover:text-primary text-[10px] font-bold uppercase cursor-pointer"
                  >
                    CARGAR
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. TECHNICAL ARCHITECTURE SECTION: Swiss Modular 3-Column Grid */}
      <section className="border-t border-on-surface/15 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-on-surface/15">
          <div>
            <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
              {"// ESPECIFICACIÓN TÉCNICA"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-grotesk font-bold text-on-surface uppercase tracking-tight mt-1">
              Arquitectura Determinista &amp; P2P
            </h2>
          </div>
          <span className="font-mono text-xs text-on-surface/50 mt-2 sm:mt-0 uppercase">
            SISTEMA DISTRIBUIDO SIN BASE DE DATOS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-on-surface/20 divide-y md:divide-y-0 md:divide-x divide-on-surface/20 bg-surface-container-lowest">
          {/* Column 1 */}
          <div className="p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-primary">
                MOD_01
              </span>
              <span className="font-mono text-[10px] border border-on-surface/20 px-1 py-0.5 uppercase">
                LATENCIA &lt; 20MS
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="font-grotesk font-bold text-lg text-on-surface uppercase tracking-tight">
                Canales Efímeros Realtime
              </h3>
              <p className="font-mono text-xs text-primary font-semibold uppercase">
                Broadcast + Presence / Fallback Local
              </p>
            </div>
            <div className="border border-on-surface/15 p-2 bg-surface-container-low font-mono text-[10px] space-y-1">
              <div className="flex justify-between text-on-surface/70">
                <span>[CLIENTE A]</span>
                <span>------ Broadcast ------&gt;</span>
                <span>[CLIENTE B]</span>
              </div>
              <div className="text-[9px] text-on-surface/50 text-center">
                ZERO DATABASE PERSISTENCE OVERHEAD
              </div>
            </div>
            <p className="text-xs text-on-surface/80 leading-relaxed">
              La conexión entre navegadores utiliza canales efímeros en memoria
              sin persistencia en disco. Si juegas en local entre pestañas, usa
              BroadcastChannel automáticamente.
            </p>
          </div>

          {/* Column 2 */}
          <div className="p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-primary">
                MOD_02
              </span>
              <span className="font-mono text-[10px] border border-on-surface/20 px-1 py-0.5 uppercase">
                ELECCIÓN OCULTA
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="font-grotesk font-bold text-lg text-on-surface uppercase tracking-tight">
                Sincronización Simultánea
              </h3>
              <p className="font-mono text-xs text-secondary font-semibold uppercase">
                Blind Pick / Zero-Cheat
              </p>
            </div>
            <div className="border border-on-surface/15 p-2 bg-surface-container-low font-mono text-[10px] space-y-1">
              <div className="flex justify-between text-on-surface/70">
                <span>JUGADA: OCULTA</span>
                <span>+ SYNC</span>
                <span>= REVELACIÓN</span>
              </div>
              <div className="text-[9px] text-on-surface/50 text-center">
                REVELACIÓN SIMULTÁNEA TRAS AMBOS INPUTS
              </div>
            </div>
            <p className="text-xs text-on-surface/80 leading-relaxed">
              En juegos simultáneos como Piedra, Papel o Tijera, la elección de
              cada jugador permanece oculta hasta que ambos participantes han
              confirmado su movimiento.
            </p>
          </div>

          {/* Column 3 */}
          <div className="p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-primary">
                MOD_03
              </span>
              <span className="font-mono text-[10px] border border-on-surface/20 px-1 py-0.5 uppercase">
                PRNG DETERMINISTA
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="font-grotesk font-bold text-lg text-on-surface uppercase tracking-tight">
                Semillas Idénticas
              </h3>
              <p className="font-mono text-xs text-on-surface/70 font-semibold uppercase">
                Pseudo-Random Seed Sync
              </p>
            </div>
            <div className="border border-on-surface/15 p-2 bg-surface-container-low font-mono text-[10px] space-y-1">
              <div className="flex justify-between text-on-surface/70">
                <span>SEED = HASH(SALA)</span>
                <span>--&gt; Tablero A = B</span>
              </div>
              <div className="text-[9px] text-on-surface/50 text-center">
                Disposición matemática idéntica en ambos clientes
              </div>
            </div>
            <p className="text-xs text-on-surface/80 leading-relaxed">
              Los tableros aleatorios como Memoria 4×4 se barajan con una semilla
              derivada del código de la sala, garantizando que ambos jugadores
              vean exactamente las mismas parejas.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
