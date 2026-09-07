// budget — what this toolkit costs in context, split into the part every session pays for and
// the part that is only paid when something is actually used.
//
// The distinction is the whole design: skill and agent frontmatter is always loaded so the model
// can choose, while bodies, playbooks, rules and guides are read on demand. A new skill adds a
// line to the first number; a long playbook does not. Run this before and after adding something.
//
// Token counts are approximate (~4 characters per token) and meant for comparison, not billing.
//
// CLI:
//   node ai-kit/scripts/budget.mjs
//   node ai-kit/scripts/budget.mjs --json

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { PLUGIN_DIR } from "./rules.mjs";

const tokens = (text) => Math.round(text.length / 4);

function files (dir, match = /\.md$/) {
    if (!existsSync(dir)) {
        return [];
    }

    const found = [];
    const walk = (current) => {
        for (const entry of readdirSync(current)) {
            const path = join(current, entry);
            if (statSync(path).isDirectory()) {
                walk(path);
            } else if (match.test(entry)) {
                found.push(path);
            }
        }
    };

    walk(dir);

    return found;
}

// Only the frontmatter of a skill, agent or command is always in context.
function frontmatter (path) {
    const text = readFileSync(path, "utf8");
    const match = /^---\r?\n[\s\S]*?\r?\n---/.exec(text);

    return { head: match ? match[0] : "", body: match ? text.slice(match[0].length) : text };
}

const alwaysOn = [];
const onTrigger = [];

for (const [ label, dir ] of [ [ "skill", "skills" ], [ "agent", "agents" ], [ "command", "commands" ] ]) {
    for (const path of files(join(PLUGIN_DIR, dir))) {
        const name = relative(PLUGIN_DIR, path);
        const { head, body } = frontmatter(path);
        if (head) {
            alwaysOn.push({ what: `${ label } frontmatter`, name, chars: head.length });
        }
        if (body.trim()) {
            onTrigger.push({ what: `${ label } body`, name, chars: body.length });
        }
    }
}

for (const [ label, dir ] of [ [ "rule", "rules" ], [ "guide", "guides" ] ]) {
    for (const path of files(join(PLUGIN_DIR, dir))) {
        onTrigger.push({ what: label, name: relative(PLUGIN_DIR, path), chars: readFileSync(path, "utf8").length });
    }
}

// The SessionStart hook output is paid for verbatim by every session, so measure the real thing.
try {
    const output = execFileSync("node", [ join(PLUGIN_DIR, "scripts", "rules-inject.mjs") ], { encoding: "utf8" });
    alwaysOn.push({ what: "SessionStart output", name: "scripts/rules-inject.mjs", chars: output.length });
} catch {
    alwaysOn.push({ what: "SessionStart output", name: "scripts/rules-inject.mjs (failed to run)", chars: 0 });
}

const sum = (rows) => rows.reduce((total, row) => total + row.chars, 0);
const report = {
    alwaysOn: { chars: sum(alwaysOn), tokens: tokens("x".repeat(sum(alwaysOn))), rows: alwaysOn },
    onTrigger: { chars: sum(onTrigger), tokens: tokens("x".repeat(sum(onTrigger))), rows: onTrigger },
};

if (process.argv.includes("--json")) {
    process.stdout.write(`${ JSON.stringify(report, null, 2) }\n`);
    process.exit(0);
}

const table = (rows) => rows
    .slice()
    .sort((a, b) => b.chars - a.chars)
    .map((row) => `  ${ String(Math.round(row.chars / 4)).padStart(5) } tok  ${ row.what.padEnd(20) } ${ row.name }`)
    .join("\n");

process.stdout.write([
    `always-on — every session in every repository pays this: ~${ report.alwaysOn.tokens } tokens`,
    table(report.alwaysOn.rows),
    "",
    `on-trigger — read only when used: ~${ report.onTrigger.tokens } tokens across ${ onTrigger.length } files`,
    table(report.onTrigger.rows),
    "",
    "Keep the first number small: it is the price of the toolkit existing. The second number is",
    "the price of using it, and it is only paid by the session that needed it.",
    "",
].join("\n"));
