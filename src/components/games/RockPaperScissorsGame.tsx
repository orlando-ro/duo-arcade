"use client";

import { useCallback, useRef, useState } from "react";
import { getGameBySlug } from "@/lib/games";
import { useRealtimeRoom, type RoomMessage } from "@/lib/useRealtimeRoom";
import { useRoomState } from "@/lib/useRoomState";
import { GameShell } from "@/components/GameShell";
import { AdSlot } from "@/components/AdSlot";

type Choice = "rock" | "paper" | "scissors";

const CHOICES: { id: Choice; label: string; emoji: string }[] = [
  { id: "rock", label: "Piedra", emoji: "🪨" },
  { id: "paper", label: "Papel", emoji: "📄" },
  { id: "scissors", label: "Tijera", emoji: "✂️" },
];

function pickRandomChoice(): Choice {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)].id;
}

function getRoundWinner(p1: Choice, p2: Choice): 0 | 1 | 2 {
  if (p1 === p2) return 0;
  if (
    (p1 === "rock" && p2 === "scissors") ||
    (p1 === "paper" && p2 === "rock") ||
    (p1 === "scissors" && p2 === "paper")
  ) {
    return 1;
  }
  return 2;
}

const TARGET_WINS = 3;

export function RockPaperScissorsGame() {
  const game = getGameBySlug("piedra-papel-tijera")!;
  const {
    mode,
    setMode,
    roomCode,
    isHost,
    createRoom,
    joinRoom,
    leaveRoom,
  } = useRoomState();

  const [p1Choice, setP1Choice] = useState<Choice | null>(null);
  const [p2Choice, setP2Choice] = useState<Choice | null>(null);
  const [localPhase, setLocalPhase] = useState<"p1" | "handoff" | "p2" | "reveal">("p1");
  const [scores, setScores] = useState({ p1: 0, p2: 0, draws: 0 });
  const [roundResult, setRoundResult] = useState<0 | 1 | 2 | null>(null);

  const remoteChoicesRef = useRef<{ p1: Choice | null; p2: Choice | null }>({
    p1: null,
    p2: null,
  });

  const matchWinner =
    scores.p1 >= TARGET_WINS ? 1 : scores.p2 >= TARGET_WINS ? 2 : null;

  const myRole = isHost ? 1 : 2;

  const resolveRound = useCallback((c1: Choice, c2: Choice) => {
    const res = getRoundWinner(c1, c2);
    setRoundResult(res);
    setScores((s) => ({
      p1: res === 1 ? s.p1 + 1 : s.p1,
      p2: res === 2 ? s.p2 + 1 : s.p2,
      draws: res === 0 ? s.draws + 1 : s.draws,
    }));
  }, []);

  const handleRemoteMessage = useCallback(
    (msg: RoomMessage<{ choice?: Choice; role?: 1 | 2 }>) => {
      if (msg.type === "move" && msg.payload.choice && msg.payload.role) {
        if (msg.payload.role === 1) {
          remoteChoicesRef.current.p1 = msg.payload.choice;
          setP1Choice(msg.payload.choice);
        } else {
          remoteChoicesRef.current.p2 = msg.payload.choice;
          setP2Choice(msg.payload.choice);
        }
        const { p1, p2 } = remoteChoicesRef.current;
        if (p1 && p2) {
          resolveRound(p1, p2);
        }
      } else if (msg.type === "reset") {
        remoteChoicesRef.current = { p1: null, p2: null };
        setP1Choice(null);
        setP2Choice(null);
        setRoundResult(null);
        setScores({ p1: 0, p2: 0, draws: 0 });
      } else if (msg.type === "sync_request") {
        remoteChoicesRef.current = { p1: null, p2: null };
        setP1Choice(null);
        setP2Choice(null);
        setRoundResult(null);
      }
    },
    [resolveRound]
  );

  const { status, playerRole, usingDemoFallback, sendMessage } =
    useRealtimeRoom<{ choice?: Choice; role?: 1 | 2 }>({
      gameId: game.id,
      roomCode,
      enabled: mode === "remote" && Boolean(roomCode),
      isHost,
      onMessage: handleRemoteMessage,
    });

  const handleSelect = (choice: Choice) => {
    if (matchWinner) return;

    if (mode === "1p") {
      const botChoice = pickRandomChoice();
      setP1Choice(choice);
      setP2Choice(botChoice);
      resolveRound(choice, botChoice);
      return;
    }

    if (mode === "local") {
      if (localPhase === "p1") {
        setP1Choice(choice);
        setLocalPhase("handoff");
      } else if (localPhase === "p2" && p1Choice) {
        setP2Choice(choice);
        setLocalPhase("reveal");
        resolveRound(p1Choice, choice);
      }
      return;
    }

    if (mode === "remote") {
      if (!roomCode || status !== "connected") return;
      if (myRole === 1 && !p1Choice) {
        remoteChoicesRef.current.p1 = choice;
        setP1Choice(choice);
        sendMessage("move", { choice, role: 1 });
        if (remoteChoicesRef.current.p2) {
          resolveRound(choice, remoteChoicesRef.current.p2);
        }
      } else if (myRole === 2 && !p2Choice) {
        remoteChoicesRef.current.p2 = choice;
        setP2Choice(choice);
        sendMessage("move", { choice, role: 2 });
        if (remoteChoicesRef.current.p1) {
          resolveRound(remoteChoicesRef.current.p1, choice);
        }
      }
    }
  };

  const nextRound = () => {
    remoteChoicesRef.current = { p1: null, p2: null };
    setP1Choice(null);
    setP2Choice(null);
    setRoundResult(null);
    setLocalPhase("p1");
    if (mode === "remote" && roomCode) {
      sendMessage("sync_request", {});
    }
  };

  const resetMatch = () => {
    remoteChoicesRef.current = { p1: null, p2: null };
    setP1Choice(null);
    setP2Choice(null);
    setRoundResult(null);
    setLocalPhase("p1");
    setScores({ p1: 0, p2: 0, draws: 0 });
    if (mode === "remote" && roomCode) {
      sendMessage("reset", {});
    }
  };

  const myRemotePicked = myRole === 1 ? Boolean(p1Choice) : Boolean(p2Choice);
  const opponentRemotePicked =
    myRole === 1 ? Boolean(p2Choice) : Boolean(p1Choice);

  const showReveal =
    (mode === "1p" && roundResult !== null) ||
    (mode === "local" && localPhase === "reveal") ||
    (mode === "remote" && Boolean(p1Choice && p2Choice));

  return (
    <GameShell
      game={game}
      mode={mode}
      onModeChange={(nextMode) => {
        setMode(nextMode);
        remoteChoicesRef.current = { p1: null, p2: null };
        setP1Choice(null);
        setP2Choice(null);
        setRoundResult(null);
        setLocalPhase("p1");
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
      onReset={resetMatch}
    >
      {/* Scoreboard */}
      <div className="mb-6 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 p-2.5">
          <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-zinc-400">
            {mode === "1p" ? "Tú" : "Jugador 1"}
          </p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {scores.p1} / {TARGET_WINS}
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
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 p-2.5">
          <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-zinc-400">
            {mode === "1p" ? "IA" : "Jugador 2"}
          </p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
            {scores.p2} / {TARGET_WINS}
          </p>
        </div>
      </div>

      {/* Local Handoff Screen */}
      {mode === "local" && localPhase === "handoff" ? (
        <div className="mx-auto max-w-sm rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 p-6 text-center">
          <p className="text-base font-bold">
            Jugador 1 ya eligió en secreto
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            Pasa el dispositivo al Jugador 2 para que elija su jugada.
          </p>
          <button
            type="button"
            onClick={() => setLocalPhase("p2")}
            className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
          >
            Listo, soy Jugador 2
          </button>
        </div>
      ) : showReveal && p1Choice && p2Choice ? (
        <div className="mx-auto max-w-md space-y-5 text-center">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 p-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                {mode === "1p" ? "Tú" : "Jugador 1"}
              </p>
              <p className="mt-2 text-5xl">
                {CHOICES.find((c) => c.id === p1Choice)?.emoji}
              </p>
              <p className="mt-1 text-sm font-bold">
                {CHOICES.find((c) => c.id === p1Choice)?.label}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 p-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                {mode === "1p" ? "IA" : "Jugador 2"}
              </p>
              <p className="mt-2 text-5xl">
                {CHOICES.find((c) => c.id === p2Choice)?.emoji}
              </p>
              <p className="mt-1 text-sm font-bold">
                {CHOICES.find((c) => c.id === p2Choice)?.label}
              </p>
            </div>
          </div>

          <p className="text-base font-bold">
            {matchWinner ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                🏆 ¡
                {matchWinner === 1
                  ? mode === "1p"
                    ? "Ganaste la partida"
                    : "Jugador 1 ganó la partida"
                  : mode === "1p"
                  ? "La IA ganó la partida"
                  : "Jugador 2 ganó la partida"}
                !
              </span>
            ) : roundResult === 0 ? (
              <span className="text-amber-600 dark:text-amber-400">
                ¡Empate en esta ronda!
              </span>
            ) : roundResult === 1 ? (
              <span className="text-indigo-600 dark:text-indigo-400">
                Punto para {mode === "1p" ? "ti" : "Jugador 1"}
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400">
                Punto para {mode === "1p" ? "la IA" : "Jugador 2"}
              </span>
            )}
          </p>

          {!matchWinner && (
            <button
              type="button"
              onClick={nextRound}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              Siguiente Ronda
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5 text-center">
          <p className="text-sm font-semibold">
            {mode === "remote" && status !== "connected"
              ? "Conecta con tu rival en una sala para empezar"
              : mode === "remote" && myRemotePicked
              ? opponentRemotePicked
                ? "Revelando..."
                : "Ya elegiste. Esperando al rival..."
              : mode === "local"
              ? `Turno de ${localPhase === "p1" ? "Jugador 1" : "Jugador 2"}: elige en secreto`
              : "Elige tu jugada"}
          </p>

          <div className="mx-auto grid max-w-md grid-cols-3 gap-3">
            {CHOICES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelect(c.id)}
                disabled={
                  (mode === "remote" &&
                    (status !== "connected" || myRemotePicked)) ||
                  Boolean(matchWinner)
                }
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 p-4 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-4xl sm:text-5xl">{c.emoji}</span>
                <span className="mt-2 text-xs sm:text-sm font-bold">
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {matchWinner && (
        <div className="mt-6 space-y-4 border-t border-slate-200 dark:border-zinc-800 pt-5">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={resetMatch}
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
