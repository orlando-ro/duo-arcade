"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getGameBySlug } from "@/lib/games";
import { useRealtimeRoom, type RoomMessage } from "@/lib/useRealtimeRoom";
import { useRoomState } from "@/lib/useRoomState";
import { GameShell } from "@/components/GameShell";
import { AdSlot } from "@/components/AdSlot";

const SYMBOLS = ["🚀", "🎮", "⚡", "🔥", "💎", "🎯", "🌟", "🎲"];

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
        // Check if AI knows any matching pair in memory
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
      {/* Scoreboard */}
      <div className="mb-5 grid grid-cols-3 gap-2 text-center">
        <div
          className={`rounded-xl border p-2.5 transition-colors ${
            !allMatched && turn === 1
              ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40"
              : "border-slate-200 dark:border-zinc-800"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-zinc-400">
            {mode === "1p" ? "Tú" : "Jugador 1"} ({matchWins.p1}v)
          </p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {scores.p1} pares
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 p-2.5">
          <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-zinc-400">
            Restantes
          </p>
          <p className="text-xl font-bold text-slate-700 dark:text-zinc-200">
            {8 - (scores.p1 + scores.p2)}
          </p>
        </div>

        <div
          className={`rounded-xl border p-2.5 transition-colors ${
            !allMatched && turn === 2
              ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40"
              : "border-slate-200 dark:border-zinc-800"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-zinc-400">
            {mode === "1p" ? "IA" : "Jugador 2"} ({matchWins.p2}v)
          </p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {scores.p2} pares
          </p>
        </div>
      </div>

      {/* Turn indicator */}
      <div className="mb-4 text-center text-sm font-semibold">
        {allMatched ? (
          scores.p1 > scores.p2 ? (
            <span className="text-emerald-600 dark:text-emerald-400">
              ¡Ganó {mode === "1p" ? "Tú" : "Jugador 1"} ({scores.p1} a{" "}
              {scores.p2})!
            </span>
          ) : scores.p2 > scores.p1 ? (
            <span className="text-emerald-600 dark:text-emerald-400">
              ¡Ganó {mode === "1p" ? "la IA" : "Jugador 2"} ({scores.p2} a{" "}
              {scores.p1})!
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400">
              ¡Empate a 4 pares!
            </span>
          )
        ) : mode === "remote" && status !== "connected" ? (
          <span className="text-slate-500 dark:text-zinc-400">
            Conecta con tu amigo en una sala para empezar
          </span>
        ) : mode === "remote" ? (
          <span>
            {turn === myPlayer
              ? "Tu turno — voltea 2 cartas"
              : "Turno del rival..."}
          </span>
        ) : (
          <span>
            Turno de:{" "}
            <strong>
              {turn === 1
                ? mode === "1p"
                  ? "Tú"
                  : "Jugador 1"
                : mode === "1p"
                ? "IA"
                : "Jugador 2"}
            </strong>{" "}
            (si aciertas, repites turno)
          </span>
        )}
      </div>

      {/* 4x4 Cards Grid */}
      <div className="mx-auto grid max-w-[360px] grid-cols-4 gap-2.5">
        {deck.map((symbol, idx) => {
          const isOpen = matched[idx] || flipped.includes(idx);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleCardClick(idx)}
              disabled={isOpen || locked || allMatched}
              aria-label={`Carta ${idx + 1}${isOpen ? `: ${symbol}` : ""}`}
              className={`flex aspect-square items-center justify-center rounded-2xl border-2 text-3xl transition-all cursor-pointer disabled:cursor-default ${
                matched[idx]
                  ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40"
                  : isOpen
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 scale-[1.03]"
                  : "border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-950/80 hover:border-indigo-400"
              }`}
            >
              {isOpen ? (
                <span>{symbol}</span>
              ) : (
                <span className="text-base font-bold text-slate-400 dark:text-zinc-600">
                  ?
                </span>
              )}
            </button>
          );
        })}
      </div>

      {allMatched && (
        <div className="mt-6 space-y-4 border-t border-slate-200 dark:border-zinc-800 pt-5">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => resetBoard()}
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
