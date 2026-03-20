"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useRoomStore, type Book, type RoomFilters } from "@/store/roomStore";

async function generateBooks(filters: RoomFilters): Promise<Book[]> {
  const res = await fetch("/api/generate-books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filters }),
  });

  const data = (await res.json()) as unknown;
  if (!res.ok) {
    const maybeError = data as { error?: unknown };
    const message =
      typeof maybeError.error === "string" ? maybeError.error : "Failed to generate books.";
    throw new Error(message);
  }

  return data as Book[];
}

export default function GenerateBooksButton() {
  const filters = useRoomStore((s) => s.filters);
  const setBooks = useRoomStore((s) => s.setBooks);
  const setIsSpinning = useRoomStore((s) => s.setIsSpinning);
  const setWinningBookIndex = useRoomStore((s) => s.setWinningBookIndex);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setIsGenerating(true);
    try {
      // If books are being regenerated, clear any previous reveal.
      setIsSpinning(false);
      setWinningBookIndex(null);
      setBooks([]);

      const data = await generateBooks(filters);
      setBooks(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate books.";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={isGenerating}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Sparkles className="h-4 w-4" />
        {isGenerating ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white/90" />
            AI is curating your books...
          </span>
        ) : (
          "Generate Books"
        )}
      </button>

      {isGenerating ? (
        <div className="mt-3 animate-pulse rounded-xl border border-indigo-200/30 bg-indigo-50/20 p-3">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-indigo-400" />
            <div className="h-2 w-3/4 rounded bg-indigo-200/40" />
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}

