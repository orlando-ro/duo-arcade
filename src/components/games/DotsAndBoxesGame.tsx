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

  const statusText = gameOver
    ? `¡Ganó ${
        p1Score > p2Score
          ? mode === "1p"
            ? "Tú"
            : "Jugador 1"
          : mode === "1p"
          ? "la IA"
          : "Jugador 2"
      } (${Math.max(p1Score, p2Score)} a ${Math.min(p1Score, p2Score)})!`
    : mode === "remote" && status !== "connected"
    ? "Esperando al rival..."
    : mode === "remote"
    ? turn === myPlayer
      ? "Tu turno — traza una línea"
      : "Turno del rival..."
    : `Turno: ${
        turn === 1
          ? mode === "1p"
            ? "Tú"
            : "Jugador 1"
          : mode === "1p"
          ? "IA"
          : "Jugador 2"
      }`;

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
      {/* Swiss Tabular Scoreboard */}
      <div className="border border-on-surface/20 bg-surface-container-lowest">
        <div className="grid grid-cols-3 divide-x divide-on-surface/15 text-left">
          <div
            className={`p-3.5 sm:p-4 transition-all border-b-2 ${
              !gameOver && turn === 1
                ? "border-primary opacity-100"
                : "border-transparent opacity-60"
            }`}
          >
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-primary block">
              {mode === "1p" ? "Tú" : "Jugador 1"}
            </span>
            <span className="mt-1 block text-3xl sm:text-4xl font-mono font-bold tracking-tight text-on-surface">
              {p1Score}
            </span>
          </div>

          <div className="p-3.5 sm:p-4 bg-surface-container-low/60">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-outline block">
              Libres
            </span>
            <span className="mt-1 block text-3xl sm:text-4xl font-mono font-bold tracking-tight text-on-surface">
              {totalBoxes - (p1Score + p2Score)}
            </span>
          </div>

          <div
            className={`p-3.5 sm:p-4 transition-all border-b-2 ${
              !gameOver && turn === 2
                ? "border-on-surface opacity-100"
                : "border-transparent opacity-60"
            }`}
          >
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-on-surface block">
              {mode === "1p" ? "IA" : "Jugador 2"}
            </span>
            <span className="mt-1 block text-3xl sm:text-4xl font-mono font-bold tracking-tight text-on-surface">
              {p2Score}
            </span>
          </div>
        </div>

        <div className="px-4 py-2.5 bg-surface-container-low border-t border-on-surface/15 flex items-center gap-2 font-mono text-xs">
          <span
            className={`inline-block w-2 h-2 ${
              gameOver
                ? "bg-primary"
                : turn === 1
                ? "bg-primary animate-pulse"
                : "bg-on-surface animate-pulse"
            }`}
          />
          <span className="font-semibold text-on-surface">{statusText}</span>
        </div>
      </div>

      {/* Dots & Boxes Grid */}
      <div className="border border-on-surface/20 bg-surface-container-lowest p-6 sm:p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-[340px] border-2 border-on-surface bg-surface p-6">
          {Array.from({ length: BOX_SIZE + 1 }, (_, r) => (
            <div key={r} className="w-full">
              <div className="flex items-center justify-between">
                {Array.from({ length: BOX_SIZE + 1 }, (__, c) => (
                  <div
                    key={c}
                    className="flex flex-1 items-center last:flex-none"
                  >
                    <div className="h-3.5 w-3.5 shrink-0 bg-on-surface" />
                    {c < BOX_SIZE && (
                      <button
                        type="button"
                        onClick={() => handleEdgeClick(`h-${r}-${c}`)}
                        disabled={Boolean(edges[`h-${r}-${c}`]) || gameOver}
                        aria-label={`Línea horizontal ${r + 1},${c + 1}`}
                        className={`mx-1 h-2.5 flex-1 transition-all cursor-pointer disabled:cursor-default ${
                          edges[`h-${r}-${c}`] === 1
                            ? "bg-primary"
                            : edges[`h-${r}-${c}`] === 2
                            ? "bg-on-surface"
                            : "bg-surface-container-highest hover:bg-primary/40"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

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
                        className={`mx-0.5 h-full w-2.5 shrink-0 transition-all cursor-pointer disabled:cursor-default ${
                          edges[`v-${r}-${c}`] === 1
                            ? "bg-primary"
                            : edges[`v-${r}-${c}`] === 2
                            ? "bg-on-surface"
                            : "bg-surface-container-highest hover:bg-primary/40"
                        }`}
                      />
                      {c < BOX_SIZE && (
                        <div
                          className={`mx-1 flex h-full flex-1 items-center justify-center font-mono text-xs font-bold transition-colors ${
                            boxes[`${r}-${c}`] === 1
                              ? "bg-primary/15 border border-primary text-primary"
                              : boxes[`${r}-${c}`] === 2
                              ? "bg-on-surface text-surface-container-lowest"
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
          <div className="w-full mt-6 space-y-4 border-t border-on-surface/15 pt-5">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={resetGame}
                className="bg-primary text-white hover:bg-on-surface px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Jugar revancha
              </button>
            </div>
            <AdSlot format="interstitial" label="Anuncio Post-Partida" />
          </div>
        )}
      </div>
    </GameShell>
  );
}
