export interface Match {
  line: number;
  column: number;
  preview: string;
}

export interface SearchParams {
  text: string;
  keyword: string;
  caseSensitive?: boolean;
  contextLines?: number;
}

export interface SearchResult {
  matchCount: number;
  matches: Match[];
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function searchInText({
  text,
  keyword,
  caseSensitive = false,
  contextLines = 1,
}: SearchParams): SearchResult {
  if (!keyword?.length) {
    return { matchCount: 0, matches: [] };
  }

  const lines = text.split(/\r?\n/);
  const needle = caseSensitive ? keyword : keyword.toLowerCase();

  const matches: Match[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const hay = caseSensitive ? raw : raw.toLowerCase();

    let idx = hay.indexOf(needle);
    while (idx !== -1) {
      const start = clamp(i - contextLines, 0, lines.length - 1);
      const end = clamp(i + contextLines, 0, lines.length - 1);
      const preview = lines.slice(start, end + 1).join("\n");

      matches.push({
        line: i + 1,
        column: idx + 1,
        preview,
      });

      const nextFrom = idx + Math.max(needle.length, 1);
      idx = hay.indexOf(needle, nextFrom);
    }
  }

  return { matchCount: matches.length, matches };
}

