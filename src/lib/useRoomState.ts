"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { GameMode } from "./games";

function generateRoomCode(): string {
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

  const [mode, setMode] = useState<GameMode>(initialSala ? "remote" : "1p");
  const [roomCode, setRoomCode] = useState(initialSala);
  const [isHost, setIsHost] = useState(!initialSala);

  const createRoom = useCallback(() => {
    const code = generateRoomCode();
    setRoomCode(code);
    setIsHost(true);
    setMode("remote");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("sala", code);
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
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const leaveRoom = useCallback(() => {
    setRoomCode("");
    setIsHost(true);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("sala");
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
