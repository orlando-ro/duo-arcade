export type GameMode = "1p" | "local" | "remote";

export interface GameMeta {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  players: string;
  duration: string;
  accent: string;
  badge: string;
}

export const GAMES: GameMeta[] = [
  {
    id: "gato",
    slug: "gato",
    title: "Gato (Tres en Raya)",
    subtitle: "Clásico 3×3 rápido",
    description:
      "Alinea 3 símbolos antes que tu rival. Ideal para partidas relámpago contra la IA, en el mismo celular o por link.",
    players: "1 o 2 jugadores",
    duration: "~1 min",
    accent: "from-indigo-500 to-violet-600",
    badge: "Clásico",
  },
  {
    id: "conecta-4",
    slug: "conecta-4",
    title: "Conecta 4",
    subtitle: "Estrategia vertical 7×6",
    description:
      "Deja caer tus fichas y conecta 4 en línea horizontal, vertical o diagonal antes de que te bloqueen.",
    players: "1 o 2 jugadores",
    duration: "~3 min",
    accent: "from-rose-500 to-amber-500",
    badge: "Estrategia",
  },
  {
    id: "piedra-papel-tijera",
    slug: "piedra-papel-tijera",
    title: "Piedra, Papel o Tijera",
    subtitle: "Al mejor de 5 rondas",
    description:
      "El duelo definitivo. En modo remoto ambos eligen en secreto al mismo tiempo; en local incluye pantalla oculta.",
    players: "1 o 2 jugadores",
    duration: "~1 min",
    accent: "from-emerald-500 to-teal-600",
    badge: "Duelo",
  },
];

export function getGameBySlug(slug: string): GameMeta | undefined {
  return GAMES.find((g) => g.slug === slug);
}
