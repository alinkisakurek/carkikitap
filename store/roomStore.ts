import { create } from "zustand";

export type Genre =
  | "Fiction"
  | "Sci-Fi"
  | "Mystery"
  | "Non-Fiction"
  | "Fantasy"
  | "Historical"
  | "Romance"
  | "Horror"
  | "Thriller"
  | "Biography"
  | "Self-Help"
  | "Graphic Novel";

// PRD 2.2: Under 200 / 200–350 / 350–500 / 500+ (or Any)
export type PageCountFilter = "any" | "under_200" | "200_350" | "350_500" | "500_plus";

// PRD 2.2: Light read / Moderate / Dense / Challenging (or Any)
export type ReadingPaceFilter = "any" | "light" | "moderate" | "dense";

// PRD 2.2: Pre-1950 / 1950–2000 / 2000–2015 / Last 5 years / Any
export type PublicationYearFilter = "any" | "pre_1950" | "1950_2000" | "2000_2015" | "last_5_years";

// PRD 2.2: Multi-select options
export type OriginalLanguageFilter = "english" | "translated" | "either";

export type MoodFilter =
  | "Uplifting"
  | "Dark"
  | "Humorous"
  | "Thought-provoking"
  | "Adventurous"
  | "Romantic";

// PRD 2.2: Toggle (High / Low) (or Any)
export type DiscussionPotentialFilter = "any" | "high" | "low";

export interface RoomFilters {
  genres: Genre[];
  pageCount: PageCountFilter;
  readingPace: ReadingPaceFilter;
  publicationYear: PublicationYearFilter;
  originalLanguages: OriginalLanguageFilter[];
  moods: MoodFilter[];
  discussionPotential: DiscussionPotentialFilter;
}

export interface Book {
  title: string;
  author: string;
  year: number;
  page_count: number;
  isbn: string;
  hook: string;
  why_club: string;
}

interface RoomStore {
  roomId: string | null;
  displayName: string;
  filters: RoomFilters;
  books: Book[];
  isSpinning: boolean;
  winning_book_index: number | null;
  isBlindDateMode: boolean;

  setRoomId: (roomId: string | null) => void;
  setDisplayName: (displayName: string) => void;

  // Generic replace/update helper
  setFilters: (filters: RoomFilters) => void;
  patchFilters: (patch: Partial<RoomFilters>) => void;

  // Book wheel generation state
  setBooks: (books: Book[]) => void;
  setIsSpinning: (isSpinning: boolean) => void;
  setWinningBookIndex: (winning_book_index: number | null) => void;
  toggleBlindDateMode: () => void;

  // Convenience actions used by the FilterPanel
  toggleGenre: (genre: Genre) => void;
  setPageCount: (pageCount: PageCountFilter) => void;
  setReadingPace: (readingPace: ReadingPaceFilter) => void;
  setPublicationYear: (publicationYear: PublicationYearFilter) => void;
  toggleOriginalLanguage: (lang: OriginalLanguageFilter) => void;
  toggleMood: (mood: MoodFilter) => void;
  setDiscussionPotential: (discussionPotential: DiscussionPotentialFilter) => void;

  resetFilters: () => void;
}

const defaultFilters: RoomFilters = {
  genres: [],
  pageCount: "any",
  readingPace: "any",
  publicationYear: "any",
  originalLanguages: [],
  moods: [],
  discussionPotential: "any",
};

export const useRoomStore = create<RoomStore>((set, get) => ({
  roomId: null,
  displayName: "",
  filters: defaultFilters,
  books: [],
  isSpinning: false,
  winning_book_index: null,
  isBlindDateMode: false,

  setRoomId: (roomId) => set({ roomId }),
  setDisplayName: (displayName) => set({ displayName }),

  setFilters: (filters) => set({ filters }),
  patchFilters: (patch) => set({ filters: { ...get().filters, ...patch } }),

  setBooks: (books) => set({ books }),
  setIsSpinning: (isSpinning) => set({ isSpinning }),
  setWinningBookIndex: (winning_book_index) => set({ winning_book_index }),
  toggleBlindDateMode: () => set({ isBlindDateMode: !get().isBlindDateMode }),

  toggleGenre: (genre) => {
    const current = get().filters.genres;
    const next = current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre];
    set({ filters: { ...get().filters, genres: next } });
  },
  setPageCount: (pageCount) => set({ filters: { ...get().filters, pageCount } }),
  setReadingPace: (readingPace) => set({ filters: { ...get().filters, readingPace } }),
  setPublicationYear: (publicationYear) => set({ filters: { ...get().filters, publicationYear } }),
  toggleOriginalLanguage: (lang) => {
    const current = get().filters.originalLanguages;
    const next = current.includes(lang) ? current.filter((l) => l !== lang) : [...current, lang];
    set({ filters: { ...get().filters, originalLanguages: next } });
  },
  toggleMood: (mood) => {
    const current = get().filters.moods;
    const next = current.includes(mood) ? current.filter((m) => m !== mood) : [...current, mood];
    set({ filters: { ...get().filters, moods: next } });
  },
  setDiscussionPotential: (discussionPotential) =>
    set({ filters: { ...get().filters, discussionPotential } }),

  resetFilters: () => set({ filters: defaultFilters }),
}));

