"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getGameBySlug } from "@/lib/games";
import { useRealtimeRoom, type RoomMessage } from "@/lib/useRealtimeRoom";
import { useRoomState } from "@/lib/useRoomState";
import { GameShell } from "@/components/GameShell";
import { AdSlot } from "@/components/AdSlot";

const SYMBOLS = ["★", "◆", "▲", "●", "✚", "✖", "■", "◈"];

function hashCodeToSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) || 12345;
}

function createShuffledDeck(seed: number): string[] {
  const deck = [...SYMBOLS, ...SYMBOLS];
  let s = seed || 1;
  for (let i = deck.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  return deck;
}

type Player = 1 | 2;

export function MemoryGame() {
  const game = getGameBySlug("memoria")!;
  const {
    mode,
    setMode,
    roomCode,
    isHost,
    createRoom,
    joinRoom,
    leaveRoom,
  } = useRoomState();

  const [seed, setSeed] = useState<number>(101);
  const effectiveSeed =
    mode === "remote" && roomCode
      ? hashCodeToSeed(roomCode) + seed
      : seed;
  const deck = createShuffledDeck(effectiveSeed);

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<boolean[]>(Array(16).fill(false));
  const [turn, setTurn] = useState<Player>(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [matchWins, setMatchWins] = useState({ p1: 0, p2: 0, draws: 0 });
  const [locked, setLocked] = useState(false);

  const memoryRef = useRef<Map<number, string>>(new Map());

  const allMatched = matched.every(Boolean);
  const myPlayer: Player = isHost ? 1 : 2;

  const processCardFlip = useCallback(
    (index: number, currentDeck: string[]) => {
      memoryRef.current.set(index, currentDeck[index]);

      setFlipped((prev) => {
        if (prev.includes(index) || prev.length >= 2) return prev;
        const next = [...prev, index];

        if (next.length === 2) {
          setLocked(true);
          const [first, second] = next;
          const isMatch = currentDeck[first] === currentDeck[second];

          setTimeout(() => {
            if (isMatch) {
              setMatched((m) => {
                const updated = [...m];
                updated[first] = true;
                updated[second] = true;
                return updated;
              });
              setScores((s) => {
                const active = turn;
                const nextScores = {
                  p1: active === 1 ? s.p1 + 1 : s.p1,
                  p2: active === 2 ? s.p2 + 1 : s.p2,
                };
                if (nextScores.p1 + nextScores.p2 === 8) {
                  setMatchWins((mw) => ({
                    p1: nextScores.p1 > nextScores.p2 ? mw.p1 + 1 : mw.p1,
                    p2: nextScores.p2 > nextScores.p1 ? mw.p2 + 1 : mw.p2,
                    draws:
                      nextScores.p1 === nextScores.p2 ? mw.draws + 1 : mw.draws,
                  }));
                }
                return nextScores;
              });
            } else {
              setTurn((t) => (t === 1 ? 2 : 1));
            }
            setFlipped([]);
            setLocked(false);
          }, 750);
        }

        return next;
      });
    },
    [turn]
  );

  const handleRemoteMessage = useCallback(
    (msg: RoomMessage<{ index?: number; nextSeed?: number }>) => {
      if (msg.type === "move" && typeof msg.payload.index === "number") {
        const currentDeck = createShuffledDeck(
          hashCodeToSeed(roomCode) + seed
        );
        processCardFlip(msg.payload.index, currentDeck);
      } else if (msg.type === "reset") {
        const nextS = msg.payload.nextSeed ?? 202;
        setSeed(nextS);
        setFlipped([]);
        setMatched(Array(16).fill(false));
        setTurn(1);
        setScores({ p1: 0, p2: 0 });
        setLocked(false);
        memoryRef.current.clear();
      }
    },
    [processCardFlip, roomCode, seed]
  );

  const { status, playerRole, usingDemoFallback, sendMessage } =
    useRealtimeRoom<{ index?: number; nextSeed?: number }>({
      gameId: game.id,
      roomCode,
      enabled: mode === "remote" && Boolean(roomCode),
      isHost,
      onMessage: handleRemoteMessage,
    });

  // AI Turn in 1P mode
  useEffect(() => {
    if (mode !== "1p" || turn !== 2 || allMatched || locked) return;
    if (flipped.length >= 2) return;

    const timer = setTimeout(() => {
      const available = matched
        .map((m, i) => (!m && !flipped.includes(i) ? i : -1))
        .filter((i) => i !== -1);
      if (available.length === 0) return;

      let chosen = available[0];

      if (flipped.length === 0) {
        let foundPairFirst = -1;
        for (const a of available) {
          const symA = memoryRef.current.get(a);
          if (!symA) continue;
          for (const b of available) {
            if (a !== b && memoryRef.current.get(b) === symA) {
              foundPairFirst = a;
              break;
            }
          }
          if (foundPairFirst !== -1) break;
        }
        if (foundPairFirst !== -1) {
          chosen = foundPairFirst;
        } else {
          const unseen = available.filter((i) => !memoryRef.current.has(i));
          const pool = unseen.length > 0 ? unseen : available;
          chosen = pool[(scores.p1 + scores.p2 + pool.length) % pool.length];
        }
      } else if (flipped.length === 1) {
        const firstIdx = flipped[0];
        const targetSymbol = deck[firstIdx];
        const knownMatch = available.find(
          (i) => memoryRef.current.get(i) === targetSymbol
        );
        if (knownMatch !== undefined) {
          chosen = knownMatch;
        } else {
          chosen = available[(firstIdx + 3) % available.length];
        }
      }

      processCardFlip(chosen, deck);
    }, 550);

    return () => clearTimeout(timer);
  }, [
    mode,
    turn,
    allMatched,
    locked,
    flipped,
    matched,
    deck,
    scores,
    processCardFlip,
  ]);

  const handleCardClick = (idx: number) => {
    if (locked || allMatched || matched[idx] || flipped.includes(idx)) return;
    if (mode === "1p" && turn !== 1) return;
    if (mode === "remote") {
      if (!roomCode || status !== "connected") return;
      if (turn !== myPlayer) return;
    }

    processCardFlip(idx, deck);
    if (mode === "remote") {
      sendMessage("move", { index: idx });
    }
  };

  const resetBoard = (nextSeedVal?: number) => {
    const newSeed = nextSeedVal ?? seed + 17;
    setSeed(newSeed);
    setFlipped([]);
    setMatched(Array(16).fill(false));
    setTurn(1);
    setScores({ p1: 0, p2: 0 });
    setLocked(false);
    memoryRef.current.clear();
    if (mode === "remote" && roomCode) {
      sendMessage("reset", { nextSeed: newSeed });
    }
  };

  const statusText = allMatched
    ? scores.p1 > scores.p2
      ? `¡Ganó ${mode === "1p" ? "Tú" : "Jugador 1"} (${scores.p1} a ${scores.p2})!`
      : scores.p2 > scores.p1
      ? `¡Ganó ${mode === "1p" ? "la IA" : "Jugador 2"} (${scores.p2} a ${scores.p1})!`
      : "Empate (4 a 4)"
    : mode === "remote" && status !== "connected"
    ? "Esperando al rival..."
    : mode === "remote"
    ? turn === myPlayer
      ? "Tu turno — voltea 2 cartas"
      : "Turno del rival..."
    : `Turno: ${
        turn === 1
          ? mode === "1p"
            ? "Tú"
            : "Jugador 1"
          : mode === "1p"
          ? "IA"
          : "Jugador 2"
      } (si aciertas, repites turno)`;

  return (
    <GameShell
      game={game}
      mode={mode}
      onModeChange={(nextMode) => {
        setMode(nextMode);
        setSeed((s) => s + 31);
        setFlipped([]);
        setMatched(Array(16).fill(false));
        setTurn(1);
        setScores({ p1: 0, p2: 0 });
        setMatchWins({ p1: 0, p2: 0, draws: 0 });
        setLocked(false);
        memoryRef.current.clear();
      }}
      roomCode={roomCode}
      isHost={isHost}
      roomStatus={status}
      playerRole={playerRole}
      usingDemoFallback={usingDemoFallback}
      onCreateRoom={createRoom}
      onJoinRoom={joinRoom}
      onLeaveRoom={leaveRoom}
      onReset={() => resetBoard()}
    >
      {/* Swiss Tabular Scoreboard */}
      <div className="border border-on-surface/20 bg-surface-container-lowest">
        <div className="grid grid-cols-3 divide-x divide-on-surface/15 text-left">
          <div
            className={`p-3.5 sm:p-4 transition-all border-b-2 ${
              !allMatched && turn === 1
                ? "border-primary opacity-100"
                : "border-transparent opacity-60"
            }`}
          >
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-primary block">
              {mode === "1p" ? "Tú" : "Jugador 1"} ({matchWins.p1}v)
            </span>
            <span className="mt-1 block text-3xl sm:text-4xl font-mono font-bold tracking-tight text-on-surface">
              {scores.p1}
            </span>
          </div>

          <div className="p-3.5 sm:p-4 bg-surface-container-low/60">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-outline block">
              Restantes
            </span>
            <span className="mt-1 block text-3xl sm:text-4xl font-mono font-bold tracking-tight text-on-surface">
              {8 - (scores.p1 + scores.p2)}
            </span>
          </div>

          <div
            className={`p-3.5 sm:p-4 transition-all border-b-2 ${
              !allMatched && turn === 2
                ? "border-on-surface opacity-100"
                : "border-transparent opacity-60"
            }`}
          >
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-on-surface block">
              {mode === "1p" ? "IA" : "Jugador 2"} ({matchWins.p2}v)
            </span>
            <span className="mt-1 block text-3xl sm:text-4xl font-mono font-bold tracking-tight text-on-surface">
              {scores.p2}
            </span>
          </div>
        </div>

        <div className="px-4 py-2.5 bg-surface-container-low border-t border-on-surface/15 flex items-center gap-2 font-mono text-xs">
          <span
            className={`inline-block w-2 h-2 ${
              allMatched
                ? "bg-primary"
                : turn === 1
                ? "bg-primary animate-pulse"
                : "bg-on-surface animate-pulse"
            }`}
          />
          <span className="font-semibold text-on-surface">{statusText}</span>
        </div>
      </div>

      {/* 4x4 Cards Grid */}
      <div className="border border-on-surface/20 bg-surface-container-lowest p-6 sm:p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-[360px] grid grid-cols-4 gap-2.5">
          {deck.map((symbol, idx) => {
            const isOpen = matched[idx] || flipped.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleCardClick(idx)}
                disabled={isOpen || locked || allMatched}
                aria-label={`Carta ${idx + 1}${isOpen ? `: ${symbol}` : ""}`}
                className={`aspect-square border-2 flex items-center justify-center font-mono transition-all cursor-pointer disabled:cursor-default ${
                  matched[idx]
                    ? "border-primary bg-primary text-white"
                    : isOpen
                    ? "border-on-surface bg-on-surface text-surface-container-lowest"
                    : "border-on-surface/35 bg-surface hover:border-on-surface hover:bg-surface-container"
                }`}
              >
                {isOpen ? (
                  <span className="text-2xl sm:text-3xl font-bold leading-none">
                    {symbol}
                  </span>
                ) : (
                  <span className="text-sm font-bold text-outline">#</span>
                )}
              </button>
            );
          })}
        </div>

        {allMatched && (
          <div className="w-full mt-6 space-y-4 border-t border-on-surface/15 pt-5">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => resetBoard()}
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
