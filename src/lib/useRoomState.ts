"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { GameMode } from "./games";

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function useRoomState() {
  const searchParams = useSearchParams();
  const initialSala = searchParams.get("sala")?.trim().toUpperCase() ?? "";
  const initialModo = searchParams.get("modo")?.trim().toLowerCase() ?? "";
  const initialHost = searchParams.get("host") === "1";

  const resolvedMode: GameMode = initialSala
    ? "remote"
    : initialModo === "local" || initialModo === "remote" || initialModo === "1p"
    ? (initialModo as GameMode)
    : "1p";

  const [mode, setMode] = useState<GameMode>(resolvedMode);
  const [roomCode, setRoomCode] = useState(initialSala);
  const [isHost, setIsHost] = useState(initialSala ? initialHost : true);

  const createRoom = useCallback(() => {
    const code = generateRoomCode();
    setRoomCode(code);
    setIsHost(true);
    setMode("remote");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("sala", code);
      url.searchParams.delete("host");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const joinRoom = useCallback((code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    setRoomCode(clean);
    setIsHost(false);
    setMode("remote");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("sala", clean);
      url.searchParams.delete("host");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const leaveRoom = useCallback(() => {
    setRoomCode("");
    setIsHost(true);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("sala");
      url.searchParams.delete("host");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const changeMode = useCallback(
    (nextMode: GameMode) => {
      setMode(nextMode);
      if (nextMode !== "remote" && roomCode) {
        leaveRoom();
      }
    },
    [roomCode, leaveRoom]
  );

  return {
    mode,
    setMode: changeMode,
    roomCode,
    isHost,
    createRoom,
    joinRoom,
    leaveRoom,
  };
}
