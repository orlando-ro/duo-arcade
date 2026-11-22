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
  const isDraw = !winner && board[0].every((cell) => cell !== null);
  const gameOver = Boolean(winner || isDraw);

  const myPlayer: Player = isHost ? 1 : 2;

  const applyMove = useCallback((col: number, player: Player) => {
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
  }, []);

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

  const statusText = winner
    ? winner === 1
      ? mode === "1p"
        ? "¡Ganaste!"
        : "¡Ganó Jugador 1!"
      : mode === "1p"
      ? "Ganó la IA"
      : "¡Ganó Jugador 2!"
    : isDraw
    ? "Empate"
    : mode === "remote" && status !== "connected"
    ? "Esperando al rival..."
    : mode === "remote"
    ? turn === myPlayer
      ? "Tu turno — elige una columna"
      : "Turno del rival..."
    : turn === 1
    ? mode === "1p"
      ? "Turno: Tú"
      : "Turno: Jugador 1"
    : mode === "1p"
    ? "Turno: IA"
    : "Turno: Jugador 2";

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
              {scores.p1}
            </span>
          </div>

          <div className="p-3.5 sm:p-4 bg-surface-container-low/60">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-outline block">
              Empates
            </span>
            <span className="mt-1 block text-3xl sm:text-4xl font-mono font-bold tracking-tight text-on-surface">
              {scores.draws}
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
              {scores.p2}
            </span>
          </div>
        </div>

        <div className="px-4 py-2.5 bg-surface-container-low border-t border-on-surface/15 flex items-center gap-2 font-mono text-xs">
          <span
            className={`inline-block w-2 h-2 ${
              winner
                ? "bg-primary"
                : isDraw
                ? "bg-outline"
                : turn === 1
                ? "bg-primary animate-pulse"
                : "bg-on-surface animate-pulse"
            }`}
          />
          <span className="font-semibold text-on-surface">{statusText}</span>
        </div>
      </div>

      {/* 7x6 Board */}
      <div className="border border-on-surface/20 bg-surface-container-lowest p-4 sm:p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-[420px] border-2 border-on-surface bg-surface-container p-2 sm:p-3">
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
                    className={`aspect-square border border-on-surface/35 flex items-center justify-center transition-all cursor-pointer disabled:cursor-default ${
                      isWin
                        ? "bg-primary-fixed ring-2 ring-primary"
                        : "bg-surface-container-lowest hover:bg-surface-container-low"
                    }`}
                  >
                    {cell === 1 && (
                      <span className="w-4/5 h-4/5 bg-primary block" />
                    )}
                    {cell === 2 && (
                      <span className="w-4/5 h-4/5 bg-on-surface block" />
                    )}
                  </button>
                );
              })
            )}
          </div>
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
