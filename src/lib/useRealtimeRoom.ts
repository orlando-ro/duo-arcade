"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

export type RoomStatus =
  | "connecting"
  | "waiting"
  | "connected"
  | "opponent_left";

export type PlayerRole = 1 | 2;

export interface RoomMessage<T = unknown> {
  type: "move" | "reset" | "sync_request" | "sync_state";
  payload: T;
  senderId: string;
}

interface UseRealtimeRoomOptions<T> {
  gameId: string;
  roomCode: string;
  enabled: boolean;
  isHost: boolean;
  onMessage: (msg: RoomMessage<T>) => void;
}

function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "server";
  const key = "duoarcade_player_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function useRealtimeRoom<T>({
  gameId,
  roomCode,
  enabled,
  isHost,
  onMessage,
}: UseRealtimeRoomOptions<T>) {
  const usingDemoFallback = !isSupabaseConfigured();
  const [status, setStatus] = useState<RoomStatus>(
    usingDemoFallback ? "waiting" : "connecting"
  );
  const playerRole: PlayerRole = isHost ? 1 : 2;
  const clientIdRef = useRef<string>("");
  const onMessageRef = useRef(onMessage);
  const channelRef = useRef<
    | { kind: "supabase"; send: (msg: RoomMessage<T>) => void; cleanup: () => void }
    | { kind: "demo"; send: (msg: RoomMessage<T>) => void; cleanup: () => void }
    | null
  >(null);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled || !roomCode) return;

    const myId = getOrCreateClientId();
    clientIdRef.current = myId;
    const topic = `room:${gameId}:${roomCode.toUpperCase()}`;

    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      const channel = supabase.channel(topic, {
        config: {
          presence: { key: myId },
          broadcast: { self: false },
        },
      });

      channel
        .on("broadcast", { event: "game_event" }, ({ payload }) => {
          const msg = payload as RoomMessage<T>;
          if (msg.senderId !== myId) {
            onMessageRef.current(msg);
          }
        })
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const count = Object.keys(state).length;
          setStatus((prev) => {
            if (count >= 2) return "connected";
            if (prev === "connected") return "opponent_left";
            return "waiting";
          });
        })
        .subscribe(async (subStatus) => {
          if (subStatus === "SUBSCRIBED") {
            await channel.track({ joinedAt: Date.now(), role: playerRole });
          }
        });

      channelRef.current = {
        kind: "supabase",
        send: (msg) => {
          channel.send({
            type: "broadcast",
            event: "game_event",
            payload: msg,
          });
        },
        cleanup: () => {
          supabase.removeChannel(channel);
        },
      };

      return () => {
        channelRef.current?.cleanup();
        channelRef.current = null;
      };
    }

    // Demo fallback via browser BroadcastChannel (works across 2 tabs on same browser)
    const bc = new BroadcastChannel(`duoarcade:${topic}`);
    const peers = new Set<string>([myId]);

    const handleDemoMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.senderId === myId) return;

      if (data.kind === "presence_ping") {
        peers.add(data.senderId);
        setStatus("connected");
        bc.postMessage({ kind: "presence_pong", senderId: myId });
        return;
      }
      if (data.kind === "presence_pong") {
        peers.add(data.senderId);
        setStatus("connected");
        return;
      }
      if (data.kind === "presence_leave") {
        peers.delete(data.senderId);
        if (peers.size < 2) setStatus("opponent_left");
        return;
      }
      if (data.kind === "game_event") {
        onMessageRef.current(data.msg as RoomMessage<T>);
      }
    };

    bc.addEventListener("message", handleDemoMessage);
    bc.postMessage({ kind: "presence_ping", senderId: myId });

    channelRef.current = {
      kind: "demo",
      send: (msg) => {
        bc.postMessage({ kind: "game_event", senderId: myId, msg });
      },
      cleanup: () => {
        bc.postMessage({ kind: "presence_leave", senderId: myId });
        bc.removeEventListener("message", handleDemoMessage);
        bc.close();
      },
    };

    return () => {
      channelRef.current?.cleanup();
      channelRef.current = null;
    };
  }, [enabled, gameId, roomCode, playerRole]);

  const sendMessage = useCallback((type: RoomMessage<T>["type"], payload: T) => {
    channelRef.current?.send({
      type,
      payload,
      senderId: clientIdRef.current,
    });
  }, []);

  return {
    status,
    playerRole,
    usingDemoFallback,
    sendMessage,
  };
}
