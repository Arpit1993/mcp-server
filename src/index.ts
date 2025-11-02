import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { promises as fs } from "fs";
import * as path from "path";
import { searchInText } from "./search.js";

const server = new Server(
  {
    name: "file-search-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const inputSchema = z.object({
  filePath: z.string(),
  keyword: z.string().min(1, "keyword must not be empty"),
  caseSensitive: z.boolean().optional(),
  contextLines: z.number().int().min(0).max(5).optional(),
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_keyword_in_file",
        description:
          "Search a UTF-8 text file and return all matches with line/column and contextual preview.",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Path to the UTF-8 text file to search",
            },
            keyword: {
              type: "string",
              description: "The keyword to search for (must not be empty)",
            },
            caseSensitive: {
              type: "boolean",
              description: "Whether the search should be case-sensitive (default: false)",
            },
            contextLines: {
              type: "number",
              description: "Number of context lines before and after each match (0-5, default: 1)",
            },
          },
          required: ["filePath", "keyword"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "search_keyword_in_file") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const input = inputSchema.parse(request.params.arguments || {});
  const abs = path.resolve(input.filePath);

  let text: string;
  try {
    text = await fs.readFile(abs, "utf8");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Unable to read file at "${abs}": ${msg}`);
  }

  const result = searchInText({
    text,
    keyword: input.keyword,
    caseSensitive: input.caseSensitive ?? false,
    contextLines: input.contextLines ?? 1,
  });

  const structured = {
    file: abs,
    keyword: input.keyword,
    caseSensitive: input.caseSensitive ?? false,
    contextLines: input.contextLines ?? 1,
    matchCount: result.matchCount,
    matches: result.matches,
  };

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(structured, null, 2),
      },
    ],
    isError: false,
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP File Search Server running on stdio");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

