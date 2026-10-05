---
description: Index this repository and open the code graph UI (calls, imports, usages).
---

Start the code graph UI for the current repository.

1. Run `node scripts/ai.mjs graph-ui` with the Bash tool and `run_in_background: true`. It indexes
   the repository, starts the server and opens the browser; it keeps running until stopped, so never
   run it in the foreground.
2. Read its output after a few seconds. If it says `codebase-memory-mcp not found`, tell the user to
   run `yarn add -D codebase-memory-mcp` and stop.
3. Report the URL (`http://localhost:9749/`, or the port from `GRAPH_UI_PORT`) and say that the
   server stops when the background task is stopped.

If the output says the UI is already running, just report the URL.
