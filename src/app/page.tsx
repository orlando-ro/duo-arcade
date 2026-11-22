import Link from "next/link";
import { Bot, Globe, Play, Smartphone, Sparkles } from "lucide-react";
import { GAMES } from "@/lib/games";
import { AdSlot } from "@/components/AdSlot";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Top Leaderboard Ad */}
      <div className="mb-8">
        <AdSlot format="leaderboard" className="hidden sm:flex" />
        <AdSlot format="mobile-banner" className="flex sm:hidden" />
      </div>

      {/* Hero */}
      <section className="mb-10 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 sm:p-10 text-white shadow-lg">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Sin registros · Instantáneo · Gratis
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Juegos rápidos para 1 o 2 jugadores
          </h1>
          <p className="mt-3 text-sm sm:text-base text-indigo-100 leading-relaxed">
            Juega contra la IA, reta a alguien en tu mismo teléfono o crea una
            sala y comparte el enlace para jugar en línea al instante.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2">
              <Bot className="h-4 w-4" /> 1 Jugador vs IA
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2">
              <Smartphone className="h-4 w-4" /> 2P Mismo Dispositivo
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2">
              <Globe className="h-4 w-4" /> 2P Remoto con Link
            </span>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section aria-labelledby="catalog-title">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="catalog-title" className="text-xl font-bold tracking-tight">
            Elige un juego
          </h2>
          <span className="text-xs text-slate-500 dark:text-zinc-400">
            {GAMES.length} juegos disponibles
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game) => (
            <Link
              key={game.id}
              href={`/juegos/${game.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-5 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all"
            >
              <div>
                <div
                  className={`mb-4 flex h-28 items-end justify-between rounded-xl bg-gradient-to-br ${game.accent} p-4 text-white`}
                >
                  <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm">
                    {game.badge}
                  </span>
                  <span className="text-xs font-medium opacity-90">
                    {game.duration}
                  </span>
                </div>

                <h3 className="text-lg font-bold tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {game.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-zinc-400">
                  {game.players} · {game.subtitle}
                </p>
                <p className="mt-2.5 text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {game.description}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 pt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>Jugar ahora</span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Play className="h-3.5 w-3.5 fill-current" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom Ad Slot */}
      <div className="mt-10">
        <AdSlot format="leaderboard" className="hidden sm:flex" />
        <AdSlot format="mobile-banner" className="flex sm:hidden" />
      </div>
    </div>
  );
}
