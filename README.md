# MCP File Search Server

An MCP (Model Context Protocol) server that provides a tool to search for keywords in UTF-8 text files with line/column positions and contextual previews.

## Installation

```bash
npm install
```

## Running

```bash
# Development mode
npm run dev

# Build and run
npm run build
npm start
```

## Testing with MCP Inspector

```bash
npm run inspector:dev
```

Open http://localhost:6274 and use the `search_keyword_in_file` tool with:
- `filePath`: Path to a text file
- `keyword`: Keyword to search for
- `caseSensitive` (optional): Defaults to false
- `contextLines` (optional): Number of context lines (0-5), defaults to 1

## Testing

```bash
npm test
```

