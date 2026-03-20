"use client";

import { useEffect } from "react";
import { useRoomStore } from "@/store/roomStore";

export default function RoomInitializer({ roomId }: { roomId: string }) {
  const setRoomId = useRoomStore((s) => s.setRoomId);

  useEffect(() => {
    setRoomId(roomId);
  }, [roomId, setRoomId]);

  return null;
}

