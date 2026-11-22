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
  rules: string[];
  tips: string[];
}

export const GAMES: GameMeta[] = [
  {
    id: "gato",
    slug: "gato",
    title: "Gato (Tres en Raya)",
    subtitle: "Clásico 3×3 rápido",
    description:
      "Alinea 3 símbolos iguales (X u O) en horizontal, vertical o diagonal antes que tu rival. Ideal para partidas relámpago contra la IA, en el mismo celular o por enlace.",
    players: "1 o 2 jugadores",
    duration: "~1 min",
    accent: "from-indigo-500 to-violet-600",
    badge: "Clásico",
    rules: [
      "El tablero tiene 9 casillas organizadas en una cuadrícula de 3×3.",
      "El Jugador 1 utiliza el símbolo X y siempre realiza el primer movimiento; el Jugador 2 (o la IA) utiliza el símbolo O.",
      "Por turnos, cada jugador marca una casilla vacía.",
      "Gana el primer jugador que consiga alinear 3 de sus símbolos en fila horizontal, columna vertical o diagonal.",
      "Si las 9 casillas se llenan sin que nadie logre una línea de 3, la ronda termina en empate.",
    ],
    tips: [
      "Controla el centro: ocupar la casilla central en tu primer turno te da acceso a 4 posibles líneas ganadoras.",
      "Usa las esquinas: si el centro ya está ocupado, las esquinas son la mejor defensa y abren oportunidades de crear amenazas dobles (tenazas).",
      "Prioriza bloquear: antes de buscar tu propia línea, verifica siempre si tu rival tiene 2 símbolos alineados con una tercera casilla libre.",
    ],
  },
  {
    id: "conecta-4",
    slug: "conecta-4",
    title: "Conecta 4",
    subtitle: "Estrategia vertical 7×6",
    description:
      "Deja caer tus fichas en cualquiera de las 7 columnas y conecta 4 del mismo color en línea horizontal, vertical o diagonal antes de que te bloqueen.",
    players: "1 o 2 jugadores",
    duration: "~3 min",
    accent: "from-rose-500 to-amber-500",
    badge: "Estrategia",
    rules: [
      "El tablero vertical cuenta con 7 columnas y 6 filas.",
      "En cada turno eliges una columna con espacio disponible y tu ficha cae hasta la posición más baja libre de esa columna.",
      "El Jugador 1 juega con fichas rojas y el Jugador 2 (o la IA) con fichas amarillas.",
      "La partida termina inmediatamente cuando un jugador conecta 4 fichas consecutivas de su color en dirección horizontal, vertical o diagonal.",
      "Si las 42 posiciones del tablero se llenan sin un ganador, se declara empate.",
    ],
    tips: [
      "Domina la columna central (columna 4): cualquier línea horizontal de 4 fichas debe pasar por la columna central, por lo que controlarla multiplica tus opciones y limita las del rival.",
      "Prepara ataques en diagonal: las diagonales son más difíciles de detectar a simple vista que las filas o columnas.",
      "Cuidado con dónde colocas tu ficha: a veces jugar en una columna le sirve de escalón a tu rival para completar su cuarta ficha justo encima de la tuya.",
    ],
  },
  {
    id: "piedra-papel-tijera",
    slug: "piedra-papel-tijera",
    title: "Piedra, Papel o Tijera",
    subtitle: "Al mejor de 5 rondas",
    description:
      "El duelo rápido por excelencia: primero en llegar a 3 victorias gana la serie. En modo remoto ambos eligen en secreto al mismo tiempo; en local incluye pantalla oculta.",
    players: "1 o 2 jugadores",
    duration: "~1 min",
    accent: "from-emerald-500 to-teal-600",
    badge: "Duelo",
    rules: [
      "Cada jugador selecciona en secreto una de las tres opciones: Piedra, Papel o Tijera.",
      "Piedra vence a Tijera (la rompe), Tijera vence a Papel (lo corta) y Papel vence a Piedra (la envuelve).",
      "Si ambos jugadores eligen la misma opción, la ronda es un empate y no suma puntos para ninguno.",
      "La partida completa se juega al mejor de 5 rondas efectivas: el primer jugador en alcanzar 3 puntos gana el duelo.",
    ],
    tips: [
      "Observa patrones tras una derrota: muchos jugadores tienden a cambiar a la opción que habría vencido a la jugada anterior de su rival.",
      "Varía tu apertura: evita repetir siempre la misma primera jugada cuando juegues varias revanchas seguidas con el mismo amigo.",
      "En modo local (mismo dispositivo), aprovecha la pantalla intermedia de bloqueo para pasar el teléfono sin revelar tu elección.",
    ],
  },
  {
    id: "memoria",
    slug: "memoria",
    title: "Memoria (Parejas)",
    subtitle: "Tablero 4×4 con turno extra",
    description:
      "Voltea dos cartas por turno y recuerda dónde está cada símbolo. Si encuentras una pareja, sumas un punto y vuelves a tirar inmediatamente.",
    players: "1 o 2 jugadores",
    duration: "~2 min",
    accent: "from-amber-500 to-orange-600",
    badge: "Memoria",
    rules: [
      "El tablero contiene 16 cartas boca abajo formadas por 8 parejas de símbolos idénticos.",
      "En tu turno debes voltear 2 cartas una por una para que ambos jugadores vean sus símbolos.",
      "Si las 2 cartas coinciden, quedan descubiertas, sumas 1 punto a tu marcador y conservas el turno para volver a intentar.",
      "Si las 2 cartas son diferentes, se vuelven a ocultar tras un instante y el turno pasa al otro jugador.",
      "Cuando se descubren las 8 parejas, gana quien haya acumulado más pares (o termina en empate 4 a 4).",
    ],
    tips: [
      "Memoriza las jugadas de tu rival: cuando no es tu turno es cuando más información gratis obtienes sobre el tablero.",
      "Al voltear tu primera carta en un turno, intenta elegir primero una casilla que nunca se haya abierto; si coincide con una que ya viste antes, podrás completar el par en tu segunda elección.",
      "Aprovecha las rachas: como cada acierto te da un turno adicional, recordar 2 o 3 pares seguidos puede darte una ventaja decisiva.",
    ],
  },
  {
    id: "puntos-y-cajas",
    slug: "puntos-y-cajas",
    title: "Puntos y Cajas",
    subtitle: "Cierra cuadrados y repite turno",
    description:
      "Une puntos contiguos con líneas horizontales o verticales. Cada vez que cierres el cuarto lado de una caja, la conquistas con tu color y ganas un turno extra.",
    players: "1 o 2 jugadores",
    duration: "~3 min",
    accent: "from-cyan-500 to-blue-600",
    badge: "Táctico",
    rules: [
      "El tablero está formado por una cuadrícula de 4×4 puntos que delimitan 9 cajas (3×3).",
      "En cada turno debes trazar una única línea horizontal o vertical entre dos puntos contiguos que aún no estén unidos.",
      "El jugador que traza el cuarto y último lado de una caja la captura con su inicial, suma 1 punto y está obligado a realizar un movimiento adicional.",
      "Si con una sola línea cierras dos cajas a la vez, sumas ambos puntos y conservas tu turno extra.",
      "La partida concluye cuando se han cerrado las 9 cajas; gana quien tenga más cajas conquistadas.",
    ],
    tips: [
      "Evita colocar el tercer lado de una caja: si dejas una caja con 3 lados dibujados, tu rival la cerrará en su turno y además ganará un turno extra.",
      "Planifica cadenas: en la fase final del juego, casi todas las jugadas regalan cajas. Intenta forzar a tu rival a abrir la cadena más larga primero.",
      "Vigila las líneas compartidas: una línea interior forma parte de dos cajas adyacentes al mismo tiempo.",
    ],
  },
];

export function getGameBySlug(slug: string): GameMeta | undefined {
  return GAMES.find((g) => g.slug === slug);
}
