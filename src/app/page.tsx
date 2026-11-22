"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GAMES, type GameMode } from "@/lib/games";
import { AdSlot } from "@/components/AdSlot";

const GAME_TAGS: Record<string, string[]> = {
  gato: ["MINIMAX IA", "REALTIME P2P", "PASS&PLAY"],
  "conecta-4": ["GRAVEDAD DIRECTA", "ESTRATEGIA 7×6", "DUELO REMOTO"],
  "piedra-papel-tijera": ["BLIND PICK", "SERIE BO5", "ANTI-CHEAT"],
  memoria: ["MEMORIA ESPACIAL", "+1 EXTRA TURN", "TABLERO 16"],
  "puntos-y-cajas": ["VECTORES 2D", "CONQUISTA CUADRANTE", "TURNO CONSECUTIVO"],
};

const GAME_SPECS: Record<string, { code: string; gridSpec: string }> = {
  gato: { code: "01", gridSpec: "3×3 GRID" },
  "conecta-4": { code: "02", gridSpec: "7×6 GRAVEDAD" },
  "piedra-papel-tijera": { code: "03", gridSpec: "DUELO SIMULTÁNEO" },
  memoria: { code: "04", gridSpec: "MATRIZ 4×4" },
  "puntos-y-cajas": { code: "05", gridSpec: "TOPOLOGÍA 9C" },
};

function renderGameDiagram(slug: string) {
  switch (slug) {
    case "gato":
      return (
        <div className="grid grid-cols-3 gap-1.5 w-24 h-24">
          <div className="border border-on-surface/30 flex items-center justify-center font-mono font-bold text-xs text-primary">
            X
          </div>
          <div className="border border-on-surface/20" />
          <div className="border border-on-surface/30 flex items-center justify-center font-mono font-bold text-xs text-on-surface">
            O
          </div>
          <div className="border border-on-surface/20" />
          <div className="border border-on-surface/30 flex items-center justify-center font-mono font-bold text-xs text-primary">
            X
          </div>
          <div className="border border-on-surface/20" />
          <div className="border border-on-surface/30 flex items-center justify-center font-mono font-bold text-xs text-on-surface">
            O
          </div>
          <div className="border border-on-surface/20" />
          <div className="border border-on-surface/30 flex items-center justify-center font-mono font-bold text-xs text-primary">
            X
          </div>
        </div>
      );
    case "conecta-4":
      return (
        <div className="flex gap-2 items-end">
          <div className="w-4 h-16 border border-on-surface/30 flex flex-col justify-end p-0.5 gap-1">
            <div className="w-full h-3 bg-primary" />
          </div>
          <div className="w-4 h-20 border border-on-surface/30 flex flex-col justify-end p-0.5 gap-1">
            <div className="w-full h-3 bg-on-surface" />
            <div className="w-full h-3 bg-primary" />
          </div>
          <div className="w-4 h-24 border border-on-surface/30 flex flex-col justify-end p-0.5 gap-1">
            <div className="w-full h-3 bg-primary" />
            <div className="w-full h-3 bg-on-surface" />
            <div className="w-full h-3 bg-primary" />
          </div>
          <div className="w-4 h-20 border border-on-surface/30 flex flex-col justify-end p-0.5 gap-1">
            <div className="w-full h-3 bg-on-surface" />
            <div className="w-full h-3 bg-primary" />
          </div>
        </div>
      );
    case "piedra-papel-tijera":
      return (
        <div className="flex items-center gap-4 font-mono text-xs font-bold">
          <div className="border-2 border-on-surface px-3 py-2 uppercase bg-surface-container-lowest">
            PIEDRA
          </div>
          <span className="text-primary font-black">VS</span>
          <div className="border-2 border-primary px-3 py-2 uppercase text-primary bg-surface-container-lowest">
            TIJERA
          </div>
        </div>
      );
    case "memoria":
      return (
        <div className="grid grid-cols-4 gap-2">
          <div className="w-8 h-10 border border-primary bg-primary text-white flex items-center justify-center font-mono text-[10px] font-bold">
            ★
          </div>
          <div className="w-8 h-10 border border-on-surface/30 bg-surface flex items-center justify-center font-mono text-[10px]">
            #
          </div>
          <div className="w-8 h-10 border border-primary bg-primary text-white flex items-center justify-center font-mono text-[10px] font-bold">
            ★
          </div>
          <div className="w-8 h-10 border border-on-surface/30 bg-surface flex items-center justify-center font-mono text-[10px]">
            #
          </div>
        </div>
      );
    case "puntos-y-cajas":
      return (
        <div className="relative w-28 h-20 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="w-2 h-2 bg-on-surface" />
            <div className="flex-1 h-0.5 bg-on-surface" />
            <span className="w-2 h-2 bg-on-surface" />
            <div className="flex-1 h-0.5 border-t border-dashed border-on-surface/40" />
            <span className="w-2 h-2 bg-on-surface" />
          </div>
          <div className="flex justify-between px-0.5 h-8 items-center">
            <div className="w-0.5 h-full bg-on-surface" />
            <div className="w-10 h-full bg-primary/10 border border-primary flex items-center justify-center font-mono text-[9px] font-bold text-primary">
              BOX
            </div>
            <div className="w-0.5 h-full bg-on-surface" />
            <div className="flex-1" />
            <div className="w-0.5 h-full border-l border-dashed border-on-surface/40" />
          </div>
          <div className="flex justify-between items-center">
            <span className="w-2 h-2 bg-on-surface" />
            <div className="flex-1 h-0.5 bg-on-surface" />
            <span className="w-2 h-2 bg-on-surface" />
            <div className="flex-1 h-0.5 border-t border-dashed border-on-surface/40" />
            <span className="w-2 h-2 bg-on-surface" />
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function HomePage() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | GameMode>("all");

  const getGameHref = (slug: string) => {
    if (selectedFilter === "all") return `/juegos/${slug}`;
    return `/juegos/${slug}?modo=${selectedFilter}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
      {/* Top Leaderboard Ad */}
      <div>
        <AdSlot format="leaderboard" className="hidden sm:flex" />
        <AdSlot format="mobile-banner" className="flex sm:hidden" />
      </div>

      {/* HERO SECTION: Strict Swiss Grid Architecture */}
      <section className="border border-on-surface/20 bg-surface-container-lowest divide-y divide-on-surface/20 shadow-[4px_4px_0px_0px_rgba(28,27,27,0.12)]">
        {/* Top Status Bar in Monospace */}
        <div className="px-6 py-3 bg-surface-container-low flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-on-surface/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary animate-pulse" />
            <span className="font-bold text-on-surface tracking-widest uppercase">
              CATÁLOGO DUO 1P/2P
            </span>
            <span className="text-on-surface/40">|</span>
            <span>ZERO-LATENCY BROWSER ENGINE</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] tracking-wider uppercase">
            <span>
              REGISTRO:{" "}
              <span className="font-bold text-primary">NO REQUERIDO</span>
            </span>
            <span>
              LICENCIA:{" "}
              <span className="font-bold text-on-surface">ABIERTA</span>
            </span>
          </div>
        </div>

        {/* Headline & Editorial Lead */}
        <div className="p-6 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-baseline">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-block font-mono text-xs tracking-widest bg-primary text-white px-2.5 py-1 font-semibold uppercase">
              SECCIÓN 01 / ARQUITECTURA MULTIJUGADOR
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-grotesk font-black uppercase tracking-tighter text-on-surface leading-[0.95]">
              Juegos rápidos
              <br />
              <span className="text-primary">1 o 2</span> jugadores.
            </h1>
            <p className="text-base sm:text-xl font-normal text-on-surface/80 max-w-2xl leading-relaxed pt-2">
              Partidas tácticas de 1 a 3 minutos diseñadas bajo principios de
              claridad matemática. Compite contra algoritmos locales o sincroniza
              en milisegundos mediante salas en tiempo real.
            </p>
          </div>

          {/* Asymmetric Data Block (Right column) */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-on-surface/20 pt-6 lg:pt-0 lg:pl-8 space-y-6">
            <div className="space-y-1">
              <span className="font-mono text-[10px] tracking-widest text-on-surface/60 uppercase">
                DISPONIBILIDAD TOTAL
              </span>
              <div className="font-mono text-3xl font-bold text-on-surface">
                0{GAMES.length} TÍTULOS
              </div>
            </div>
            <div className="space-y-1">
              <span className="font-mono text-[10px] tracking-widest text-on-surface/60 uppercase">
                MODALIDADES COMPATIBLES
              </span>
              <div className="font-mono text-sm font-semibold text-on-surface flex flex-col gap-1">
                <span>[01] RED NEURAL / IA LOCAL</span>
                <span>[02] PASS &amp; PLAY / PANTALLA ÚNICA</span>
                <span>[03] ENLACE SALA REMOTA P2P</span>
              </div>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-primary font-semibold tracking-wider uppercase border border-primary px-2.5 py-1">
                <span className="w-1.5 h-1.5 bg-primary" /> 100% Client-Side
              </span>
            </div>
          </div>
        </div>

        {/* Filter Bar: Stark hairline tabs */}
        <div className="p-4 sm:p-6 bg-background flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-mono text-xs">
            <span className="text-on-surface/50 font-bold uppercase text-[10px] tracking-widest mr-2">
              MODO PREFERIDO:
            </span>
            <button
              type="button"
              onClick={() => setSelectedFilter("all")}
              className={`px-4 py-2 border uppercase font-medium transition-all cursor-pointer ${
                selectedFilter === "all"
                  ? "bg-on-surface text-surface-container-lowest border-on-surface"
                  : "bg-transparent text-on-surface border-on-surface/30 hover:border-on-surface"
              }`}
            >
              [00] Todos (05)
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter("1p")}
              className={`px-4 py-2 border uppercase font-medium transition-all cursor-pointer ${
                selectedFilter === "1p"
                  ? "bg-on-surface text-surface-container-lowest border-on-surface"
                  : "bg-transparent text-on-surface border-on-surface/30 hover:border-on-surface"
              }`}
            >
              [01] Vs IA
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter("local")}
              className={`px-4 py-2 border uppercase font-medium transition-all cursor-pointer ${
                selectedFilter === "local"
                  ? "bg-on-surface text-surface-container-lowest border-on-surface"
                  : "bg-transparent text-on-surface border-on-surface/30 hover:border-on-surface"
              }`}
            >
              [02] Mismo Dispositivo
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter("remote")}
              className={`px-4 py-2 border uppercase font-medium transition-all cursor-pointer ${
                selectedFilter === "remote"
                  ? "bg-on-surface text-surface-container-lowest border-on-surface"
                  : "bg-transparent text-on-surface border-on-surface/30 hover:border-on-surface"
              }`}
            >
              [03] Sala Remota
            </button>
          </div>
          <div className="font-mono text-[11px] text-on-surface/60 uppercase tracking-widest text-right">
            GRID INDEX · SWISS SPEC 2.0
          </div>
        </div>
      </section>

      {/* SECTION TITLE & TABULAR COUNTER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-on-surface pb-4 gap-2">
        <div className="space-y-1">
          <span className="font-mono text-[11px] font-bold text-primary uppercase tracking-widest">
            TABLA DE JUEGOS DISPONIBLES
          </span>
          <h2
            id="catalog-title"
            className="text-3xl sm:text-4xl font-grotesk font-black uppercase tracking-tight text-on-surface"
          >
            Selección Modular
          </h2>
        </div>
        <div className="font-mono text-xs uppercase tracking-wider text-on-surface/70">
          ÍNDICE ACTIVO:{" "}
          <span className="font-bold text-on-surface">
            01 AL 0{GAMES.length}
          </span>{" "}
          / 0{GAMES.length}
        </div>
      </div>

      {/* GAME CARDS: Swiss International Typographic Grid Layout */}
      <section aria-labelledby="catalog-title">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {GAMES.map((game) => {
            const spec = GAME_SPECS[game.slug] ?? {
              code: "00",
              gridSpec: game.badge,
            };
            const tags = GAME_TAGS[game.slug] ?? [
              "1P VS IA",
              "2P LOCAL",
              "2P REMOTO",
            ];

            return (
              <Link
                key={game.id}
                href={getGameHref(game.slug)}
                className="group bg-surface-container-lowest border border-on-surface/20 flex flex-col justify-between hover:border-on-surface hover:shadow-[6px_6px_0px_0px_var(--foreground)] transition-all duration-200"
              >
                <div>
                  {/* Technical Index Header */}
                  <div className="p-5 border-b border-on-surface/15 flex items-center justify-between bg-surface-container-low">
                    <span className="font-mono text-2xl font-black text-primary">
                      {spec.code}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] tracking-widest font-semibold px-2 py-0.5 border border-on-surface/30 uppercase">
                        {spec.gridSpec}
                      </span>
                      <span className="font-mono text-[10px] tracking-widest text-on-surface/60 uppercase">
                        {game.duration}
                      </span>
                    </div>
                  </div>

                  {/* Card Visual Diagram */}
                  <div className="h-36 bg-surface-container border-b border-on-surface/15 flex items-center justify-center p-4 relative overflow-hidden group-hover:bg-background transition-colors">
                    {renderGameDiagram(game.slug)}
                  </div>

                  {/* Content Details */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-grotesk font-black text-xl uppercase tracking-tight text-on-surface group-hover:text-primary transition-colors">
                        {game.title}
                      </h3>
                      <p className="font-mono text-[11px] text-on-surface/60 uppercase tracking-wider pt-1">
                        {game.players} · {game.subtitle}
                      </p>
                    </div>
                    <p className="text-xs text-on-surface/80 leading-relaxed font-normal">
                      {game.description}
                    </p>
                    {/* Technical Tags */}
                    <div className="pt-2 flex flex-wrap gap-1 font-mono text-[9px] uppercase tracking-wider text-on-surface/70">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-surface-container px-2 py-0.5 border border-on-surface/15"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Action Bar */}
                <div className="p-5 border-t border-on-surface/15 bg-surface-container-low flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-on-surface group-hover:text-primary transition-colors">
                    INICIAR PARTIDA
                  </span>
                  <div className="w-8 h-8 border border-on-surface bg-on-surface text-surface-container-lowest flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-colors">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS / TECHNICAL PRINCIPLES (Strict Swiss 3-Column Grid) */}
      <section
        id="como-funciona"
        aria-labelledby="how-it-works-title"
        className="border border-on-surface/20 bg-surface-container-lowest divide-y divide-on-surface/20"
      >
        <div className="p-6 sm:p-10 bg-background flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-block font-mono text-[10px] tracking-widest text-primary uppercase font-bold">
              ESPECIFICACIÓN DE FUNCIONAMIENTO · ARQUITECTURA
            </div>
            <h2
              id="how-it-works-title"
              className="text-2xl sm:text-3xl font-grotesk font-black uppercase tracking-tight text-on-surface"
            >
              ¿Cómo opera la infraestructura DuoArcade?
            </h2>
            <p className="text-sm text-on-surface/80 leading-relaxed font-normal">
              Sin capas intermedias de autenticación pesada. Los duelos operan
              puramente sobre estándares web abiertos y cálculo en el dispositivo
              de origen para partidas de 1 a 3 minutos.
            </p>
          </div>
          <div className="font-mono text-xs uppercase tracking-widest text-on-surface/60 shrink-0">
            SEC. 02 / PROTOCOLOS
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-on-surface/20">
          {/* Column 01 */}
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl font-bold text-primary">
                01
              </span>
              <span className="font-mono text-[10px] tracking-widest uppercase border border-on-surface/20 px-2 py-0.5">
                LOCAL BOT
              </span>
            </div>
            <h3 className="font-grotesk font-bold text-lg uppercase text-on-surface">
              1. Individual vs IA
            </h3>
            <p className="text-xs text-on-surface/70 leading-relaxed">
              Entrena tus tácticas contra un bot determinista que analiza
              amenazas de línea, recuerda cartas volteadas y busca cerrar cajas
              sin depender de servidores externos.
            </p>
          </div>

          {/* Column 02 */}
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl font-bold text-primary">
                02
              </span>
              <span className="font-mono text-[10px] tracking-widest uppercase border border-on-surface/20 px-2 py-0.5">
                SHARED SCREEN
              </span>
            </div>
            <h3 className="font-grotesk font-bold text-lg uppercase text-on-surface">
              2. 2P Pantalla Única
            </h3>
            <p className="text-xs text-on-surface/70 leading-relaxed">
              Mecánica pass-and-play táctil para jugar junto a un amigo en el
              mismo dispositivo, con pantallas intermedias ocultas en duelos de
              elección secreta.
            </p>
          </div>

          {/* Column 03 */}
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl font-bold text-primary">
                03
              </span>
              <span className="font-mono text-[10px] tracking-widest uppercase border border-on-surface/20 px-2 py-0.5">
                REALTIME P2P
              </span>
            </div>
            <h3 className="font-grotesk font-bold text-lg uppercase text-on-surface">
              3. Enlace Remoto
            </h3>
            <p className="text-xs text-on-surface/70 leading-relaxed">
              Generación instantánea de salas con código único. Comparte la URI
              por WhatsApp o Discord y sincroniza cada jugada en tiempo real con
              latencia mínima.
            </p>
          </div>
        </div>

        {/* Terminal Status Bar */}
        <div className="p-4 sm:p-6 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-primary" />
            <span className="font-semibold uppercase tracking-wider text-on-surface">
              ESTADO DEL SISTEMA: SALAS P2P EN LÍNEA
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/salas"
              className="px-4 py-2 border border-on-surface/30 hover:border-on-surface uppercase font-medium transition-colors bg-surface-container-lowest"
            >
              CÓDIGO DE SALA
            </Link>
            <Link
              href="/salas"
              className="px-5 py-2 bg-primary text-white border border-primary uppercase font-bold tracking-wider hover:bg-on-surface hover:border-on-surface transition-colors"
            >
              + GENERAR SALA REMOTA
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Ad Slot */}
      <div>
        <AdSlot format="leaderboard" className="hidden sm:flex" />
        <AdSlot format="mobile-banner" className="flex sm:hidden" />
      </div>
    </div>
  );
}
