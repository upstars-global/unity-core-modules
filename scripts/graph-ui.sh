#!/usr/bin/env bash
# Index this repository with codebase-memory-mcp and open its graph UI
# (calls, imports, usages between functions and files).
set -euo pipefail

PORT="${GRAPH_UI_PORT:-9749}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
URL="http://localhost:${PORT}/"

# Prefer the pinned devDependency over a global install.
PATH="$REPO/node_modules/.bin:$PATH"
command -v codebase-memory-mcp >/dev/null || {
    echo "codebase-memory-mcp not found, run: npm install" >&2
    exit 1
}

echo "Indexing $REPO (the first run can take a couple of minutes)..."
codebase-memory-mcp cli index_repository --repo-path "$REPO" >/dev/null

if lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Graph UI already running: $URL"
    open "$URL" 2>/dev/null || xdg-open "$URL" 2>/dev/null || true
    exit 0
fi

echo "Graph UI: $URL (Ctrl+C to stop)"
# Open the browser once the server answers (startup takes a few seconds).
(
    for _ in $(seq 1 60); do
        curl -sf -o /dev/null "$URL" && break
        sleep 1
    done
    open "$URL" 2>/dev/null || xdg-open "$URL" 2>/dev/null || true
) &
# The MCP server serves the UI while stdin stays open.
tail -f /dev/null | codebase-memory-mcp --ui=true --port="$PORT"
