import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Book, RoomFilters } from "@/store/roomStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pageCountToMaxPages(pageCount: RoomFilters["pageCount"]): number | null {
  switch (pageCount) {
    case "under_200":
      return 200;
    case "200_350":
      return 350;
    case "350_500":
      return 500;
    case "500_plus":
      // Gemini needs a numeric constraint; approximate "500+".
      return 800;
    case "any":
    default:
      return null;
  }
}

function publicationYearToBounds(publicationYear: RoomFilters["publicationYear"]): {
  published_after?: number;
  published_before?: number;
} {
  const nowYear = new Date().getFullYear();

  switch (publicationYear) {
    case "pre_1950":
      return { published_before: 1950 };
    case "1950_2000":
      return { published_after: 1950, published_before: 2000 };
    case "2000_2015":
      return { published_after: 2000, published_before: 2015 };
    case "last_5_years":
      return { published_after: nowYear - 5 };
    case "any":
    default:
      return {};
  }
}

function readingPaceToText(readingPace: RoomFilters["readingPace"]): string | null {
  switch (readingPace) {
    case "light":
      return "light read";
    case "moderate":
      return "moderate";
    case "dense":
      return "dense / challenging";
    case "any":
    default:
      return null;
  }
}

function normalizeJsonArray(text: string): unknown[] {
  // The PRD explicitly says "Return ONLY valid JSON", but models may still wrap in ```json.
  const cleaned = text
    .replace(/```(?:json)?/g, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Gemini response did not contain a JSON array.");
  }

  const jsonText = cleaned.slice(start, end + 1);
  const parsed = JSON.parse(jsonText) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("Gemini response JSON was not an array.");
  }

  return parsed;
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function toNumber(n: unknown): number | null {
  if (isFiniteNumber(n)) return n;
  if (typeof n === "string") {
    const parsed = Number(n);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function assertBook(raw: unknown): Book {
  if (!raw || typeof raw !== "object") {
    throw new Error("Book entry is not an object.");
  }

  const obj = raw as Record<string, unknown>;
  const title = obj.title;
  const author = obj.author;
  const isbn = obj.isbn;
  const hook = obj.hook;
  const why_club = obj.why_club;
  const year = toNumber(obj.year);
  const page_count = toNumber(obj.page_count);

  if (
    typeof title !== "string" ||
    typeof author !== "string" ||
    typeof isbn !== "string" ||
    typeof hook !== "string" ||
    typeof why_club !== "string" ||
    year === null ||
    page_count === null
  ) {
    throw new Error("Book entry does not match the required schema.");
  }

  return { title, author, year, page_count, isbn, hook, why_club };
}

function buildPrompt(filters: RoomFilters): string {
  const max_pages = pageCountToMaxPages(filters.pageCount) ?? undefined;
  const { published_after, published_before } = publicationYearToBounds(filters.publicationYear);

  const criteria: Record<string, unknown> = {
    genres: filters.genres.length ? filters.genres : undefined,
    max_pages,
    published_after,
    published_before,
    mood: filters.moods.length ? filters.moods : undefined,
    discussion_potential:
      filters.discussionPotential === "any" ? undefined : filters.discussionPotential,
    reading_pace: readingPaceToText(filters.readingPace),
    original_language:
      filters.originalLanguages.length === 0
        ? undefined
        : filters.originalLanguages.includes("either")
          ? ["Either"]
          : filters.originalLanguages.map((l) => (l === "english" ? "Originally English" : "Translated")),
  };

  const systemPrompt =
    "You are a literary curator for book clubs. Return ONLY valid JSON. " +
    "You MUST output a JSON array with 5-6 books. " +
    "Each array item MUST have exactly these keys: title, author, year, page_count, isbn, hook, why_club. " +
    "No extra text, no markdown, no trailing commas.";

  // PRD 2.3 prompt strategy: system + criteria + "Return JSON array"
  const userPrompt =
    `Suggest 5-6 books matching these criteria: ${JSON.stringify(criteria)} ` +
    `Return JSON array: [{title, author, year, page_count, isbn, hook, why_club}]`;

  return `${systemPrompt}\n\n${userPrompt}`;
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const maybeObj = body as Record<string, unknown>;
  const filters = maybeObj?.filters as RoomFilters | undefined;
  if (!filters) {
    return Response.json({ error: "Missing `filters` in request body." }, { status: 400 });
  }

  const apiKey =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GEMINI_API_KEY ??
    // Backward-compat with the earlier PRD template placeholder line.
    process.env.ANTHROPIC_API_KEY ??
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "Missing Gemini API key in env." }, { status: 500 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = buildPrompt(filters);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const rawArray = normalizeJsonArray(text);

    // Validate + coerce to our exact schema.
    const books = rawArray.map(assertBook);

    // MVP: be strict about count (but allow a little flexibility).
    const sliced = books.slice(0, 6);
    return Response.json(sliced);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error from Gemini.";
    return Response.json({ error: message }, { status: 500 });
  }
}

