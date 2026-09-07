// selfcheck — probe that answers the three questions of the unity-ai distribution spike:
// did the plugin actually arrive, does ${CLAUDE_PLUGIN_ROOT} expand inside a hook,
// and is the repository root reachable from the installed plugin directory.
//
// The last one decides where deterministic scripts may live. Scripts that CI and husky
// call must be reachable as node_modules/unity-core-modules/scripts/ai/*, and that only
// works if the whole repository is materialised on install — not just the ai-kit folder.
//
// CLI:
//   node ai-kit/scripts/selfcheck.mjs           # full report
//   node ai-kit/scripts/selfcheck.mjs --hook    # one line, used by the SessionStart hook

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pluginDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function readJson (path) {
    try {
        return JSON.parse(readFileSync(path, "utf8"));
    } catch {
        return null;
    }
}

const plugin = readJson(join(pluginDir, ".claude-plugin", "plugin.json")) ?? {};
const version = plugin.version ?? "unknown";

if (process.argv.includes("--hook")) {
    process.stdout.write(`unity-ai ${ version } is loaded. Run /unity-ai:doctor to check the toolkit.\n`);
    process.exit(0);
}

const repoRoot = resolve(pluginDir, "..");
const repoPackage = readJson(join(repoRoot, "package.json"));
const repoLine = repoPackage
    ? `${ repoPackage.name }@${ repoPackage.version } at ${ repoRoot }`
    : "not reachable — every script must live inside the plugin";

const report = [
    `plugin              ${ plugin.name ?? "unity-ai" } ${ version }`,
    `plugin dir          ${ pluginDir }`,
    `CLAUDE_PLUGIN_ROOT  ${ process.env.CLAUDE_PLUGIN_ROOT ?? "not set (expected: it is defined for hooks, not for plain CLI runs)" }`,
    `repository root     ${ repoLine }`,
    `project dir         ${ process.env.CLAUDE_PROJECT_DIR ?? "not set" }`,
    `node                ${ process.version }`,
];

process.stdout.write(`${ report.join("\n") }\n`);
