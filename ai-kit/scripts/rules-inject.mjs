// rules-inject — SessionStart hook. Prints the index of shared rules so the assistant knows
// what exists and where, without any rule file being read until it is needed.
//
// Deliberately cheap: descriptions and paths only. The full text of a rule is read on demand.
// This is the always-on cost of the toolkit, so keep it short when adding rules.
//
// CLI:
//   node ai-kit/scripts/rules-inject.mjs

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { appliesToRole, PACKAGE_IN_NODE_MODULES, PLUGIN_DIR, readRules, relativeFromCwd, repoRole } from "./rules.mjs";

function manifestVersion (dir) {
    try {
        return JSON.parse(readFileSync(join(dir, ".claude-plugin", "plugin.json"), "utf8")).version ?? null;
    } catch {
        return null;
    }
}

// The toolkit arrives through two channels that move independently: the plugin follows the
// marketplace (the repository's default branch), and node_modules follows the pinned tag. When
// they disagree, something silently does not work — a skill referencing a script the pin does not
// have, or AGENTS.md pointing at rule files that are not installed. Claude Code exposes no
// "update available" signal to a hook, but this drift is visible locally, so say it out loud.
function driftWarning (role) {
    if (role !== "app") {
        return null;
    }

    const pinnedPlugin = join(process.cwd(), PACKAGE_IN_NODE_MODULES, "ai-kit");

    if (!existsSync(pinnedPlugin)) {
        return "The unity-core-modules pin in this repository predates ai-kit, so anything the repo"
            + " runs itself (yarn ai:agents-md, the rule paths in AGENTS.md) is missing. Bump the pin.";
    }

    const installed = manifestVersion(PLUGIN_DIR);
    const pinned = manifestVersion(pinnedPlugin);

    if (installed && pinned && installed !== pinned) {
        return `unity-ai ${ installed } is loaded from the marketplace, but the pinned copy in`
            + ` node_modules is ${ pinned }. Whichever is older is the stale one: bump the pin, or`
            + " refresh the plugin with /plugin marketplace update unity.";
    }

    return null;
}

const role = repoRole();
const rules = readRules().filter((rule) => appliesToRole(rule, role));
const drift = driftWarning(role);

if (rules.length === 0 && !drift) {
    process.exit(0);
}

// Every line here is paid for by every session in every repository, so it is one header line
// plus one line per rule. The bodies are read on demand.
const lines = [
    `unity-ai ${ manifestVersion(PLUGIN_DIR) ?? "unknown" } · toolkit <${ relativeFromCwd(PLUGIN_DIR) }> · role ${ role }.`
        + " Read the rule for the area you change; repository-local docs win. Scripts run as"
        + " `node scripts/ai.mjs <name>`.",
    ...rules.map((rule) => `- ${ relativeFromCwd(rule.path) } — ${ rule.description }`),
];

if (drift) {
    lines.push("", `unity-ai version drift: ${ drift }`);
}

process.stdout.write(`${ lines.join("\n") }\n`);
