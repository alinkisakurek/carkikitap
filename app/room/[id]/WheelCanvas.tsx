"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useRoomStore } from "@/store/roomStore";
import { createBrowserClient } from "@/lib/supabase";

type SpinStartPayload = {
  clientId: string;
  roomId: string;
  winning_book_index: number;
  // Epoch milliseconds. All clients schedule their local wheel animation for this time.
  startsAt: number;
};

function clampToTitle(title: string, maxLen: number): string {
  const normalized = title.trim();
  if (normalized.length <= maxLen) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLen - 1))}…`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

export default function WheelCanvas() {
  const books = useRoomStore((s) => s.books);
  const roomId = useRoomStore((s) => s.roomId);
  const isBlindDateMode = useRoomStore((s) => s.isBlindDateMode);
  const isSpinning = useRoomStore((s) => s.isSpinning);
  const setIsSpinning = useRoomStore((s) => s.setIsSpinning);
  const setWinningBookIndex = useRoomStore((s) => s.setWinningBookIndex);

  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  const pendingWinningIndexRef = useRef<number | null>(null);
  const spinChannelRef = useRef<RealtimeChannel | null>(null);
  const scheduledTimeoutRef = useRef<number | null>(null);
  const clientIdRef = useRef<string>(
    (() => {
      const cryptoObj = globalThis.crypto;
      const randomUUID =
        cryptoObj && "randomUUID" in cryptoObj ? cryptoObj.randomUUID : undefined;
      return randomUUID
        ? randomUUID.call(cryptoObj)
        : `client_${Math.random().toString(16).slice(2)}`;
    })(),
  );

  const isSpinningRef = useRef(isSpinning);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    isSpinningRef.current = isSpinning;
  }, [isSpinning]);

  const booksRef = useRef(books);
  useEffect(() => {
    booksRef.current = books;
  }, [books]);

  useEffect(() => {
    // Generate a stable client id for ignoring our own broadcast events.
    if (clientIdRef.current) return;
    const cryptoObj = globalThis.crypto;
    const randomUUID = cryptoObj && "randomUUID" in cryptoObj ? cryptoObj.randomUUID : undefined;
    clientIdRef.current = randomUUID
      ? randomUUID.call(cryptoObj)
      : `client_${Math.random().toString(16).slice(2)}`;
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!roomId) return;

    const supabase = createBrowserClient();
    const channelName = `room:${roomId}`;
    const channel = supabase.channel(channelName);

    spinChannelRef.current = channel;

    channel.on(
      "broadcast",
      { event: "spin_start" },
      (payload: unknown) => {
        const data = payload as SpinStartPayload;
        if (!data) return;

        if (data.clientId === clientIdRef.current) return;
        if (data.roomId !== roomId) return;
        if (typeof data.winning_book_index !== "number") return;
        if (typeof data.startsAt !== "number") return;

        startSpinAnimation(data.winning_book_index, data.startsAt);
      },
    );

    channel.subscribe();

    return () => {
      // Best-effort cleanup.
      spinChannelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [roomId]);

  const sliceData = useMemo(() => {
    const n = books.length;
    const sliceAngle = n > 0 ? 360 / n : 360;

    // Colors cycle deterministically (no randomness for stable UI).
    const palette = [
      "#4f46e5", // indigo
      "#7c3aed", // violet
      "#db2777", // fuchsia
      "#f97316", // orange
      "#10b981", // emerald
      "#0ea5e9", // sky
      "#f43f5e", // rose
      "#22c55e", // green
    ];

    return {
      sliceAngle,
      palette,
    };
  }, [books.length]);

  const startSpinAnimation = useCallback(
    (winningIndex: number, startsAt: number) => {
    const currentBooks = booksRef.current;
    const n = currentBooks.length;
    if (n < 2) return;
    if (winningIndex < 0 || winningIndex >= n) return;
    if (isSpinningRef.current) return;

    const sliceAngleLocal = 360 / n;

    // Add multiple full spins for suspense. The modulo will land the winning slice under the pointer.
    const extraSpins = 8;
    const targetModulo = (360 - winningIndex * sliceAngleLocal) % 360;
    const targetRotation = rotationRef.current + extraSpins * 360 + targetModulo;

    pendingWinningIndexRef.current = winningIndex;
    rotationRef.current = targetRotation;

    // Update store immediately: hide overlay until animation completes.
    setWinningBookIndex(null);
    setIsSpinning(true);

    if (scheduledTimeoutRef.current) {
      window.clearTimeout(scheduledTimeoutRef.current);
      scheduledTimeoutRef.current = null;
    }

    const delayMs = startsAt - Date.now();
    const start = () => setRotation(targetRotation);

    if (delayMs <= 0) {
      start();
    } else {
      scheduledTimeoutRef.current = window.setTimeout(start, delayMs);
    }
    },
    [setIsSpinning, setWinningBookIndex],
  );

  const broadcastSpinStart = (winningIndex: number, startsAt: number) => {
    const channel = spinChannelRef.current;
    const currentRoomId = roomId;
    if (!channel || !currentRoomId) return;

    const payload: SpinStartPayload = {
      clientId: clientIdRef.current,
      roomId: currentRoomId,
      winning_book_index: winningIndex,
      startsAt,
    };

    // `broadcast` triggers the channel callback on other connected clients.
    channel.send({
      type: "broadcast",
      event: "spin_start",
      payload,
    });
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (books.length < 2) return;
    if (!roomId) return;

    const n = books.length;
    const winningIndex = Math.floor(Math.random() * n);

    // Start all clients (including us) near-simultaneously.
    // Buffer for network jitter so all clients start their local animation together.
    const startsAt = Date.now() + 1200;

    startSpinAnimation(winningIndex, startsAt);
    broadcastSpinStart(winningIndex, startsAt);
  };

  const n = books.length;
  const sliceAngle = n > 0 ? 360 / n : 360;

  const cx = 180;
  const cy = 180;
  const outerR = 150;
  const innerR = 70;

  return (
    <div className="w-full">
      <div className="relative mx-auto aspect-square w-full max-w-[420px] rounded-[32px] border border-white/10 bg-white/5 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
        {/* Pointer */}
        <div className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2">
          <div className="relative">
            <div className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-white/90" />
            <div className="absolute left-1/2 top-3 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500" />
          </div>
        </div>

        <svg viewBox="0 0 360 360" className="h-full w-full">
          {/* Rotate the wheel group, but keep pointer fixed in DOM above. */}
          <motion.g
            style={{ transformOrigin: "180px 180px" }}
            animate={{ rotate: rotation }}
            transition={{
              type: "spring",
              stiffness: 30,
              damping: 10,
              mass: 2,
            }}
            onAnimationComplete={() => {
              const idx = pendingWinningIndexRef.current;
              if (idx === null) return;
              pendingWinningIndexRef.current = null;
              setWinningBookIndex(idx);
              setIsSpinning(false);
            }}
          >
            {/* Slices */}
            {books.map((book, i) => {
              const startAngle = -90 - sliceAngle / 2 + i * sliceAngle;
              const endAngle = startAngle + sliceAngle;

              const startOuter = polarToCartesian(cx, cy, outerR, startAngle);
              const endOuter = polarToCartesian(cx, cy, outerR, endAngle);

              const startInner = polarToCartesian(cx, cy, innerR, startAngle);
              const endInner = polarToCartesian(cx, cy, innerR, endAngle);

              const largeArc = sliceAngle > 180 ? 1 : 0;
              const color = sliceData.palette[i % sliceData.palette.length];

              const d = [
                `M ${cx} ${cy}`,
                `L ${startOuter.x} ${startOuter.y}`,
                `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
                `L ${endInner.x} ${endInner.y}`,
                `A ${innerR} ${innerR} 0 ${largeArc} 0 ${startInner.x} ${startInner.y}`,
                "Z",
              ].join(" ");

              // Place label around the middle of the wedge.
              const midAngle = startAngle + sliceAngle / 2;
              const labelPos = polarToCartesian(cx, cy, (outerR + innerR) / 2, midAngle);

              return (
                <g key={`${book.isbn}-${i}`}>
                  <path d={d} fill={color} opacity={0.95} stroke="rgba(255,255,255,0.45)" />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={
                      isBlindDateMode
                        ? Math.max(9, Math.min(13, 280 / n))
                        : Math.max(10, Math.min(14, 320 / n))
                    }
                    fontWeight={700}
                    style={{
                      paintOrder: "stroke",
                      stroke: "rgba(0,0,0,0.18)",
                      strokeWidth: 1,
                      fontFamily: isBlindDateMode
                        ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                        : undefined,
                    }}
                    transform={`rotate(${midAngle + 90} ${labelPos.x} ${labelPos.y})`}
                  >
                    {clampToTitle(isBlindDateMode ? book.hook : book.title, isBlindDateMode ? 28 : 18)}
                  </text>
                </g>
              );
            })}

            {/* Center cap */}
            <circle cx={cx} cy={cy} r={innerR - 10} fill="rgba(15,23,42,0.85)" stroke="rgba(255,255,255,0.25)" />
            <circle cx={cx} cy={cy} r={innerR - 24} fill="rgba(99,102,241,0.25)" />
          </motion.g>
        </svg>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleSpin}
          disabled={isSpinning || books.length < 2}
          className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-sm shadow-white/5 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSpinning ? "Spinning..." : "Spin"}
        </button>
      </div>
    </div>
  );
}

