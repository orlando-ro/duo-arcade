"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Copy, LogIn, RefreshCw } from "lucide-react";
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
  const [joinSlug, setJoinSlug] = useState<string>(GAMES[0].slug);
  const [roomCode, setRoomCode] = useState<string>("DUO942");
  const [joinInput, setJoinInput] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const selectedGame =
    GAMES.find((g) => g.slug === selectedSlug) ?? GAMES[0];

  const handleSelectHostGame = (slug: string) => {
    setSelectedSlug(slug);
    setJoinSlug(slug);
  };

  const getShareUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/juegos/${selectedGame.slug}?sala=${roomCode}`;
  };

  const handleRegenerateCode = () => {
    setRoomCode(generateRoomCode());
    setCopied(false);
  };

  const handleCopyShareLink = async () => {
    const url = getShareUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied
    }
  };

  const handleShareWhatsApp = () => {
    const url = getShareUrl();
    if (!url) return;
    const text = `¡Juguemos ${selectedGame.title} en DuoArcade! Entra a mi sala (${roomCode}): ${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleLaunchHostRoom = () => {
    router.push(`/juegos/${selectedGame.slug}?sala=${roomCode}&host=1`);
  };

  const handleJoinGuestRoom = (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = joinInput.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
    if (!clean) return;
    router.push(`/juegos/${joinSlug}?sala=${clean}`);
  };

  const pasteClipboardCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      try {
        const parsed = new URL(text);
        const paramSala = parsed.searchParams.get("sala");
        const matchedGame = GAMES.find((g) =>
          parsed.pathname.includes(`/juegos/${g.slug}`)
        );
        if (matchedGame) {
          setJoinSlug(matchedGame.slug);
        }
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <AdSlot format="leaderboard" className="hidden sm:flex mb-8" />
      <AdSlot format="mobile-banner" className="flex sm:hidden mb-6" />

      {/* Clean Header */}
      <div className="pb-6 mb-8 border-b border-on-surface/15">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
          2P Remoto
        </p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-grotesk font-black uppercase tracking-tight text-on-surface">
          Salas en línea
        </h1>
        <p className="mt-2 text-sm text-on-surface/70">
          Crea una sala y envía el enlace, o introduce un código para unirte.
        </p>
      </div>

      {/* 2-Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Panel 1 — Crear sala */}
        <section className="border border-on-surface/20 bg-surface-container-lowest p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-bold text-primary">01</span>
            <h2 className="font-grotesk font-bold text-lg uppercase text-on-surface">
              Crear sala
            </h2>
          </div>

          <div className="border border-on-surface/15 divide-y divide-on-surface/15">
            {GAMES.map((game) => {
              const isSelected = game.slug === selectedSlug;
              const num = GAME_NUMS[game.slug] ?? "00";
              return (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => handleSelectHostGame(game.slug)}
                  className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-on-surface text-surface-container-lowest"
                      : "bg-surface-container-lowest hover:bg-surface-container text-on-surface"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isSelected ? "text-primary" : "text-outline"
                      }`}
                    >
                      {num}
                    </span>
                    <span className="font-grotesk font-bold text-sm uppercase tracking-tight">
                      {game.title}
                    </span>
                  </div>
                  {isSelected && <ArrowRight className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Generated Room Code & Share */}
          <div className="border border-on-surface/15 bg-surface-container-low p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase text-outline">
                Código de sala
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold tracking-widest text-on-surface">
                  {roomCode}
                </span>
                <button
                  type="button"
                  onClick={handleRegenerateCode}
                  aria-label="Generar nuevo código"
                  title="Generar nuevo código"
                  className="p-1.5 border border-on-surface/20 bg-surface-container-lowest hover:border-on-surface transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="py-2 px-3 border border-on-surface/25 bg-surface-container-lowest hover:border-on-surface font-mono text-xs font-semibold uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-primary" />
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
                onClick={handleShareWhatsApp}
                className="py-2 px-3 border border-on-surface/25 bg-surface-container-lowest hover:border-primary hover:text-primary font-mono text-xs font-semibold uppercase flex items-center justify-center transition-colors cursor-pointer"
              >
                WhatsApp
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLaunchHostRoom}
            className="w-full py-3 px-4 bg-on-surface text-surface-container-lowest hover:bg-primary hover:text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Entrar a la sala</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>

        {/* Panel 2 — Unirse con código */}
        <section className="border border-on-surface/20 bg-surface-container-lowest p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-bold text-primary">02</span>
            <h2 className="font-grotesk font-bold text-lg uppercase text-on-surface">
              Unirse a una sala
            </h2>
          </div>

          <form onSubmit={handleJoinGuestRoom} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="join-game-select"
                className="block font-mono text-[11px] uppercase text-outline"
              >
                Juego
              </label>
              <select
                id="join-game-select"
                value={joinSlug}
                onChange={(e) => setJoinSlug(e.target.value)}
                className="w-full border border-on-surface/25 bg-surface px-3 py-2.5 text-xs font-mono uppercase text-on-surface focus:border-on-surface focus:outline-none cursor-pointer"
              >
                {GAMES.map((g) => (
                  <option key={g.id} value={g.slug}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="join-code-input"
                className="block font-mono text-[11px] uppercase text-outline"
              >
                Código
              </label>
              <div className="border border-on-surface bg-surface flex items-stretch">
                <input
                  id="join-code-input"
                  type="text"
                  maxLength={10}
                  placeholder="CÓDIGO"
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                  className="flex-1 min-w-0 px-3 py-2.5 font-mono text-base font-bold tracking-widest uppercase text-on-surface placeholder:text-on-surface/25 bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={pasteClipboardCode}
                  className="px-3.5 border-l border-on-surface/25 bg-surface-container-low hover:bg-surface-container font-mono text-xs font-semibold uppercase transition-colors cursor-pointer"
                >
                  Pegar
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!joinInput.trim()}
              className="w-full py-3 px-4 bg-primary text-white hover:bg-on-surface font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Unirse a la sala</span>
              <LogIn className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
