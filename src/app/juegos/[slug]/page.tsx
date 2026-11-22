import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GAMES, getGameBySlug } from "@/lib/games";
import { TicTacToeGame } from "@/components/games/TicTacToeGame";
import { ConnectFourGame } from "@/components/games/ConnectFourGame";
import { RockPaperScissorsGame } from "@/components/games/RockPaperScissorsGame";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game) return { title: "Juego no encontrado — DuoArcade" };

  return {
    title: `${game.title} — Juega 1 o 2 jugadores | DuoArcade`,
    description: game.description,
  };
}

export default async function GamePage({ params }: PageProps) {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game) notFound();

  const renderGame = () => {
    switch (game.slug) {
      case "gato":
        return <TicTacToeGame />;
      case "conecta-4":
        return <ConnectFourGame />;
      case "piedra-papel-tijera":
        return <RockPaperScissorsGame />;
      default:
        notFound();
    }
  };

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-12 text-center text-sm text-slate-500">
          Cargando juego...
        </div>
      }
    >
      {renderGame()}
    </Suspense>
  );
}
