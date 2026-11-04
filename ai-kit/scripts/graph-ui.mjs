// graph-ui — indexes the current repository with codebase-memory-mcp and opens its graph UI
// (calls, imports, usages between functions and files).
//
// Works in any repository: the target is the working directory, not the toolkit's location.
// The binary is taken from the repository's node_modules/.bin first, then from PATH.
//
// Usage:
//   node scripts/ai.mjs graph-ui            # port from GRAPH_UI_PORT, default 9749

import { execFileSync, spawn } from "node:child_process";
import { join } from "node:path";

const BIN = "codebase-memory-mcp";
const port = process.env.GRAPH_UI_PORT ?? "9749";
const repo = process.cwd();
const url = `http://localhost:${ port }/`;

const env = { ...process.env, PATH: `${ join(repo, "node_modules/.bin") }:${ process.env.PATH ?? "" }` };

function run (cmd, args, options = {}) {
    return execFileSync(cmd, args, { env, stdio: "pipe", ...options });
}

function openBrowser () {
    const opener = process.platform === "darwin" ? "open" : "xdg-open";

    spawn(opener, [ url ], { stdio: "ignore", detached: true }).on("error", () => {}).unref();
}

async function isUp () {
    try {
        return (await fetch(url)).ok;
    } catch {
        return false;
    }
}

try {
    run("which", [ BIN ]);
} catch {
    console.error(`${ BIN } not found. Install it: yarn add -D ${ BIN }`);
    process.exit(1);
}

console.log(`Indexing ${ repo } (the first run can take a couple of minutes)...`);
run(BIN, [ "cli", "index_repository", "--repo-path", repo ]);

if (await isUp()) {
    console.log(`Graph UI already running: ${ url }`);
    openBrowser();
    process.exit(0);
}

console.log(`Graph UI: ${ url } (Ctrl+C to stop)`);

// The MCP server serves the UI while stdin stays open.
const server = spawn(BIN, [ "--ui=true", `--port=${ port }` ], { env, stdio: [ "pipe", "inherit", "inherit" ] });

server.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGINT", () => server.kill("SIGINT"));

for (let i = 0; i < 60; i++) {
    if (await isUp()) {
        openBrowser();
        break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
}
