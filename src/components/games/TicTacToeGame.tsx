"use client";

import { useCallback, useEffect, useState } from "react";
import { Lightbulb, Undo2 } from "lucide-react";
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

function getBestMoveForSymbol(board: Cell[], symbol: "X" | "O"): number {
  const opp: "X" | "O" = symbol === "X" ? "O" : "X";
  const empty = board
    .map((v, i) => (v === null ? i : -1))
    .filter((i) => i !== -1);
  if (empty.length === 0) return -1;

  // 1. Win if possible
  for (const idx of empty) {
    const copy = [...board];
    copy[idx] = symbol;
    if (checkWinner(copy).winner === symbol) return idx;
  }
  // 2. Block opponent
  for (const idx of empty) {
    const copy = [...board];
    copy[idx] = opp;
    if (checkWinner(copy).winner === opp) return idx;
  }
  // 3. Center
  if (board[4] === null) return 4;
  // 4. Corners
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
  const [history, setHistory] = useState<number[]>([]);
  const [hintCell, setHintCell] = useState<number | null>(null);

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
        setHistory((h) => [...h, idx]);
        setTurn(sym === "X" ? "O" : "X");
      } else if (msg.type === "reset") {
        setBoard(Array(9).fill(null));
        setHistory([]);
        setHintCell(null);
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
      const idx = getBestMoveForSymbol(board, "O");
      if (idx === -1) return;
      const next = [...board];
      next[idx] = "O";
      setBoard(next);
      setHistory((h) => [...h, idx]);
      setTurn("X");
      const res = checkWinner(next);
      if (res.winner === "O") {
        setScores((s) => ({ ...s, O: s.O + 1 }));
      } else if (next.every((c) => c !== null)) {
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
      }
    }, 350);
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
    setHistory((h) => [...h, idx]);
    setHintCell(null);
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

  const handleUndo = () => {
    if (mode === "remote" || gameOver || history.length === 0) return;
    const steps = mode === "1p" && history.length >= 2 ? 2 : 1;
    const nextHistory = history.slice(0, history.length - steps);
    const nextBoard: Cell[] = Array(9).fill(null);
    nextHistory.forEach((cellIdx, moveIdx) => {
      nextBoard[cellIdx] = moveIdx % 2 === 0 ? "X" : "O";
    });
    setBoard(nextBoard);
    setHistory(nextHistory);
    setTurn(nextHistory.length % 2 === 0 ? "X" : "O");
  };

  const handleHint = () => {
    if (gameOver) return;
    const activeSym = mode === "remote" ? mySymbol : turn;
    const best = getBestMoveForSymbol(board, activeSym);
    if (best !== -1) {
      setHintCell(best);
      setTimeout(() => setHintCell(null), 1300);
    }
  };

  const resetRound = () => {
    setBoard(Array(9).fill(null));
    setHistory([]);
    setHintCell(null);
    setTurn("X");
    if (mode === "remote" && roomCode) sendMessage("reset", {});
  };

  return (
    <GameShell
      game={game}
      mode={mode}
      onModeChange={(nextMode) => {
        setMode(nextMode);
        setBoard(Array(9).fill(null));
        setHistory([]);
        setHintCell(null);
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
      onReset={resetRound}
    >
      {/* Swiss Tabular Scoreboard */}
      <div className="border border-on-surface bg-surface-container-lowest">
        <div className="grid grid-cols-3 divide-x divide-on-surface text-left">
          {/* Player 1 */}
          <div
            className={`p-4 bg-surface transition-all border-b-2 ${
              !gameOver && turn === "X"
                ? "border-primary opacity-100"
                : "border-transparent opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-primary">
                {mode === "1p" ? "Player 01 [X]" : "Jugador 1 [X]"}
              </span>
              <span className="w-2 h-2 bg-primary" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-on-surface">
                {scores.X}
              </span>
              <span className="text-[11px] font-mono uppercase text-outline hidden sm:inline">
                Victorias
              </span>
            </div>
          </div>

          {/* Ties */}
          <div className="p-4 bg-surface-container-low transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-outline">
                Tablas
              </span>
              <span className="text-xs font-mono text-outline">=</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-on-surface">
                {scores.draws}
              </span>
              <span className="text-[11px] font-mono uppercase text-outline hidden sm:inline">
                Empates
              </span>
            </div>
          </div>

          {/* Player 2 / AI */}
          <div
            className={`p-4 bg-surface transition-all border-b-2 ${
              !gameOver && turn === "O"
                ? "border-on-surface opacity-100"
                : "border-transparent opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-on-surface">
                {mode === "1p" ? "AI Táctica [O]" : "Jugador 2 [O]"}
              </span>
              <span className="w-2 h-2 bg-on-surface" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-on-surface">
                {scores.O}
              </span>
              <span className="text-[11px] font-mono uppercase text-outline hidden sm:inline">
                Victorias
              </span>
            </div>
          </div>
        </div>

        {/* Turn Status Bar (Crisp Monospaced Telemetry) */}
        <div className="p-3 bg-surface-container border-t border-on-surface flex items-center justify-between font-mono text-xs uppercase">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2.5 h-2.5 ${
                winner
                  ? "bg-primary"
                  : isDraw
                  ? "bg-outline"
                  : turn === "X"
                  ? "bg-primary animate-pulse"
                  : "bg-on-surface animate-pulse"
              }`}
            />
            <span className="font-bold tracking-wide">
              {winner
                ? `STATUS: VICTORIA ${
                    winner === "X"
                      ? mode === "1p"
                        ? "JUGADOR 1 [X]"
                        : "JUGADOR 1 [X]"
                      : mode === "1p"
                      ? "IA TÁCTICA [O]"
                      : "JUGADOR 2 [O]"
                  }`
                : isDraw
                ? "STATUS: EMPATE TÁCTICO REGISTRADO"
                : mode === "remote" && status !== "connected"
                ? "STATUS: ESPERANDO CONEXIÓN EN SALA REMOTA"
                : mode === "remote"
                ? turn === mySymbol
                  ? `TURNO: TU MOVIMIENTO [${mySymbol}]`
                  : `TURNO: ESPERANDO RIVAL [${turn}]...`
                : `TURNO: ${
                    turn === "X"
                      ? "JUGADOR 1 [X]"
                      : mode === "1p"
                      ? "IA TÁCTICA [O]"
                      : "JUGADOR 2 [O]"
                  }`}
            </span>
          </div>
          <span className="text-[10px] tracking-widest text-outline hidden sm:inline">
            MOVE TIME: LIVE
          </span>
        </div>
      </div>

      {/* 3x3 Pure International Style Board */}
      <div className="border border-on-surface bg-surface-container-lowest p-6 sm:p-10 flex flex-col items-center justify-center relative">
        <div className="relative w-full max-w-[380px] aspect-square bg-surface border-2 border-on-surface grid grid-cols-3 grid-rows-3 select-none">
          {board.map((cell, idx) => {
            const isWinCell = line?.includes(idx) ?? false;
            const isHintCell = hintCell === idx;
            const borderRight = idx % 3 !== 2 ? "border-r-2 border-on-surface" : "";
            const borderBottom = idx < 6 ? "border-b-2 border-on-surface" : "";

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleCellClick(idx)}
                disabled={Boolean(cell) || gameOver}
                aria-label={`Casilla ${idx + 1}${cell ? `: ${cell}` : ""}`}
                className={`${borderRight} ${borderBottom} flex items-center justify-center transition-colors cursor-pointer disabled:cursor-default focus:outline-none ${
                  isWinCell || isHintCell
                    ? "bg-primary-fixed"
                    : "hover:bg-surface-container"
                }`}
              >
                {cell === "X" && (
                  <svg
                    className="w-14 h-14 sm:w-20 sm:h-20"
                    viewBox="0 0 100 100"
                  >
                    <line
                      x1="22"
                      y1="22"
                      x2="78"
                      y2="78"
                      stroke="var(--primary)"
                      strokeWidth="14"
                      strokeLinecap="square"
                    />
                    <line
                      x1="78"
                      y1="22"
                      x2="22"
                      y2="78"
                      stroke="var(--primary)"
                      strokeWidth="14"
                      strokeLinecap="square"
                    />
                  </svg>
                )}
                {cell === "O" && (
                  <svg
                    className="w-14 h-14 sm:w-20 sm:h-20"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="28"
                      stroke="var(--foreground)"
                      strokeWidth="14"
                      fill="none"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Action Buttons: Pure Swiss Typography */}
        <div className="w-full max-w-[380px] mt-6 pt-4 border-t border-surface-container-highest flex items-center justify-between">
          <button
            type="button"
            onClick={handleUndo}
            disabled={mode === "remote" || gameOver || history.length === 0}
            className="h-8 px-3 border border-on-surface text-xs font-mono uppercase font-semibold hover:bg-surface-container flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Undo2 className="h-3.5 w-3.5" />
            <span>Deshacer</span>
          </button>

          <span
            className={`text-[11px] font-mono uppercase font-bold text-primary transition-opacity ${
              hintCell !== null ? "opacity-100" : "opacity-0"
            }`}
          >
            [Sugerencia Calculada]
          </span>

          <button
            type="button"
            onClick={handleHint}
            disabled={gameOver}
            className="h-8 px-3 bg-on-surface text-surface-container-lowest hover:bg-primary hover:text-white text-xs font-mono uppercase font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Pista Táctica</span>
          </button>
        </div>

        {/* Post-game Rematch + Interstitial Ad */}
        {gameOver && (
          <div className="w-full mt-6 space-y-4 border-t border-on-surface/20 pt-5">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={resetRound}
                className="bg-primary text-white hover:bg-on-surface px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-on-surface"
              >
                + JUGAR REVANCHA
              </button>
            </div>
            <AdSlot format="interstitial" label="Anuncio Post-Partida" />
          </div>
        )}
      </div>
    </GameShell>
  );
}
