export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GoogleBooksVolumeInfo = {
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
};

type GoogleBooksResponse = {
  items?: Array<{
    volumeInfo?: GoogleBooksVolumeInfo;
  }>;
};

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const isbn = url.searchParams.get("isbn");
  const title = url.searchParams.get("title");

  if (!isbn && !title) {
    return Response.json(
      { error: "Provide either `isbn` or `title` query parameter." },
      { status: 400 },
    );
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Missing `GOOGLE_BOOKS_API_KEY` in env." }, { status: 500 });
  }

  const query = isbn ? `isbn:${isbn}` : `intitle:${title}`;

  const endpoint = new URL("https://www.googleapis.com/books/v1/volumes");
  endpoint.searchParams.set("q", query);
  endpoint.searchParams.set("maxResults", "1");
  endpoint.searchParams.set("key", apiKey);

  const res = await fetch(endpoint.toString(), { method: "GET" });
  if (!res.ok) {
    return Response.json(
      { error: "Google Books API request failed.", status: res.status },
      { status: res.status },
    );
  }

  const data = (await res.json()) as GoogleBooksResponse;

  const thumbnail =
    data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail ??
    data.items?.[0]?.volumeInfo?.imageLinks?.smallThumbnail ??
    null;

  return Response.json({ thumbnailUrl: thumbnail });
}

