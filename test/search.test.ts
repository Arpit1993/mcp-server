import { describe, it, expect } from "vitest";
import { searchInText } from "../src/search.js";

const TEXT = [
  "Roses are red.",
  "Violets are blue.",
  "MCP servers are cool.",
  "This demo will search this file for a keyword.",
  "Red rover, red rover.",
].join("\n");

describe("searchInText", () => {
  it("finds matches (case-insensitive)", () => {
    const r = searchInText({
      text: TEXT,
      keyword: "red",
      caseSensitive: false,
      contextLines: 1,
    });
    // Line 1 has 1 match, line 5 has 2 matches ("Red" and "red")
    expect(r.matchCount).toBe(3);
    expect(r.matches[0].line).toBe(1);
    expect(r.matches[1].line).toBe(5);
    expect(r.matches[2].line).toBe(5);
  });

  it("respects caseSensitive", () => {
    const r = searchInText({
      text: TEXT,
      keyword: "Red",
      caseSensitive: true,
      contextLines: 0,
    });
    expect(r.matchCount).toBe(1);
    expect(r.matches[0].line).toBe(5);
    expect(r.matches[0].column).toBe(1);
  });

  it("handles contextLines=0", () => {
    const r = searchInText({
      text: TEXT,
      keyword: "cool",
      caseSensitive: false,
      contextLines: 0,
    });
    expect(r.matchCount).toBe(1);
    expect(r.matches[0].preview).toBe("MCP servers are cool.");
  });

  it("returns zero for empty keyword", () => {
    const r = searchInText({ text: TEXT, keyword: "" });
    expect(r.matchCount).toBe(0);
    expect(r.matches).toHaveLength(0);
  });

  it("finds multiple matches per line", () => {
    const text = "red red red";
    const r = searchInText({
      text,
      keyword: "red",
      caseSensitive: false,
      contextLines: 0,
    });
    expect(r.matchCount).toBe(3);
    expect(r.matches[0].column).toBe(1);
    expect(r.matches[1].column).toBe(5);
    expect(r.matches[2].column).toBe(9);
  });

  it("handles contextLines at upper bound", () => {
    const r = searchInText({
      text: TEXT,
      keyword: "blue",
      caseSensitive: false,
      contextLines: 5,
    });
    expect(r.matchCount).toBe(1);
    // Preview should include all lines since contextLines is large
    expect(r.matches[0].preview.split("\n").length).toBeGreaterThan(1);
  });

  it("handles contextLines at file boundaries", () => {
    const r = searchInText({
      text: TEXT,
      keyword: "Roses",
      caseSensitive: false,
      contextLines: 2,
    });
    expect(r.matchCount).toBe(1);
    // First line with context should not go negative
    const previewLines = r.matches[0].preview.split("\n");
    expect(previewLines.length).toBeGreaterThan(0);
  });
});

