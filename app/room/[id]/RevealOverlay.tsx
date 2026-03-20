"use client";

import { AnimatePresence, motion } from "framer-motion";
import Confetti from "react-confetti";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRoomStore } from "@/store/roomStore";

export default function RevealOverlay() {
  const isSpinning = useRoomStore((s) => s.isSpinning);
  const winning_book_index = useRoomStore((s) => s.winning_book_index);
  const books = useRoomStore((s) => s.books);
  const isBlindDateMode = useRoomStore((s) => s.isBlindDateMode);

  const winningBook = useMemo(() => {
    if (winning_book_index === null) return null;
    return books[winning_book_index] ?? null;
  }, [books, winning_book_index]);

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [phase, setPhase] = useState<"hook" | "reveal">("reveal");

  useEffect(() => {
    setThumbnailUrl(null);
    if (!winningBook?.isbn) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/book-cover?isbn=${encodeURIComponent(winningBook.isbn)}`);
        const data = (await res.json()) as { thumbnailUrl: string | null };
        if (!cancelled) setThumbnailUrl(data.thumbnailUrl);
      } catch {
        // Non-fatal; overlay can still render the textual reveal.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [winningBook?.isbn]);

  useEffect(() => {
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const shouldRender = !isSpinning && winningBook !== null;

  useEffect(() => {
    // Reset phase when a new winner arrives.
    if (!isBlindDateMode) {
      setPhase("reveal");
      return;
    }

    setPhase("hook");
    const timeoutId = window.setTimeout(() => setPhase("reveal"), 1200);
    return () => window.clearTimeout(timeoutId);
  }, [isBlindDateMode, winning_book_index]);

  if (!shouldRender) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <AnimatePresence mode="wait">
        {phase === "hook" && isBlindDateMode ? (
          <motion.div
            key="hook"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-4 w-full max-w-2xl rounded-3xl border border-white/10 bg-white/95 p-5 shadow-2xl shadow-indigo-500/10 sm:p-8"
          >
            <div className="text-xs font-semibold tracking-wide text-indigo-700">
              Blind Date Reveal
            </div>
            <h2 className="mt-4 line-clamp-5 text-2xl font-bold text-zinc-900">
              <span className="rounded-xl bg-indigo-50 px-2 py-1 font-mono">{winningBook.hook}</span>
            </h2>
            <p className="mt-3 text-sm font-medium text-zinc-700">
              The cover is coming next...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-4 w-full max-w-2xl rounded-3xl border border-white/10 bg-white/95 p-5 shadow-2xl shadow-indigo-500/10 sm:p-8"
          >
            <Confetti
              width={viewport.width}
              height={viewport.height}
              numberOfPieces={420}
              recycle={false}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex items-center justify-center rounded-2xl bg-zinc-100 p-3">
                {thumbnailUrl ? (
                  <Image
                    src={thumbnailUrl}
                    alt={`${winningBook.title} cover`}
                    width={160}
                    height={224}
                    className="h-56 w-40 rounded-lg object-cover shadow-sm"
                    unoptimized
                    priority
                  />
                ) : (
                  <div className="h-56 w-40 rounded-lg bg-white/70 p-4 text-center">
                    <div className="text-xs font-semibold text-zinc-600">Cover</div>
                    <div className="mt-2 text-xs font-medium text-zinc-900">{winningBook.title}</div>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold tracking-wide text-indigo-700">Wheel Reveal</div>
                <h2 className="mt-2 line-clamp-3 text-2xl font-bold text-zinc-900">
                  {winningBook.title}
                </h2>
                <p className="mt-1 text-sm font-medium text-zinc-700">by {winningBook.author}</p>
                <p className="mt-3 text-xs text-zinc-600">Hook: {winningBook.hook}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-zinc-50 p-4">
              <div className="text-sm font-semibold text-zinc-900">Why your group will love it</div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700">{winningBook.why_club}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

