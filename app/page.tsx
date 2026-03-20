"use client";

import { Playfair_Display } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function Home() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateRoom() {
    setError(null);
    setIsCreating(true);

    try {
      const supabase = createBrowserClient();

      // MVP: create a room with a generated name.
      const now = new Date();
      const roomName = `ÇarkıKitap Room ${now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;

      const { data, error: insertError } = await supabase
        .from("rooms")
        .insert({ name: roomName })
        .select("id")
        .single();

      if (insertError) throw insertError;
      if (!data?.id) throw new Error("Room insert succeeded but `id` was not returned.");

      router.push(`/room/${data.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create room.";
      setError(message);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(99,102,241,0.22),transparent_60%),radial-gradient(900px_circle_at_90%_20%,rgba(244,114,182,0.18),transparent_55%),linear-gradient(to_bottom,#0b1020,#070914)] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur sm:p-10">
          <div className="flex flex-col gap-5">
            <div className="space-y-3">
              <h1
                className={`text-4xl font-semibold tracking-tight text-white sm:text-5xl ${playfair.className}`}
              >
                ÇarkıKitap
              </h1>
              <p className="text-base leading-relaxed text-white/70 sm:text-lg">
                Spin a wheel together. Choose your next book without the monthly debate.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/10 p-4 sm:p-5">
              <p className="text-sm text-white/70">
                Create a room, set filters, and let the AI curate a 5–6 book shortlist for your group.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isCreating ? "Creating..." : "Create a Room"}
            </button>

            {error ? (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <div className="text-xs text-white/50">Tip: Rooms expire after 24 hours.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
