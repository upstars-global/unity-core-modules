// rules-inject — SessionStart hook. Prints the index of shared rules so the assistant knows
// what exists and where, without any rule file being read until it is needed.
//
// Deliberately cheap: descriptions and paths only. The full text of a rule is read on demand.
// This is the always-on cost of the toolkit, so keep it short when adding rules.
//
// CLI:
//   node ai-kit/scripts/rules-inject.mjs

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { appliesToRole, PLUGIN_DIR, readRules, relativeFromCwd, repoRole } from "./rules.mjs";

function pluginVersion () {
    try {
        return JSON.parse(readFileSync(join(PLUGIN_DIR, ".claude-plugin", "plugin.json"), "utf8")).version ?? "unknown";
    } catch {
        return "unknown";
    }
}

const role = repoRole();
const rules = readRules().filter((rule) => appliesToRole(rule, role));

if (rules.length === 0) {
    process.exit(0);
}

const lines = [
    `unity-ai ${ pluginVersion() } — shared rules for this repository (role: ${ role }).`,
    "Read a rule file before working in its area; do not restate it back to the user.",
    "",
    ...rules.map((rule) => `- ${ relativeFromCwd(rule.path) } — ${ rule.description }`),
    "",
    "Repository-local instructions win over these when they disagree; say so when they do.",
];

process.stdout.write(`${ lines.join("\n") }\n`);
