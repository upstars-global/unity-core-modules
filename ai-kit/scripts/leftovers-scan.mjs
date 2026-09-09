// leftovers-scan — the one item of the review rules ("Leftovers") that needs no judgement at all:
// debug logging, `debugger`, a TODO with no ticket to find it again, and the shape of a hardcoded
// secret. Regex over the diff's added lines. No AI, no network.
//
// A hit here is not automatically a finding — `console.error` in a catch block is often correct,
// and this script does not know the difference. It exists so the review agent spends its tokens
// judging the hits instead of hunting for them across every changed file.
//
// CLI:
//   node ai-kit/scripts/leftovers-scan.mjs                # human-readable report
//   node ai-kit/scripts/leftovers-scan.mjs --json          # same facts as JSON, for an agent
//   node ai-kit/scripts/leftovers-scan.mjs --base master   # override the base branch
//   node ai-kit/scripts/leftovers-scan.mjs --working       # include uncommitted changes

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

function git (args, fallback = "") {
    try {
        return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
    } catch {
        return fallback;
    }
}

function arg (name, fallback) {
    const index = process.argv.indexOf(`--${ name }`);

    return index !== -1 && process.argv[index + 1] && !process.argv[index + 1].startsWith("--")
        ? process.argv[index + 1]
        : fallback;
}

const flags = { json: process.argv.includes("--json"), working: process.argv.includes("--working") };

function defaultBranch () {
    const head = git([ "symbolic-ref", "--short", "refs/remotes/origin/HEAD" ]);
    if (head) {
        return head;
    }

    for (const candidate of [ "origin/master", "origin/main", "master", "main" ]) {
        if (git([ "rev-parse", "--verify", "--quiet", candidate ])) {
            return candidate;
        }
    }

    return "";
}

const base = arg("base", defaultBranch());
const mergeBase = base ? git([ "merge-base", "HEAD", base ]) : "";
const range = mergeBase ? `${ mergeBase }..HEAD` : "";

const SOURCE = /\.(vue|ts|tsx|js|jsx|mjs)$/;
const NOT_TEST = (path) => !/\.(spec|test)\./.test(path) && !/(^|\/)(tests?|__tests__)\//.test(path);

const CHECKS = [
    { kind: "debug-log", pattern: /\bconsole\.(log|debug)\s*\(/ },
    { kind: "debugger", pattern: /\bdebugger\s*;?/ },
    // A TODO/FIXME is fine when it names something to find it by later; the ticket-key shape
    // (UN-1234, ALPA-333) is what this repository's tickets look like.
    { kind: "todo-no-ticket", pattern: /\/\/\s*(TODO|FIXME)\b(?!.*\b[A-Z]{2,6}-\d+\b)/i },
    { kind: "commented-out", pattern: /^\s*\/\/\s*(const|let|var|function|import|export|if|for|while|return|await)\b/ },
    { kind: "possible-secret", pattern: /\b(api[_-]?key|secret|token|password)\s*[:=]\s*["'`][^"'`]{6,}["'`]/i },
    { kind: "possible-secret", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
];

// Untracked files never show up in `git diff ... -- path`, no matter what it is diffed against —
// git only diffs what it already knows about. They need a full-file "everything is added" path
// instead of a hunk parse.
function untrackedFiles () {
    return new Set(git([ "ls-files", "--others", "--exclude-standard" ]).split("\n").filter(Boolean));
}

const untracked = flags.working ? untrackedFiles() : new Set();

function changedFiles () {
    const seen = new Map();
    const add = (line) => {
        const parts = line.split("\t");
        const status = parts[0].trim()[0];
        const path = parts[parts.length - 1];
        if (path && !seen.has(path) && status !== "D") {
            seen.set(path, status);
        }
    };

    if (range) {
        git([ "diff", "--name-status", range ]).split("\n").filter(Boolean).forEach(add);
    }

    if (flags.working) {
        git([ "diff", "--name-status", "HEAD" ]).split("\n").filter(Boolean).forEach(add);
        untracked.forEach((path) => add(`A\t${ path }`));
    }

    return [ ...seen.keys() ].filter((path) => SOURCE.test(path) && NOT_TEST(path));
}

function matchLine (path, line, text, hits) {
    for (const { kind, pattern } of CHECKS) {
        if (pattern.test(text)) {
            hits.push({ path, line, kind, text: text.trim() });
        }
    }
}

function scanFile (path) {
    const hits = [];

    if (untracked.has(path)) {
        readFileSync(path, "utf8").split("\n").forEach((text, index) => matchLine(path, index + 1, text, hits));

        return hits;
    }

    const diffArgsList = [];
    if (range) {
        diffArgsList.push([ "diff", "-U0", range, "--", path ]);
    }
    if (flags.working) {
        diffArgsList.push([ "diff", "-U0", "HEAD", "--", path ]);
    }

    for (const diffArgs of diffArgsList) {
        let line = 0;
        for (const text of git(diffArgs).split("\n")) {
            const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)/.exec(text);
            if (hunk) {
                line = Number(hunk[1]);
                continue;
            }
            if (!text.startsWith("+") || text.startsWith("+++")) {
                continue;
            }

            matchLine(path, line, text.slice(1), hits);
            line += 1;
        }
    }

    return hits;
}

const files = changedFiles();
const hits = files.flatMap(scanFile);

const result = { base, mergeBase: mergeBase || null, filesScanned: files.length, hits };

if (flags.json) {
    process.stdout.write(`${ JSON.stringify(result, null, 2) }\n`);
    process.exit(0);
}

const out = [ `files scanned   ${ result.filesScanned }`, `hits            ${ hits.length }`, "" ];

if (hits.length === 0) {
    out.push("no leftovers matched — still a review agent's job to read the diff for the rest.");
} else {
    for (const hit of hits) {
        out.push(`  ${ hit.path }:${ hit.line }  [${ hit.kind }]  ${ hit.text }`);
    }
}

process.stdout.write(`${ out.join("\n") }\n`);
