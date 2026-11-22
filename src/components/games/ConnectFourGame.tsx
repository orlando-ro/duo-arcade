"use client";

import { useCallback, useEffect, useState } from "react";
import { getGameBySlug } from "@/lib/games";
import { useRealtimeRoom, type RoomMessage } from "@/lib/useRealtimeRoom";
import { useRoomState } from "@/lib/useRoomState";
import { GameShell } from "@/components/GameShell";
import { AdSlot } from "@/components/AdSlot";

const ROWS = 6;
const COLS = 7;
type Player = 1 | 2;
type Cell = Player | null;

function createEmptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));
}

function getDropRow(board: Cell[][], col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === null) return r;
  }
  return -1;
}

function checkConnect4Winner(
  board: Cell[][]
): { winner: Player | null; cells: [number, number][] } {
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c];
      if (!p) continue;
      for (const [dr, dc] of dirs) {
        const line: [number, number][] = [[r, c]];
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (
            nr >= 0 &&
            nr < ROWS &&
            nc >= 0 &&
            nc < COLS &&
            board[nr][nc] === p
          ) {
            line.push([nr, nc]);
          } else {
            break;
          }
        }
        if (line.length === 4) {
          return { winner: p, cells: line };
        }
      }
    }
  }
  return { winner: null, cells: [] };
}

function getAiColumn(board: Cell[][]): number {
  const validCols = Array.from({ length: COLS }, (_, c) => c).filter(
    (c) => getDropRow(board, c) !== -1
  );
  if (validCols.length === 0) return -1;

  // 1. Win if possible
  for (const col of validCols) {
    const r = getDropRow(board, col);
    const copy = board.map((row) => [...row]);
    copy[r][col] = 2;
    if (checkConnect4Winner(copy).winner === 2) return col;
  }
  // 2. Block player 1
  for (const col of validCols) {
    const r = getDropRow(board, col);
    const copy = board.map((row) => [...row]);
    copy[r][col] = 1;
    if (checkConnect4Winner(copy).winner === 1) return col;
  }
  // 3. Prefer center columns
  const preferred = [3, 2, 4, 1, 5, 0, 6].filter((c) => validCols.includes(c));
  return preferred[0];
}

export function ConnectFourGame() {
  const game = getGameBySlug("conecta-4")!;
  const {
    mode,
    setMode,
    roomCode,
    isHost,
    createRoom,
    joinRoom,
    leaveRoom,
  } = useRoomState();

  const [board, setBoard] = useState<Cell[][]>(createEmptyBoard);
  const [turn, setTurn] = useState<Player>(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0, draws: 0 });

  const { winner, cells: winCells } = checkConnect4Winner(board);
  const isDraw =
    !winner && board[0].every((cell) => cell !== null);
  const gameOver = Boolean(winner || isDraw);

  const myPlayer: Player = isHost ? 1 : 2;

  const applyMove = useCallback(
    (col: number, player: Player) => {
      setBoard((prev) => {
        const r = getDropRow(prev, col);
        if (r === -1) return prev;
        const next = prev.map((row) => [...row]);
        next[r][col] = player;
        const res = checkConnect4Winner(next);
        if (res.winner === 1) {
          setScores((s) => ({ ...s, p1: s.p1 + 1 }));
        } else if (res.winner === 2) {
          setScores((s) => ({ ...s, p2: s.p2 + 1 }));
        } else if (next[0].every((c) => c !== null)) {
          setScores((s) => ({ ...s, draws: s.draws + 1 }));
        }
        return next;
      });
      setTurn(player === 1 ? 2 : 1);
    },
    []
  );

  const handleRemoteMessage = useCallback(
    (msg: RoomMessage<{ col?: number; player?: Player }>) => {
      if (msg.type === "move" && typeof msg.payload.col === "number") {
        applyMove(msg.payload.col, msg.payload.player ?? 2);
      } else if (msg.type === "reset") {
        setBoard(createEmptyBoard());
        setTurn(1);
      }
    },
    [applyMove]
  );

  const { status, playerRole, usingDemoFallback, sendMessage } =
    useRealtimeRoom<{ col?: number; player?: Player }>({
      gameId: game.id,
      roomCode,
      enabled: mode === "remote" && Boolean(roomCode),
      isHost,
      onMessage: handleRemoteMessage,
    });

  useEffect(() => {
    if (mode !== "1p" || turn !== 2 || gameOver) return;
    const timer = setTimeout(() => {
      const col = getAiColumn(board);
      if (col !== -1) applyMove(col, 2);
    }, 420);
    return () => clearTimeout(timer);
  }, [mode, turn, board, gameOver, applyMove]);

  const handleColumnClick = (col: number) => {
    if (gameOver || getDropRow(board, col) === -1) return;
    if (mode === "1p" && turn !== 1) return;
    if (mode === "remote") {
      if (!roomCode || status !== "connected") return;
      if (turn !== myPlayer) return;
    }

    const activePlayer = mode === "remote" ? myPlayer : turn;
    applyMove(col, activePlayer);

    if (mode === "remote") {
      sendMessage("move", { col, player: activePlayer });
    }
  };

  const resetGame = () => {
    setBoard(createEmptyBoard());
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
        setBoard(createEmptyBoard());
        setTurn(1);
        setScores({ p1: 0, p2: 0, draws: 0 });
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
              ? "border-rose-500 bg-rose-50/70 dark:bg-rose-950/40"
              : "border-slate-200 dark:border-zinc-800"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-zinc-400">
            {mode === "1p" ? "Tú (Rojo)" : "Jugador 1 (Rojo)"}
          </p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
            {scores.p1}
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
          className={`rounded-xl border p-2.5 ${
            !gameOver && turn === 2
              ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40"
              : "border-slate-200 dark:border-zinc-800"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-zinc-400">
            {mode === "1p" ? "IA (Amarillo)" : "Jugador 2 (Amarillo)"}
          </p>
          <p className="text-xl font-bold text-amber-500">{scores.p2}</p>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4 text-center text-sm font-semibold">
        {winner ? (
          <span className="text-emerald-600 dark:text-emerald-400">
            ¡Ganó{" "}
            {winner === 1
              ? mode === "1p"
                ? "Tú (Rojo)"
                : "Jugador 1 (Rojo)"
              : mode === "1p"
              ? "la IA (Amarillo)"
              : "Jugador 2 (Amarillo)"}
            !
          </span>
        ) : isDraw ? (
          <span className="text-amber-600 dark:text-amber-400">¡Empate!</span>
        ) : mode === "remote" && status !== "connected" ? (
          <span className="text-slate-500 dark:text-zinc-400">
            Conecta con tu rival para empezar
          </span>
        ) : mode === "remote" ? (
          <span>
            {turn === myPlayer
              ? "Tu turno — elige una columna"
              : "Turno del rival..."}
          </span>
        ) : (
          <span>
            Turno de:{" "}
            <strong>
              {turn === 1
                ? mode === "1p"
                  ? "Tú (Rojo)"
                  : "Jugador 1 (Rojo)"
                : mode === "1p"
                ? "IA (Amarillo)"
                : "Jugador 2 (Amarillo)"}
            </strong>
          </span>
        )}
      </div>

      {/* 7x6 Board */}
      <div className="mx-auto max-w-[420px] rounded-2xl bg-indigo-600 dark:bg-indigo-900 p-2.5 sm:p-3 shadow-inner">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {board.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              const isWin = winCells.some(
                ([wr, wc]) => wr === rIdx && wc === cIdx
              );
              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  type="button"
                  onClick={() => handleColumnClick(cIdx)}
                  disabled={gameOver || getDropRow(board, cIdx) === -1}
                  aria-label={`Columna ${cIdx + 1}, fila ${rIdx + 1}`}
                  className={`aspect-square rounded-full transition-all cursor-pointer disabled:cursor-default ${
                    cell === 1
                      ? "bg-rose-500 shadow-inner"
                      : cell === 2
                      ? "bg-amber-400 shadow-inner"
                      : "bg-slate-100 dark:bg-zinc-950 hover:bg-slate-200 dark:hover:bg-zinc-800"
                  } ${isWin ? "ring-4 ring-emerald-400 scale-105" : ""}`}
                />
              );
            })
          )}
        </div>
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
