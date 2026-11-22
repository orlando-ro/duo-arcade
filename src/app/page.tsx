"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GAMES, type GameMode } from "@/lib/games";
import { AdSlot } from "@/components/AdSlot";

const GAME_CODES: Record<string, string> = {
  gato: "01",
  "conecta-4": "02",
  "piedra-papel-tijera": "03",
  memoria: "04",
  "puntos-y-cajas": "05",
};

function renderGameDiagram(slug: string) {
  switch (slug) {
    case "gato":
      return (
        <div className="grid grid-cols-3 gap-1 w-20 h-20">
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
        <div className="flex gap-1.5 items-end">
          <div className="w-3.5 h-12 border border-on-surface/30 flex flex-col justify-end p-0.5 gap-0.5">
            <div className="w-full h-2.5 bg-primary" />
          </div>
          <div className="w-3.5 h-16 border border-on-surface/30 flex flex-col justify-end p-0.5 gap-0.5">
            <div className="w-full h-2.5 bg-on-surface" />
            <div className="w-full h-2.5 bg-primary" />
          </div>
          <div className="w-3.5 h-20 border border-on-surface/30 flex flex-col justify-end p-0.5 gap-0.5">
            <div className="w-full h-2.5 bg-primary" />
            <div className="w-full h-2.5 bg-on-surface" />
            <div className="w-full h-2.5 bg-primary" />
          </div>
          <div className="w-3.5 h-16 border border-on-surface/30 flex flex-col justify-end p-0.5 gap-0.5">
            <div className="w-full h-2.5 bg-on-surface" />
            <div className="w-full h-2.5 bg-primary" />
          </div>
        </div>
      );
    case "piedra-papel-tijera":
      return (
        <div className="flex items-center gap-3 font-mono text-[11px] font-bold">
          <div className="border border-on-surface px-2.5 py-1.5 uppercase bg-surface-container-lowest">
            PIEDRA
          </div>
          <span className="text-primary font-black">VS</span>
          <div className="border border-primary px-2.5 py-1.5 uppercase text-primary bg-surface-container-lowest">
            TIJERA
          </div>
        </div>
      );
    case "memoria":
      return (
        <div className="grid grid-cols-4 gap-1.5">
          <div className="w-7 h-9 border border-primary bg-primary text-white flex items-center justify-center font-mono text-[10px] font-bold">
            ★
          </div>
          <div className="w-7 h-9 border border-on-surface/30 bg-surface flex items-center justify-center font-mono text-[10px]">
            #
          </div>
          <div className="w-7 h-9 border border-primary bg-primary text-white flex items-center justify-center font-mono text-[10px] font-bold">
            ★
          </div>
          <div className="w-7 h-9 border border-on-surface/30 bg-surface flex items-center justify-center font-mono text-[10px]">
            #
          </div>
        </div>
      );
    case "puntos-y-cajas":
      return (
        <div className="relative w-24 h-16 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="w-1.5 h-1.5 bg-on-surface" />
            <div className="flex-1 h-0.5 bg-on-surface" />
            <span className="w-1.5 h-1.5 bg-on-surface" />
            <div className="flex-1 h-0.5 border-t border-dashed border-on-surface/40" />
            <span className="w-1.5 h-1.5 bg-on-surface" />
          </div>
          <div className="flex justify-between px-0.5 h-7 items-center">
            <div className="w-0.5 h-full bg-on-surface" />
            <div className="w-9 h-full bg-primary/10 border border-primary flex items-center justify-center font-mono text-[8px] font-bold text-primary">
              BOX
            </div>
            <div className="w-0.5 h-full bg-on-surface" />
            <div className="flex-1" />
            <div className="w-0.5 h-full border-l border-dashed border-on-surface/40" />
          </div>
          <div className="flex justify-between items-center">
            <span className="w-1.5 h-1.5 bg-on-surface" />
            <div className="flex-1 h-0.5 bg-on-surface" />
            <span className="w-1.5 h-1.5 bg-on-surface" />
            <div className="flex-1 h-0.5 border-t border-dashed border-on-surface/40" />
            <span className="w-1.5 h-1.5 bg-on-surface" />
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <AdSlot format="leaderboard" className="hidden sm:flex mb-8" />
      <AdSlot format="mobile-banner" className="flex sm:hidden mb-6" />

      {/* Compact Editorial Hero */}
      <section className="pb-8 border-b border-on-surface/15 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-primary">
            Sin registro · 1 o 2 jugadores
          </p>
          <h1 className="mt-2 text-3xl sm:text-5xl font-grotesk font-black uppercase tracking-tight leading-[0.98] text-on-surface">
            Juegos rápidos
            <br />
            <span className="text-primary">en tu navegador.</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-on-surface/70 max-w-lg">
            Juega contra la IA, comparte pantalla o reta a alguien con un
            enlace.
          </p>
        </div>

        {/* Preferred Mode Filter */}
        <div
          role="group"
          aria-label="Filtrar modo inicial"
          className="inline-flex border border-on-surface/25 divide-x divide-on-surface/25 font-mono text-xs uppercase self-start md:self-end"
        >
          {(
            [
              { id: "all", label: "Todos" },
              { id: "1p", label: "vs IA" },
              { id: "local", label: "Local" },
              { id: "remote", label: "Remoto" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedFilter(item.id)}
              className={`px-3.5 py-2 font-medium transition-colors cursor-pointer ${
                selectedFilter === item.id
                  ? "bg-on-surface text-surface-container-lowest"
                  : "bg-surface-container-lowest hover:bg-surface-container text-on-surface"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* Games Grid */}
      <section aria-label="Catálogo de juegos" className="mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map((game) => {
            const code = GAME_CODES[game.slug] ?? "00";
            return (
              <Link
                key={game.id}
                href={getGameHref(game.slug)}
                className="group bg-surface-container-lowest border border-on-surface/20 flex flex-col justify-between hover:border-on-surface hover:shadow-[4px_4px_0px_0px_var(--foreground)] transition-all"
              >
                <div>
                  <div className="px-4 py-3 border-b border-on-surface/15 flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-primary">
                      {code}
                    </span>
                    <span className="font-mono text-[11px] text-outline uppercase">
                      {game.duration}
                    </span>
                  </div>

                  <div className="h-28 bg-surface-container/60 border-b border-on-surface/15 flex items-center justify-center p-4">
                    {renderGameDiagram(game.slug)}
                  </div>

                  <div className="p-5 space-y-1.5 flex-1">
                    <h2 className="font-grotesk font-bold text-lg uppercase tracking-tight text-on-surface group-hover:text-primary transition-colors">
                      {game.title}
                    </h2>
                    <p className="text-xs text-on-surface/70">
                      {game.subtitle}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3.5 border-t border-on-surface/15 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase text-on-surface group-hover:text-primary transition-colors">
                    Jugar
                  </span>
                  <ArrowRight className="h-4 w-4 text-on-surface/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Simplified How It Works */}
      <section
        id="como-funciona"
        aria-labelledby="how-it-works-title"
        className="mt-14 pt-8 border-t border-on-surface/15"
      >
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2
            id="how-it-works-title"
            className="font-grotesk font-bold text-lg uppercase tracking-tight text-on-surface"
          >
            Cómo jugar
          </h2>
          <Link
            href="/salas"
            className="font-mono text-xs font-semibold uppercase text-primary hover:underline"
          >
            Crear sala remota →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <span className="font-mono text-sm font-bold text-primary block">
              01
            </span>
            <h3 className="font-grotesk font-bold text-sm uppercase text-on-surface">
              Individual vs IA
            </h3>
            <p className="text-xs text-on-surface/70 leading-relaxed">
              Practica en solitario contra una IA rápida que bloquea líneas,
              recuerda cartas y cierra cajas.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="font-mono text-sm font-bold text-primary block">
              02
            </span>
            <h3 className="font-grotesk font-bold text-sm uppercase text-on-surface">
              2P en un dispositivo
            </h3>
            <p className="text-xs text-on-surface/70 leading-relaxed">
              Juega por turnos en la misma pantalla junto a un amigo, con
              pantalla oculta en duelos secretos.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="font-mono text-sm font-bold text-primary block">
              03
            </span>
            <h3 className="font-grotesk font-bold text-sm uppercase text-on-surface">
              2P con enlace remoto
            </h3>
            <p className="text-xs text-on-surface/70 leading-relaxed">
              Genera una sala al instante, comparte el código o enlace y juega
              en tiempo real desde cualquier lugar.
            </p>
          </div>
        </div>
      </section>

      <AdSlot format="leaderboard" className="hidden sm:flex mt-10" />
      <AdSlot format="mobile-banner" className="flex sm:hidden mt-8" />
    </div>
  );
}
