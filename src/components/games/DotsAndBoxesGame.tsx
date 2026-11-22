"use client";

import { useCallback, useEffect, useState } from "react";
import { getGameBySlug } from "@/lib/games";
import { useRealtimeRoom, type RoomMessage } from "@/lib/useRealtimeRoom";
import { useRoomState } from "@/lib/useRoomState";
import { GameShell } from "@/components/GameShell";
import { AdSlot } from "@/components/AdSlot";

const BOX_SIZE = 3; // 3x3 boxes (4x4 dots)
type Player = 1 | 2;

function getBoxEdges(r: number, c: number): string[] {
  return [`h-${r}-${c}`, `h-${r + 1}-${c}`, `v-${r}-${c}`, `v-${r}-${c + 1}`];
}

function getAllEdges(): string[] {
  const edges: string[] = [];
  for (let r = 0; r <= BOX_SIZE; r++) {
    for (let c = 0; c < BOX_SIZE; c++) {
      edges.push(`h-${r}-${c}`);
    }
  }
  for (let r = 0; r < BOX_SIZE; r++) {
    for (let c = 0; c <= BOX_SIZE; c++) {
      edges.push(`v-${r}-${c}`);
    }
  }
  return edges;
}

const ALL_EDGES = getAllEdges();

function chooseAiEdge(
  edges: Record<string, Player>,
  boxes: Record<string, Player>
): string | null {
  const available = ALL_EDGES.filter((e) => !edges[e]);
  if (available.length === 0) return null;

  // 1. Complete any box that already has 3 edges
  for (let r = 0; r < BOX_SIZE; r++) {
    for (let c = 0; c < BOX_SIZE; c++) {
      const boxKey = `${r}-${c}`;
      if (boxes[boxKey]) continue;
      const bEdges = getBoxEdges(r, c);
      const missing = bEdges.filter((e) => !edges[e]);
      if (missing.length === 1) {
        return missing[0];
      }
    }
  }

  // 2. Pick a safe edge that doesn't create a 3-edged box for the opponent
  const safeEdges = available.filter((candidate) => {
    for (let r = 0; r < BOX_SIZE; r++) {
      for (let c = 0; c < BOX_SIZE; c++) {
        const bEdges = getBoxEdges(r, c);
        if (!bEdges.includes(candidate)) continue;
        const claimedCount = bEdges.filter(
          (e) => Boolean(edges[e]) || e === candidate
        ).length;
        if (claimedCount === 3) return false;
      }
    }
    return true;
  });

  if (safeEdges.length > 0) {
    return safeEdges[0];
  }

  return available[0];
}

export function DotsAndBoxesGame() {
  const game = getGameBySlug("puntos-y-cajas")!;
  const {
    mode,
    setMode,
    roomCode,
    isHost,
    createRoom,
    joinRoom,
    leaveRoom,
  } = useRoomState();

  const [edges, setEdges] = useState<Record<string, Player>>({});
  const [boxes, setBoxes] = useState<Record<string, Player>>({});
  const [turn, setTurn] = useState<Player>(1);

  const p1Score = Object.values(boxes).filter((p) => p === 1).length;
  const p2Score = Object.values(boxes).filter((p) => p === 2).length;
  const totalBoxes = BOX_SIZE * BOX_SIZE;
  const gameOver = p1Score + p2Score === totalBoxes;

  const myPlayer: Player = isHost ? 1 : 2;

  const applyEdge = useCallback((edgeId: string, player: Player) => {
    setEdges((prevEdges) => {
      if (prevEdges[edgeId]) return prevEdges;
      const nextEdges = { ...prevEdges, [edgeId]: player };

      setBoxes((prevBoxes) => {
        let captured = 0;
        const nextBoxes = { ...prevBoxes };
        for (let r = 0; r < BOX_SIZE; r++) {
          for (let c = 0; c < BOX_SIZE; c++) {
            const key = `${r}-${c}`;
            if (nextBoxes[key]) continue;
            const bEdges = getBoxEdges(r, c);
            if (bEdges.every((e) => Boolean(nextEdges[e]))) {
              nextBoxes[key] = player;
              captured++;
            }
          }
        }
        if (captured === 0) {
          setTurn(player === 1 ? 2 : 1);
        }
        return nextBoxes;
      });

      return nextEdges;
    });
  }, []);

  const handleRemoteMessage = useCallback(
    (msg: RoomMessage<{ edgeId?: string; player?: Player }>) => {
      if (msg.type === "move" && msg.payload.edgeId && msg.payload.player) {
        applyEdge(msg.payload.edgeId, msg.payload.player);
      } else if (msg.type === "reset") {
        setEdges({});
        setBoxes({});
        setTurn(1);
      }
    },
    [applyEdge]
  );

  const { status, playerRole, usingDemoFallback, sendMessage } =
    useRealtimeRoom<{ edgeId?: string; player?: Player }>({
      gameId: game.id,
      roomCode,
      enabled: mode === "remote" && Boolean(roomCode),
      isHost,
      onMessage: handleRemoteMessage,
    });

  // AI Turn in 1P mode
  useEffect(() => {
    if (mode !== "1p" || turn !== 2 || gameOver) return;
    const timer = setTimeout(() => {
      const edge = chooseAiEdge(edges, boxes);
      if (edge) applyEdge(edge, 2);
    }, 420);
    return () => clearTimeout(timer);
  }, [mode, turn, gameOver, edges, boxes, applyEdge]);

  const handleEdgeClick = (edgeId: string) => {
    if (gameOver || edges[edgeId]) return;
    if (mode === "1p" && turn !== 1) return;
    if (mode === "remote") {
      if (!roomCode || status !== "connected") return;
      if (turn !== myPlayer) return;
    }

    const activePlayer = mode === "remote" ? myPlayer : turn;
    applyEdge(edgeId, activePlayer);

    if (mode === "remote") {
      sendMessage("move", { edgeId, player: activePlayer });
    }
  };

  const resetGame = () => {
    setEdges({});
    setBoxes({});
    setTurn(1);
    if (mode === "remote" && roomCode) {
      sendMessage("reset", {});
    }
  };

  return (
    <GameShell
      game={game}
      mode={mode}
      onModeChange={(nextMode) => {
        setMode(nextMode);
        setEdges({});
        setBoxes({});
        setTurn(1);
      }}
      roomCode={roomCode}
      isHost={isHost}
      roomStatus={status}
      playerRole={playerRole}
      usingDemoFallback={usingDemoFallback}
      onCreateRoom={createRoom}
      onJoinRoom={joinRoom}
      onLeaveRoom={leaveRoom}
      onReset={resetGame}
    >
      {/* Scoreboard */}
      <div className="mb-5 grid grid-cols-3 gap-2 text-center">
        <div
          className={`rounded-xl border p-2.5 ${
            !gameOver && turn === 1
              ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40"
              : "border-slate-200 dark:border-zinc-800"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-zinc-400">
            {mode === "1p" ? "Tú (Azul)" : "Jugador 1 (Azul)"}
          </p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {p1Score} cajas
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 p-2.5">
          <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-zinc-400">
            Libres
          </p>
          <p className="text-xl font-bold text-slate-700 dark:text-zinc-200">
            {totalBoxes - (p1Score + p2Score)}
          </p>
        </div>

        <div
          className={`rounded-xl border p-2.5 ${
            !gameOver && turn === 2
              ? "border-rose-500 bg-rose-50/70 dark:bg-rose-950/40"
              : "border-slate-200 dark:border-zinc-800"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-zinc-400">
            {mode === "1p" ? "IA (Rojo)" : "Jugador 2 (Rojo)"}
          </p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
            {p2Score} cajas
          </p>
        </div>
      </div>

      {/* Turn indicator */}
      <div className="mb-5 text-center text-sm font-semibold">
        {gameOver ? (
          <span className="text-emerald-600 dark:text-emerald-400">
            ¡Ganó{" "}
            {p1Score > p2Score
              ? mode === "1p"
                ? "Tú"
                : "Jugador 1"
              : mode === "1p"
              ? "la IA"
              : "Jugador 2"}{" "}
            ({Math.max(p1Score, p2Score)} a {Math.min(p1Score, p2Score)})!
          </span>
        ) : mode === "remote" && status !== "connected" ? (
          <span className="text-slate-500 dark:text-zinc-400">
            Conecta con tu rival en una sala para empezar
          </span>
        ) : mode === "remote" ? (
          <span>
            {turn === myPlayer
              ? "Tu turno — traza una línea entre dos puntos"
              : "Turno del rival..."}
          </span>
        ) : (
          <span>
            Turno de:{" "}
            <strong>
              {turn === 1
                ? mode === "1p"
                  ? "Tú (Azul)"
                  : "Jugador 1 (Azul)"
                : mode === "1p"
                ? "IA (Rojo)"
                : "Jugador 2 (Rojo)"}
            </strong>
          </span>
        )}
      </div>

      {/* Dots & Boxes Grid */}
      <div className="mx-auto flex max-w-[320px] flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 p-6">
        {Array.from({ length: BOX_SIZE + 1 }, (_, r) => (
          <div key={r} className="w-full">
            {/* Horizontal row of dots and horizontal edges */}
            <div className="flex items-center justify-between">
              {Array.from({ length: BOX_SIZE + 1 }, (__, c) => (
                <div key={c} className="flex flex-1 items-center last:flex-none">
                  <div className="h-4 w-4 shrink-0 rounded-full bg-slate-800 dark:bg-zinc-200" />
                  {c < BOX_SIZE && (
                    <button
                      type="button"
                      onClick={() => handleEdgeClick(`h-${r}-${c}`)}
                      disabled={Boolean(edges[`h-${r}-${c}`]) || gameOver}
                      aria-label={`Línea horizontal ${r + 1},${c + 1}`}
                      className={`mx-1 h-3 flex-1 rounded-full transition-all cursor-pointer disabled:cursor-default ${
                        edges[`h-${r}-${c}`] === 1
                          ? "bg-indigo-600"
                          : edges[`h-${r}-${c}`] === 2
                          ? "bg-rose-500"
                          : "bg-slate-200 dark:bg-zinc-800 hover:bg-indigo-300 dark:hover:bg-indigo-800"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Vertical edges and boxes row */}
            {r < BOX_SIZE && (
              <div className="my-1 flex h-16 items-stretch justify-between">
                {Array.from({ length: BOX_SIZE + 1 }, (__, c) => (
                  <div
                    key={c}
                    className="flex flex-1 items-center last:flex-none"
                  >
                    <button
                      type="button"
                      onClick={() => handleEdgeClick(`v-${r}-${c}`)}
                      disabled={Boolean(edges[`v-${r}-${c}`]) || gameOver}
                      aria-label={`Línea vertical ${r + 1},${c + 1}`}
                      className={`mx-0.5 h-full w-3 shrink-0 rounded-full transition-all cursor-pointer disabled:cursor-default ${
                        edges[`v-${r}-${c}`] === 1
                          ? "bg-indigo-600"
                          : edges[`v-${r}-${c}`] === 2
                          ? "bg-rose-500"
                          : "bg-slate-200 dark:bg-zinc-800 hover:bg-indigo-300 dark:hover:bg-indigo-800"
                      }`}
                    />
                    {c < BOX_SIZE && (
                      <div
                        className={`mx-1 flex h-full flex-1 items-center justify-center rounded-xl text-sm font-black transition-colors ${
                          boxes[`${r}-${c}`] === 1
                            ? "bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300"
                            : boxes[`${r}-${c}`] === 2
                            ? "bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300"
                            : "bg-transparent"
                        }`}
                      >
                        {boxes[`${r}-${c}`] === 1
                          ? "J1"
                          : boxes[`${r}-${c}`] === 2
                          ? mode === "1p"
                            ? "IA"
                            : "J2"
                          : ""}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="mt-6 space-y-4 border-t border-slate-200 dark:border-zinc-800 pt-5">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={resetGame}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              Jugar Revancha
            </button>
          </div>
          <AdSlot format="interstitial" label="Anuncio Post-Partida" />
        </div>
      )}
    </GameShell>
  );
}
