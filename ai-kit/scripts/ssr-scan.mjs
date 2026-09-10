// ssr-scan — greps the diff for the browser APIs that actually cause hydration bugs, so the
// ssr-safety agent spends its tokens reading the handful of files that might be a problem instead
// of every changed file. No AI, no network.
//
// This is a heuristic, not a verdict: it does not parse scope, so a hit inside `onMounted` next to
// a hit at module scope look the same to it. `guarded: true` means a guard keyword appears near the
// hit, not that the code is provably safe — the agent (or a human) still has to read the file. What
// this script removes is the need to read files that have zero hits at all, which on a typical diff
// is most of them.
//
// CLI:
//   node ai-kit/scripts/ssr-scan.mjs                # human-readable report
//   node ai-kit/scripts/ssr-scan.mjs --json          # same facts as JSON, for an agent
//   node ai-kit/scripts/ssr-scan.mjs --base master   # override the base branch
//   node ai-kit/scripts/ssr-scan.mjs --working       # include uncommitted changes

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

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

const untracked = flags.working ? untrackedFiles() : new Set();

// Untracked files never show up in `git diff ... -- path`, no matter what it is diffed against —
// git only diffs what it already knows about. They need a full-file "everything is added" path
// instead of a hunk parse.
function untrackedFiles () {
    return new Set(git([ "ls-files", "--others", "--exclude-standard" ]).split("\n").filter(Boolean));
}

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

// Lines actually touched by this change, per file — a hit outside these lines is pre-existing code,
// not something this diff introduced, and belongs to whoever's audit covered it already.
function addedLineNumbers (path) {
    if (untracked.has(path)) {
        const total = readFileSync(path, "utf8").split("\n").length;

        return new Set(Array.from({ length: total }, (_, index) => index + 1));
    }

    const numbers = new Set();
    const collect = (diffArgs) => {
        let current = 0;
        for (const line of git(diffArgs).split("\n")) {
            const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)/.exec(line);
            if (hunk) {
                current = Number(hunk[1]);
                continue;
            }
            if (line.startsWith("+") && !line.startsWith("+++")) {
                numbers.add(current);
                current += 1;
            } else if (!line.startsWith("-") && !line.startsWith("\\")) {
                current += 1;
            }
        }
    };

    if (range) {
        collect([ "diff", "-U0", range, "--", path ]);
    }
    if (flags.working) {
        collect([ "diff", "-U0", "HEAD", "--", path ]);
    }

    return numbers;
}

// path:line, what it looks for, how bad it is when it is really unguarded.
const CHECKS = [
    { api: "window", pattern: /\bwindow\b/ },
    { api: "document", pattern: /\bdocument\s*\./ },
    { api: "localStorage", pattern: /\blocalStorage\b/ },
    { api: "sessionStorage", pattern: /\bsessionStorage\b/ },
    { api: "navigator", pattern: /\bnavigator\s*\./ },
    { api: "matchMedia", pattern: /\bmatchMedia\s*\(/ },
    { api: "Date.now/random", pattern: /\bDate\.now\s*\(\)|\bMath\.random\s*\(\)/ },
];

// Anything in this list nearby is a reason to trust the code already thought about the environment.
// Presence does not prove the *specific* hit below is inside the guard's scope — that is exactly
// what the agent (or a human) still has to confirm.
const GUARD = /typeof\s+window|typeof\s+document|process\.client|process\.server|import\.meta\.client|import\.meta\.env\.SSR|isServer|isClient|ClientOnly|onMounted|onBeforeMount|nextTick\s*\(/;

function scanFile (path) {
    if (!existsSync(path)) {
        return [];
    }

    const added = addedLineNumbers(path);
    if (added.size === 0) {
        return [];
    }

    const lines = readFileSync(path, "utf8").split("\n");
    const hits = [];

    for (const lineNo of added) {
        const text = lines[lineNo - 1];
        if (text === undefined) {
            continue;
        }

        for (const { api, pattern } of CHECKS) {
            if (!pattern.test(text)) {
                continue;
            }

            const contextStart = Math.max(0, lineNo - 8);
            const context = lines.slice(contextStart, lineNo).join("\n");

            hits.push({ path, line: lineNo, api, text: text.trim(), guarded: GUARD.test(context) || GUARD.test(text) });
        }
    }

    return hits;
}

const files = changedFiles();
const hits = files.flatMap(scanFile);
const clean = files.filter((path) => !hits.some((hit) => hit.path === path));

const result = { base, mergeBase: mergeBase || null, filesScanned: files.length, hits, clean };

if (flags.json) {
    process.stdout.write(`${ JSON.stringify(result, null, 2) }\n`);
    process.exit(0);
}

const out = [
    `files scanned   ${ result.filesScanned }`,
    `hits            ${ hits.length }`,
    "",
];

if (hits.length > 0) {
    out.push("candidate SSR hits (heuristic — verify guard scope by hand):");
    for (const hit of hits) {
        out.push(`  ${ hit.guarded ? "guarded?" : "unguarded" }  ${ hit.path }:${ hit.line }  [${ hit.api }]  ${ hit.text }`);
    }
    out.push("");
}

out.push(`files with no hit, added lines only (${ clean.length }) — skip unless points 3-5 of the rule apply:`);
clean.forEach((path) => out.push(`  ${ path }`));

process.stdout.write(`${ out.join("\n") }\n`);
