"use client";

import { useCallback, useEffect, useState } from "react";
import { getGameBySlug } from "@/lib/games";
import { useRealtimeRoom, type RoomMessage } from "@/lib/useRealtimeRoom";
import { useRoomState } from "@/lib/useRoomState";
import { GameShell } from "@/components/GameShell";
import { AdSlot } from "@/components/AdSlot";

type Cell = "X" | "O" | null;

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board: Cell[]): { winner: Cell; line: number[] | null } {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

function getBestAiMove(board: Cell[]): number {
  const empty = board
    .map((v, i) => (v === null ? i : -1))
    .filter((i) => i !== -1);
  if (empty.length === 0) return -1;

  // Win if possible
  for (const idx of empty) {
    const copy = [...board];
    copy[idx] = "O";
    if (checkWinner(copy).winner === "O") return idx;
  }
  // Block X
  for (const idx of empty) {
    const copy = [...board];
    copy[idx] = "X";
    if (checkWinner(copy).winner === "X") return idx;
  }
  // Center
  if (board[4] === null) return 4;
  // Corners
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }
  return empty[Math.floor(Math.random() * empty.length)];
}

export function TicTacToeGame() {
  const game = getGameBySlug("gato")!;
  const {
    mode,
    setMode,
    roomCode,
    isHost,
    createRoom,
    joinRoom,
    leaveRoom,
  } = useRoomState();

  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

  const { winner, line } = checkWinner(board);
  const isDraw = !winner && board.every((c) => c !== null);
  const gameOver = Boolean(winner || isDraw);

  const mySymbol: "X" | "O" = isHost ? "X" : "O";

  const handleRemoteMessage = useCallback(
    (msg: RoomMessage<{ index?: number; symbol?: "X" | "O" }>) => {
      if (msg.type === "move" && typeof msg.payload.index === "number") {
        const idx = msg.payload.index;
        const sym = msg.payload.symbol ?? "O";
        setBoard((prev) => {
          if (prev[idx] !== null) return prev;
          const next = [...prev];
          next[idx] = sym;
          const res = checkWinner(next);
          if (res.winner) {
            setScores((s) => ({
              ...s,
              [res.winner!]: s[res.winner!] + 1,
            }));
          } else if (next.every((c) => c !== null)) {
            setScores((s) => ({ ...s, draws: s.draws + 1 }));
          }
          return next;
        });
        setTurn(sym === "X" ? "O" : "X");
      } else if (msg.type === "reset") {
        setBoard(Array(9).fill(null));
        setTurn("X");
      }
    },
    []
  );

  const { status, playerRole, usingDemoFallback, sendMessage } =
    useRealtimeRoom<{ index?: number; symbol?: "X" | "O" }>({
      gameId: game.id,
      roomCode,
      enabled: mode === "remote" && Boolean(roomCode),
      isHost,
      onMessage: handleRemoteMessage,
    });

  // AI Turn in 1P mode
  useEffect(() => {
    if (mode !== "1p" || turn !== "O" || gameOver) return;
    const timer = setTimeout(() => {
      const idx = getBestAiMove(board);
      if (idx === -1) return;
      const next = [...board];
      next[idx] = "O";
      setBoard(next);
      setTurn("X");
      const res = checkWinner(next);
      if (res.winner === "O") {
        setScores((s) => ({ ...s, O: s.O + 1 }));
      } else if (next.every((c) => c !== null)) {
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
      }
    }, 380);
    return () => clearTimeout(timer);
  }, [mode, turn, board, gameOver]);

  const handleCellClick = (idx: number) => {
    if (board[idx] !== null || gameOver) return;
    if (mode === "1p" && turn !== "X") return;
    if (mode === "remote") {
      if (!roomCode || status !== "connected") return;
      if (turn !== mySymbol) return;
    }

    const activeSymbol = mode === "remote" ? mySymbol : turn;
    const next = [...board];
    next[idx] = activeSymbol;
    setBoard(next);
    setTurn(activeSymbol === "X" ? "O" : "X");

    const res = checkWinner(next);
    if (res.winner) {
      setScores((s) => ({ ...s, [res.winner!]: s[res.winner!] + 1 }));
    } else if (next.every((c) => c !== null)) {
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
    }

    if (mode === "remote") {
      sendMessage("move", { index: idx, symbol: activeSymbol });
    }
  };

  return (
    <GameShell
      game={game}
      mode={mode}
      onModeChange={(nextMode) => {
        setMode(nextMode);
        setBoard(Array(9).fill(null));
        setTurn("X");
        setScores({ X: 0, O: 0, draws: 0 });
      }}
      roomCode={roomCode}
      isHost={isHost}
      roomStatus={status}
      playerRole={playerRole}
      usingDemoFallback={usingDemoFallback}
      onCreateRoom={createRoom}
      onJoinRoom={joinRoom}
      onLeaveRoom={leaveRoom}
      onReset={() => {
        setBoard(Array(9).fill(null));
        setTurn("X");
        if (mode === "remote" && roomCode) sendMessage("reset", {});
      }}
    >
      {/* Scoreboard */}
      <div className="mb-6 grid grid-cols-3 gap-2 text-center">
        <div
          className={`rounded-xl border p-2.5 transition-colors ${
            !gameOver && turn === "X"
              ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40"
              : "border-slate-200 dark:border-zinc-800"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-zinc-400">
            {mode === "1p" ? "Tú (X)" : "Jugador 1 (X)"}
          </p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {scores.X}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 p-2.5">
          <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-zinc-400">
            Empates
          </p>
          <p className="text-xl font-bold text-slate-700 dark:text-zinc-200">
            {scores.draws}
          </p>
        </div>

        <div
          className={`rounded-xl border p-2.5 transition-colors ${
            !gameOver && turn === "O"
              ? "border-rose-500 bg-rose-50/70 dark:bg-rose-950/40"
              : "border-slate-200 dark:border-zinc-800"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-zinc-400">
            {mode === "1p" ? "IA (O)" : "Jugador 2 (O)"}
          </p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
            {scores.O}
          </p>
        </div>
      </div>

      {/* Turn / Status */}
      <div className="mb-4 text-center text-sm font-semibold">
        {winner ? (
          <span className="text-emerald-600 dark:text-emerald-400">
            ¡Ganó {winner === "X" ? (mode === "1p" ? "Tú (X)" : "Jugador 1 (X)") : mode === "1p" ? "la IA (O)" : "Jugador 2 (O)"}!
          </span>
        ) : isDraw ? (
          <span className="text-amber-600 dark:text-amber-400">
            ¡Empate!
          </span>
        ) : mode === "remote" && status !== "connected" ? (
          <span className="text-slate-500 dark:text-zinc-400">
            Conecta con un amigo en una sala para empezar
          </span>
        ) : mode === "remote" ? (
          <span>
            {turn === mySymbol ? (
              <span className="text-indigo-600 dark:text-indigo-400">
                Tu turno ({mySymbol})
              </span>
            ) : (
              <span className="text-slate-500 dark:text-zinc-400">
                Turno del rival ({turn})...
              </span>
            )}
          </span>
        ) : (
          <span>
            Turno de:{" "}
            <strong
              className={
                turn === "X"
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-rose-600 dark:text-rose-400"
              }
            >
              {turn === "X"
                ? mode === "1p"
                  ? "Tú (X)"
                  : "Jugador 1 (X)"
                : mode === "1p"
                ? "IA (O)"
                : "Jugador 2 (O)"}
            </strong>
          </span>
        )}
      </div>

      {/* 3x3 Board */}
      <div className="mx-auto grid max-w-[320px] grid-cols-3 gap-2.5">
        {board.map((cell, idx) => {
          const isWinCell = line?.includes(idx) ?? false;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleCellClick(idx)}
              disabled={Boolean(cell) || gameOver}
              aria-label={`Casilla ${idx + 1}${cell ? `: ${cell}` : ""}`}
              className={`flex aspect-square items-center justify-center rounded-2xl border-2 text-4xl font-black transition-all cursor-pointer disabled:cursor-default ${
                isWinCell
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 scale-[1.02]"
                  : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 hover:border-indigo-400 dark:hover:border-indigo-500"
              }`}
            >
              {cell === "X" && (
                <span className="text-indigo-600 dark:text-indigo-400">X</span>
              )}
              {cell === "O" && (
                <span className="text-rose-600 dark:text-rose-400">O</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Post-game Rematch + Interstitial Ad */}
      {gameOver && (
        <div className="mt-6 space-y-4 border-t border-slate-200 dark:border-zinc-800 pt-5">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                setBoard(Array(9).fill(null));
                setTurn("X");
                if (mode === "remote" && roomCode) sendMessage("reset", {});
              }}
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
