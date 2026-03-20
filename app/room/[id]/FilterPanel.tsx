"use client";

import { EyeOff, Globe, RotateCcw, Sparkles, SlidersHorizontal } from "lucide-react";
import { useMemo } from "react";
import { useRoomStore, type Genre, type DiscussionPotentialFilter, type MoodFilter, type OriginalLanguageFilter, type PageCountFilter, type PublicationYearFilter, type ReadingPaceFilter } from "@/store/roomStore";

const genreOptions: Genre[] = [
  "Fiction",
  "Sci-Fi",
  "Mystery",
  "Non-Fiction",
  "Fantasy",
  "Historical",
  "Romance",
  "Horror",
  "Thriller",
  "Biography",
  "Self-Help",
  "Graphic Novel",
];

const moodOptions: MoodFilter[] = ["Uplifting", "Dark", "Humorous", "Thought-provoking", "Adventurous", "Romantic"];

const originalLanguageOptions: OriginalLanguageFilter[] = ["english", "translated", "either"];

const pageCountOptions: Array<{ value: PageCountFilter; label: string }> = [
  { value: "any", label: "Any" },
  { value: "under_200", label: "Under 200" },
  { value: "200_350", label: "200–350" },
  { value: "350_500", label: "350–500" },
  { value: "500_plus", label: "500+" },
];

const publicationYearOptions: Array<{ value: PublicationYearFilter; label: string }> = [
  { value: "any", label: "Any" },
  { value: "pre_1950", label: "Pre-1950" },
  { value: "1950_2000", label: "1950–2000" },
  { value: "2000_2015", label: "2000–2015" },
  { value: "last_5_years", label: "Last 5 years" },
];

const readingPaceOptions: Array<{ value: ReadingPaceFilter; label: string }> = [
  { value: "any", label: "Any" },
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "dense", label: "Dense" },
];

const discussionOptions: Array<{ value: DiscussionPotentialFilter; label: string }> = [
  { value: "any", label: "Any" },
  { value: "high", label: "High" },
  { value: "low", label: "Low" },
];

export default function FilterPanel() {
  const filters = useRoomStore((s) => s.filters);
  const isBlindDateMode = useRoomStore((s) => s.isBlindDateMode);
  const toggleBlindDateMode = useRoomStore((s) => s.toggleBlindDateMode);
  const toggleGenre = useRoomStore((s) => s.toggleGenre);
  const setPageCount = useRoomStore((s) => s.setPageCount);
  const setReadingPace = useRoomStore((s) => s.setReadingPace);
  const setPublicationYear = useRoomStore((s) => s.setPublicationYear);
  const toggleOriginalLanguage = useRoomStore((s) => s.toggleOriginalLanguage);
  const toggleMood = useRoomStore((s) => s.toggleMood);
  const setDiscussionPotential = useRoomStore((s) => s.setDiscussionPotential);
  const resetFilters = useRoomStore((s) => s.resetFilters);

  const derived = useMemo(() => {
    const pageIdx = pageCountOptions.findIndex((o) => o.value === filters.pageCount);
    const yearIdx = publicationYearOptions.findIndex((o) => o.value === filters.publicationYear);
    return {
      pageIdx: pageIdx === -1 ? 0 : pageIdx,
      yearIdx: yearIdx === -1 ? 0 : yearIdx,
      pageLabel: pageCountOptions.find((o) => o.value === filters.pageCount)?.label ?? "Any",
      yearLabel:
        publicationYearOptions.find((o) => o.value === filters.publicationYear)?.label ?? "Any",
    };
  }, [filters.pageCount, filters.publicationYear]);

  return (
    <section className="w-full rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
            <h2 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Filters
            </h2>
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Pick what your group would enjoy. Leave anything as <span className="font-medium">Any</span> to broaden results.
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>

          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800">
            <EyeOff className="h-4 w-4 text-zinc-700 dark:text-zinc-200" />
            <span className="whitespace-nowrap">Blind date</span>

            <input
              type="checkbox"
              checked={isBlindDateMode}
              onChange={toggleBlindDateMode}
              className="sr-only"
              aria-label="Enable blind date mode"
            />

            <span
              aria-hidden
              className={[
                "relative inline-flex h-6 w-11 items-center rounded-full transition",
                isBlindDateMode ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
                  isBlindDateMode ? "translate-x-6" : "translate-x-1",
                ].join(" ")}
              />
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {/* Genre (multi-select) */}
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-zinc-700 dark:text-zinc-200" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Genre</h3>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {genreOptions.map((genre) => {
              const selected = filters.genres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  aria-pressed={selected}
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    selected
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-300"
                      : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900",
                  ].join(" ")}
                >
                  {genre}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Select multiple genres (empty = Any).
          </p>
        </div>

        {/* Page count (range slider) */}
        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Page count</h3>
            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
              {derived.pageLabel}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={4}
            step={1}
            value={derived.pageIdx}
            onChange={(e) => setPageCount(pageCountOptions[Number(e.target.value)]!.value)}
            className="mt-3 w-full accent-indigo-600"
            aria-label="Page count"
          />
          <div className="mt-2 flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>{pageCountOptions[0]!.label}</span>
            <span>{pageCountOptions[1]!.label}</span>
            <span>{pageCountOptions[2]!.label}</span>
            <span>{pageCountOptions[3]!.label}</span>
            <span>{pageCountOptions[4]!.label}</span>
          </div>
        </div>

        {/* Reading pace (single-select) */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Reading pace</h3>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {readingPaceOptions.map((opt) => {
              const selected = filters.readingPace === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setReadingPace(opt.value)}
                  aria-pressed={selected}
                  className={[
                    "rounded-xl border px-2 py-2 text-xs font-medium transition",
                    selected
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-300"
                      : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Publication year (range slider) */}
        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Publication year</h3>
            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
              {derived.yearLabel}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={4}
            step={1}
            value={derived.yearIdx}
            onChange={(e) =>
              setPublicationYear(publicationYearOptions[Number(e.target.value)]!.value)
            }
            className="mt-3 w-full accent-indigo-600"
            aria-label="Publication year"
          />
          <div className="mt-2 flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>{publicationYearOptions[0]!.label}</span>
            <span>{publicationYearOptions[1]!.label}</span>
            <span>{publicationYearOptions[2]!.label}</span>
            <span>{publicationYearOptions[3]!.label}</span>
            <span>{publicationYearOptions[4]!.label}</span>
          </div>
        </div>

        {/* Original language (multi-select) */}
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-zinc-700 dark:text-zinc-200" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Original language</h3>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {originalLanguageOptions.map((lang) => {
              const selected = filters.originalLanguages.includes(lang);
              const label =
                lang === "english" ? "Originally English" : lang === "translated" ? "Translated" : "Either";
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleOriginalLanguage(lang)}
                  aria-pressed={selected}
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    selected
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-300"
                      : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Empty = Any.</p>
        </div>

        {/* Mood / Tone (multi-select) */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Mood / Tone</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {moodOptions.map((mood) => {
              const selected = filters.moods.includes(mood);
              return (
                <button
                  key={mood}
                  type="button"
                  onClick={() => toggleMood(mood)}
                  aria-pressed={selected}
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    selected
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-300"
                      : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900",
                  ].join(" ")}
                >
                  {mood}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Select multiple (empty = Any).</p>
        </div>

        {/* Discussion potential (toggle) */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Discussion potential</h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {discussionOptions.map((opt) => {
              const selected = filters.discussionPotential === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDiscussionPotential(opt.value)}
                  aria-pressed={selected}
                  className={[
                    "rounded-xl border px-2 py-2 text-xs font-medium transition",
                    selected
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-300"
                      : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            High = controversial / complex, Low = light entertainment.
          </p>
        </div>
      </div>
    </section>
  );
}

