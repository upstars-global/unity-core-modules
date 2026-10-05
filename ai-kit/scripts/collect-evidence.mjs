// collect-evidence — turns a branch into the facts every QA and review skill needs, with no AI
// and no network. Ticket key, base branch, changed files grouped by package and kind, the
// consumers of changed shared code, and suspected Jira components.
//
// The point is that none of this is judgement: it follows from git. Whatever a skill spends
// tokens on afterwards, it should not spend them on collecting this.
//
// CLI:
//   node ai-kit/scripts/collect-evidence.mjs                # human-readable report
//   node ai-kit/scripts/collect-evidence.mjs --json         # same facts as JSON, for an agent
//   node ai-kit/scripts/collect-evidence.mjs --base master  # override the base branch
//   node ai-kit/scripts/collect-evidence.mjs --working      # include uncommitted changes
//   node ai-kit/scripts/collect-evidence.mjs --no-consumers # skip the consumer search (faster)

import { execFileSync } from "node:child_process";

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

const flags = {
    json: process.argv.includes("--json"),
    working: process.argv.includes("--working"),
    consumers: !process.argv.includes("--no-consumers"),
};

const repoRoot = git([ "rev-parse", "--show-toplevel" ]);
const branch = git([ "rev-parse", "--abbrev-ref", "HEAD" ]);

// The twins disagree about the default branch (master here, main there), so ask git instead
// of assuming. Fall back to whichever branch actually exists.
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

// The branch name is where the ticket lives: UN-3195-something, ALPA-333.
const ticket = (/\b([A-Z]{2,6}-\d+)\b/.exec(branch) ?? [])[1] ?? null;

function changedFiles () {
    const seen = new Map();

    const add = (line) => {
        const parts = line.split("\t");
        const status = parts[0].trim()[0];
        const path = parts[parts.length - 1];
        if (path && !seen.has(path)) {
            seen.set(path, status);
        }
    };

    if (range) {
        git([ "diff", "--name-status", range ]).split("\n").filter(Boolean).forEach(add);
    }

    if (flags.working) {
        git([ "diff", "--name-status", "HEAD" ]).split("\n").filter(Boolean).forEach(add);
        git([ "ls-files", "--others", "--exclude-standard" ])
            .split("\n")
            .filter(Boolean)
            .forEach((path) => add(`A\t${ path }`));
    }

    return [ ...seen ].map(([ path, status ]) => ({ path, status }));
}

// Coarse but useful: what kind of thing changed decides what a tester has to open.
const KINDS = [
    { test: /(^|\/)(tests?|__tests__)\//, kind: "test" },
    { test: /\.(spec|test)\.[a-z]+$/, kind: "test" },
    { test: /(^|\/)components\//, kind: "component" },
    { test: /(^|\/)(views|pages|layouts)\//, kind: "view" },
    { test: /(^|\/)modules\//, kind: "module" },
    { test: /(^|\/)stores?\//, kind: "store" },
    { test: /(^|\/)services\//, kind: "service" },
    { test: /(^|\/)(helpers|hooks|mixins|controllers)\//, kind: "logic" },
    { test: /(^|\/)(router|routes)\//, kind: "routing" },
    { test: /(^|\/)(i18n|locales)\//, kind: "i18n" },
    { test: /(^|\/)(config|configs|plugins)\//, kind: "config" },
    { test: /(^|\/)server[-/]/, kind: "server" },
    { test: /(^|\/)(charts|gitlab-ci|scripts)\//, kind: "infra" },
    { test: /\.(ya?ml|sh)$|Dockerfile/, kind: "infra" },
    { test: /\.md$/, kind: "docs" },
];

function classify (path) {
    return KINDS.find((rule) => rule.test.test(path))?.kind ?? "other";
}

function workspace (path) {
    return (/^packages\/([^/]+)\//.exec(path) ?? [])[1] ?? "root";
}

// Anything shared: a change here is felt outside the file that changed.
function isShared (path) {
    return /^packages\/(front-core|server-core|i18n)\//.test(path) || /^src\//.test(path);
}

// Who imports the changed shared entity. Searched by directory or file name, because that is
// how these repositories import: by component folder or by module basename. Only source files
// are worth tracing — a changed Dockerfile has no importers, just a name that greps everywhere.
const TRACEABLE = /\.(ts|tsx|js|jsx|mjs|vue)$/;

function consumers (paths) {
    const found = {};

    for (const path of paths.filter((file) => isShared(file) && TRACEABLE.test(file)).slice(0, 25)) {
        const parts = path.split("/");
        const file = parts[parts.length - 1];
        const dir = parts[parts.length - 2];
        const needle = /^index\./.test(file) && dir ? dir : file.replace(/\.[a-z]+$/, "");

        // A needle that is a common word finds everything and tells nothing.
        if (!needle || needle.length < 4 || /^(index|types?|utils?|const|consts|helpers?|main|app)$/i.test(needle)) {
            continue;
        }

        const hits = git([ "grep", "-l", "--", needle ])
            .split("\n")
            .filter((hit) => hit && hit !== path && !/\.(spec|test)\./.test(hit) && !hit.endsWith(".map"));

        if (hits.length > 0) {
            found[path] = { needle, files: hits.slice(0, 12), total: hits.length };
        }
    }

    return found;
}

// Component and page names map onto the Jira components these projects actually use.
const JIRA_HINTS = [
    [ /cashbox|deposit|payment|withdraw/i, "Cashbox" ],
    [ /registration|signup/i, "Registration" ],
    [ /login|auth|logout/i, "Login" ],
    [ /profile|verification|limits/i, "Profile" ],
    [ /bonus|gift|promo/i, "Bonuses" ],
    [ /tournament|lottery|quest|mission|wheel/i, "Tournaments" ],
    [ /game|lobby|producer|jackpot|favorite/i, "Game" ],
    [ /banner|slider|winners/i, "Banners" ],
    [ /footer|header|menu|nav/i, "Menu" ],
    [ /seo|sitemap|meta/i, "SEO" ],
    [ /entry-server|ssr|hydrat/i, "SSR" ],
    [ /sw\.|serviceWorker|assetLoad|cache/i, "Cache" ],
    [ /i18n|locale|lokalise/i, "Localization" ],
    [ /gtm|metrik|analytics|pixel/i, "Google Analytics" ],
    [ /sentry|logger/i, "Sentry" ],
    [ /websocket|centrifuge/i, "Websockets" ],
    [ /notification|onesignal|webpush/i, "Notification" ],
    [ /search/i, "Search" ],
    [ /(^|\/)ui\/|ui-?kit/i, "UI Kit" ],
];

function jiraComponents (paths) {
    const hits = new Set();
    for (const path of paths) {
        for (const [ pattern, component ] of JIRA_HINTS) {
            if (pattern.test(path)) {
                hits.add(component);
            }
        }
    }

    return [ ...hits ].sort();
}

function tally (paths, pick) {
    const map = new Map();
    for (const path of paths) {
        const key = pick(path);
        map.set(key, (map.get(key) ?? 0) + 1);
    }

    return Object.fromEntries([ ...map ].sort((a, b) => b[1] - a[1]));
}

const files = changedFiles();
const paths = files.map((file) => file.path);

const evidence = {
    repo: repoRoot.split("/").pop(),
    branch,
    ticket,
    base,
    mergeBase: mergeBase || null,
    commits: range ? git([ "log", "--oneline", range ]).split("\n").filter(Boolean) : [],
    counts: {
        files: files.length,
        byKind: tally(paths, classify),
        byWorkspace: tally(paths, workspace),
    },
    files: files.map((file) => ({ ...file, kind: classify(file.path), workspace: workspace(file.path) })),
    sharedChanged: paths.filter(isShared),
    consumers: flags.consumers ? consumers(paths) : {},
    jiraComponentHints: jiraComponents(paths),
    diffstat: range ? git([ "diff", "--shortstat", range ]) : "",
};

if (flags.json) {
    process.stdout.write(`${ JSON.stringify(evidence, null, 2) }\n`);
    process.exit(0);
}

const pairs = (counts) => Object.entries(counts).map(([ key, n ]) => `${ key }:${ n }`).join("  ");

const out = [
    `repo            ${ evidence.repo }`,
    `branch          ${ evidence.branch }`,
    `ticket          ${ evidence.ticket ?? "none in the branch name" }`,
    `base            ${ evidence.base }${ evidence.mergeBase ? ` (merge-base ${ evidence.mergeBase.slice(0, 9) })` : "" }`,
    `commits         ${ evidence.commits.length }`,
    `changed files   ${ evidence.counts.files }  ${ evidence.diffstat }`,
    "",
    `by kind         ${ pairs(evidence.counts.byKind) }`,
    `by workspace    ${ pairs(evidence.counts.byWorkspace) }`,
    `jira components ${ evidence.jiraComponentHints.join(", ") || "no hint" }`,
];

if (evidence.sharedChanged.length > 0) {
    out.push("", `shared code changed (${ evidence.sharedChanged.length }):`);
    evidence.sharedChanged.slice(0, 20).forEach((path) => out.push(`  ${ path }`));
}

const consumerEntries = Object.entries(evidence.consumers);
if (consumerEntries.length > 0) {
    out.push("", "consumers of changed shared code:");
    for (const [ path, hit ] of consumerEntries) {
        out.push(`  ${ path } -> ${ hit.total } file(s) mention "${ hit.needle }"`);
        hit.files.slice(0, 6).forEach((file) => out.push(`      ${ file }`));
    }
}

out.push("", "changed files:");
evidence.files.slice(0, 120).forEach((file) => out.push(`  ${ file.status } ${ file.kind.padEnd(9) } ${ file.path }`));
if (evidence.files.length > 120) {
    out.push(`  ... ${ evidence.files.length - 120 } more`);
}

process.stdout.write(`${ out.join("\n") }\n`);
