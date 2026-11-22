"use client";

import { useCallback, useRef, useState } from "react";
import { getGameBySlug } from "@/lib/games";
import { useRealtimeRoom, type RoomMessage } from "@/lib/useRealtimeRoom";
import { useRoomState } from "@/lib/useRoomState";
import { GameShell } from "@/components/GameShell";
import { AdSlot } from "@/components/AdSlot";

type Choice = "rock" | "paper" | "scissors";

const CHOICES: { id: Choice; code: string; label: string; emoji: string }[] = [
  { id: "rock", code: "01", label: "PIEDRA", emoji: "🪨" },
  { id: "paper", code: "02", label: "PAPEL", emoji: "📄" },
  { id: "scissors", code: "03", label: "TIJERA", emoji: "✂️" },
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
  const [localPhase, setLocalPhase] = useState<
    "p1" | "handoff" | "p2" | "reveal"
  >("p1");
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
      {/* Swiss Tabular Scoreboard */}
      <div className="border border-on-surface bg-surface-container-lowest">
        <div className="grid grid-cols-3 divide-x divide-on-surface text-left">
          <div className="p-4 bg-surface border-b-2 border-primary">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-primary">
                {mode === "1p" ? "Player 01" : "Jugador 1"}
              </span>
              <span className="w-2 h-2 bg-primary" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-on-surface">
                {scores.p1}
              </span>
              <span className="text-[11px] font-mono uppercase text-outline">
                / {TARGET_WINS}
              </span>
            </div>
          </div>

          <div className="p-4 bg-surface-container-low">
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
                Rondas
              </span>
            </div>
          </div>

          <div className="p-4 bg-surface border-b-2 border-on-surface">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-on-surface">
                {mode === "1p" ? "AI Táctica" : "Jugador 2"}
              </span>
              <span className="w-2 h-2 bg-on-surface" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-on-surface">
                {scores.p2}
              </span>
              <span className="text-[11px] font-mono uppercase text-outline">
                / {TARGET_WINS}
              </span>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="p-3 bg-surface-container border-t border-on-surface flex items-center justify-between font-mono text-xs uppercase">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-primary animate-pulse" />
            <span className="font-bold tracking-wide">
              {matchWinner
                ? `SERIE FINALIZADA: VICTORIA ${
                    matchWinner === 1
                      ? "JUGADOR 1"
                      : mode === "1p"
                      ? "IA TÁCTICA"
                      : "JUGADOR 2"
                  }`
                : mode === "remote" && status !== "connected"
                ? "STATUS: ESPERANDO CONEXIÓN EN SALA REMOTA"
                : mode === "remote" && myRemotePicked
                ? opponentRemotePicked
                  ? "STATUS: REVELANDO JUGADAS..."
                  : "STATUS: JUGADA SELLADA — ESPERANDO RIVAL..."
                : mode === "local"
                ? `TURNO OCULTO: ${
                    localPhase === "p1" ? "JUGADOR 1" : "JUGADOR 2"
                  }`
                : "PROTOCOLO CIEGO: SELECCIONA TU JUGADA"}
            </span>
          </div>
          <span className="text-[10px] tracking-widest text-outline hidden sm:inline">
            SERIE BO5
          </span>
        </div>
      </div>

      {/* Main Arena */}
      <div className="border border-on-surface bg-surface-container-lowest p-6 sm:p-10">
        {mode === "local" && localPhase === "handoff" ? (
          <div className="mx-auto max-w-sm border-2 border-on-surface bg-surface-container-low p-6 text-center space-y-4">
            <span className="inline-block font-mono text-[10px] uppercase px-2 py-0.5 bg-primary text-white font-bold">
              PANTALLA DE BLOQUEO
            </span>
            <p className="text-base font-grotesk font-bold uppercase">
              Jugador 1 ya selló su jugada
            </p>
            <p className="text-xs font-mono text-outline">
              Pasa el dispositivo al Jugador 2 para que elija en secreto.
            </p>
            <button
              type="button"
              onClick={() => setLocalPhase("p2")}
              className="w-full py-3 bg-on-surface text-surface-container-lowest hover:bg-primary hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              LISTO, SOY JUGADOR 2
            </button>
          </div>
        ) : showReveal && p1Choice && p2Choice ? (
          <div className="mx-auto max-w-md space-y-6 text-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-primary bg-surface p-5">
                <p className="font-mono text-[11px] font-bold uppercase text-primary">
                  {mode === "1p" ? "PLAYER 01" : "JUGADOR 1"}
                </p>
                <p className="mt-3 text-5xl">
                  {CHOICES.find((c) => c.id === p1Choice)?.emoji}
                </p>
                <p className="mt-2 font-mono text-sm font-bold uppercase">
                  {CHOICES.find((c) => c.id === p1Choice)?.label}
                </p>
              </div>
              <div className="border-2 border-on-surface bg-surface p-5">
                <p className="font-mono text-[11px] font-bold uppercase text-on-surface">
                  {mode === "1p" ? "AI TÁCTICA" : "JUGADOR 2"}
                </p>
                <p className="mt-3 text-5xl">
                  {CHOICES.find((c) => c.id === p2Choice)?.emoji}
                </p>
                <p className="mt-2 font-mono text-sm font-bold uppercase">
                  {CHOICES.find((c) => c.id === p2Choice)?.label}
                </p>
              </div>
            </div>

            <div className="p-3 border border-on-surface bg-surface-container-low font-mono text-xs font-bold uppercase">
              {matchWinner
                ? `🏆 SERIE GANADA POR ${
                    matchWinner === 1
                      ? mode === "1p"
                        ? "JUGADOR 1"
                        : "JUGADOR 1"
                      : mode === "1p"
                      ? "LA IA"
                      : "JUGADOR 2"
                  }`
                : roundResult === 0
                ? "EMPATE EN ESTA RONDA"
                : roundResult === 1
                ? `PUNTO PARA ${mode === "1p" ? "PLAYER 01" : "JUGADOR 1"}`
                : `PUNTO PARA ${mode === "1p" ? "LA IA" : "JUGADOR 2"}`}
            </div>

            {!matchWinner && (
              <button
                type="button"
                onClick={nextRound}
                className="bg-on-surface text-surface-container-lowest hover:bg-primary hover:text-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                SIGUIENTE RONDA →
              </button>
            )}
          </div>
        ) : (
          <div className="mx-auto max-w-md grid grid-cols-3 gap-4">
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
                className="group border-2 border-on-surface bg-surface hover:bg-on-surface hover:text-surface-container-lowest p-4 flex flex-col items-center justify-between gap-3 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="self-start font-mono text-[10px] font-bold text-primary group-hover:text-white">
                  [{c.code}]
                </span>
                <span className="text-4xl sm:text-5xl">{c.emoji}</span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {matchWinner && (
          <div className="mt-6 space-y-4 border-t border-on-surface/20 pt-5">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={resetMatch}
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
