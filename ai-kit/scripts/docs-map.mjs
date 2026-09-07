// docs-map — the deterministic core of the knowledge vault: which source a page documents, whether
// that page is still true, what is missing, and what is worth documenting first. No AI, no network.
//
// Freshness is a hash of the source, not its mtime: mtime changes on every install and checkout and
// would declare half the vault stale for no reason.
//
// Pages live in knowledge/<package>/<category>/<Name>.md and carry frontmatter:
//   source: packages/front-ss/src/modules/Cashbox/Cashbox.vue
//   source_hash: 1f3c9ab27e40
//   updated: 2026-09-07
//
// CLI:
//   node .../docs-map.mjs --find Cashbox              # page for an entity, and its status
//   node .../docs-map.mjs --find packages/.../x.ts
//   node .../docs-map.mjs --pending [--base master]   # changed sources whose page is missing or stale
//   node .../docs-map.mjs --lint                      # broken links, orphans, stale, collisions
//   node .../docs-map.mjs --rehash [--all]            # stamp source_hash after editing pages
//   node .../docs-map.mjs --build-index               # rebuild knowledge/index.md
//   node .../docs-map.mjs --hotpath [--top 40] [--months 6]
//   ... --json

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";

export const VAULT = "knowledge";

function git (args, fallback = "") {
    try {
        return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
    } catch {
        return fallback;
    }
}

function arg (name, fallback = "") {
    const index = process.argv.indexOf(`--${ name }`);

    return index !== -1 && process.argv[index + 1] && !process.argv[index + 1].startsWith("--")
        ? process.argv[index + 1]
        : fallback;
}

// What deserves a page. Order matters: the first match wins. Anything not listed here is not
// documented — tests, types, styles, assets, translation messages and barrels included.
const RULES = [
    { test: /^packages\/([^/]+)\/src\/(components|ui)\//, category: "components" },
    { test: /^packages\/([^/]+)\/src\/(modules|views|layouts)\//, category: "modules" },
    { test: /^packages\/([^/]+)\/src\/stores?\//, category: "stores" },
    { test: /^packages\/([^/]+)\/src\/services\//, category: "services" },
    { test: /^packages\/([^/]+)\/src\/(helpers|hooks|mixins)\//, category: "helpers" },
    { test: /^packages\/([^/]+)\/src\/controllers\//, category: "controllers" },
    { test: /^packages\/([^/]+)\/src\/(config|configs|plugins)\//, category: "configs" },
    { test: /^packages\/([^/]+)\/(modules|helpers|controllers|mixins)\//, category: "shared" },
    { test: /^packages\/([^/]+)\/(routes|middlewares)\//, category: "server" },
    { test: /^src\/(store|services|models|helpers|controllers|plugins|consts)\//, category: "core" },
];

// Not runtime code of the product: a storybook host and the translation pipeline document
// themselves through their own readmes.
const SKIP = /(\.(test|spec)\.[a-z]+$)|(\.d\.ts$)|(^|\/)(tests?|__tests__|__mocks__|node_modules)\/|^packages\/(storybook-ss|i18n)\//;

export function documentable (path) {
    return !SKIP.test(path) && /\.(ts|js|mjs|vue)$/.test(path) && RULES.some((rule) => rule.test.test(path));
}

// A source maps to exactly one page, and the package is part of the path: front-ss and front-core
// both have a helpers directory, and their pages must not collide.
export function pageFor (path) {
    const rule = RULES.find((entry) => entry.test.test(path));
    if (!rule) {
        return null;
    }

    const match = rule.test.exec(path);
    const pkg = rule.category === "core" ? "core" : match[1];
    const name = basename(path).replace(/\.[a-z]+$/, "");
    const dir = basename(dirname(path));
    // index.ts inside a named folder documents the folder, not a file called index.
    const entity = /^index$/i.test(name) ? dir : name;

    return join(VAULT, pkg, rule.category, `${ entity }.md`);
}

function hashOf (path) {
    return existsSync(path)
        ? createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 12)
        : null;
}

function frontmatter (text) {
    const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
    if (!match) {
        return {};
    }

    const fields = {};
    for (const line of match[1].split("\n")) {
        const pair = /^([a-z_]+):\s*(.*)$/.exec(line.trim());
        if (pair) {
            fields[pair[1]] = pair[2].trim();
        }
    }

    return fields;
}

function pages () {
    if (!existsSync(VAULT)) {
        return [];
    }

    const found = [];
    const walk = (dir) => {
        for (const entry of readdirSync(dir)) {
            const path = join(dir, entry);
            if (statSync(path).isDirectory()) {
                walk(path);
            } else if (entry.endsWith(".md") && entry !== "index.md") {
                const text = readFileSync(path, "utf8");
                const meta = frontmatter(text);
                found.push({ path, meta, text, bytes: Buffer.byteLength(text) });
            }
        }
    };

    walk(VAULT);

    return found;
}

export function freshness (page) {
    if (!page.meta.source) {
        return "no-source";
    }
    if (!existsSync(page.meta.source)) {
        return "orphan";
    }
    if (!page.meta.source_hash) {
        return "unstamped";
    }

    return page.meta.source_hash === hashOf(page.meta.source) ? "ok" : "stale";
}

function statusOf (source) {
    const page = pageFor(source);
    if (!page || !existsSync(page)) {
        return { source, page, status: "no page" };
    }

    const text = readFileSync(page, "utf8");

    return { source, page, status: freshness({ path: page, meta: frontmatter(text), text }) };
}

function changedSources () {
    const base = arg("base") || git([ "symbolic-ref", "--short", "refs/remotes/origin/HEAD" ])
        || [ "origin/master", "origin/main" ].find((ref) => git([ "rev-parse", "--verify", "--quiet", ref ]))
        || "";
    const mergeBase = base ? git([ "merge-base", "HEAD", base ]) : "";
    const files = mergeBase ? git([ "diff", "--name-only", `${ mergeBase }..HEAD` ]).split("\n") : [];

    if (process.argv.includes("working")) {
        files.push(...git([ "diff", "--name-only", "HEAD" ]).split("\n"));
    }

    return { base, files: [ ...new Set(files.filter(documentable)) ] };
}

const json = process.argv.includes("--json");
const write = (value, lines) => process.stdout.write(json ? `${ JSON.stringify(value, null, 2) }\n` : `${ lines.join("\n") }\n`);

// --find: the question a reader asks — is there a page for this, and can I trust it?
if (process.argv.includes("--find")) {
    const needle = arg("find");
    // By path, or by the name the page would carry — which for a folder-per-entity module is the
    // folder name, not the file name. "Cashbox" has to find modules/Cashbox/index.ts.
    const candidates = needle.includes("/")
        ? [ needle ]
        : git([ "ls-files" ]).split("\n").filter((path) => {
            if (!documentable(path)) {
                return false;
            }

            const page = pageFor(path);

            return page !== null && basename(page).replace(/\.md$/, "").toLowerCase() === needle.toLowerCase();
        });

    const results = candidates.map(statusOf);

    if (results.length === 0) {
        write({ needle, results: [] }, [ `no documentable source matches "${ needle }"` ]);
        process.exit(0);
    }

    write({ needle, results }, results.map((result) => [
        result.source,
        `  page   ${ result.page }`,
        `  status ${ result.status }${ result.status === "ok" ? " — read the page instead of the source" : " — read the source, then refresh the page" }`,
    ].join("\n")));
    process.exit(0);
}

// --pending: the documentation debt of this branch.
if (process.argv.includes("--pending")) {
    const { base, files } = changedSources();
    const results = files.map(statusOf).filter((result) => result.status !== "ok");

    write({ base, results }, [
        `base ${ base || "unknown" } — ${ files.length } documentable file(s) changed, ${ results.length } need a page`,
        ...results.map((result) => `  ${ result.status.padEnd(9) } ${ result.source }\n             -> ${ result.page }`),
    ]);
    process.exit(0);
}

// --lint: everything that makes a vault untrustworthy.
if (process.argv.includes("--lint")) {
    const all = pages();
    const problems = [];
    const names = new Map();

    for (const page of all) {
        const state = freshness(page);
        if (state !== "ok") {
            problems.push(`${ state.padEnd(9) } ${ page.path }${ page.meta.source ? ` (source: ${ page.meta.source })` : "" }`);
        }
        if (page.bytes > 2048) {
            problems.push(`oversized ${ page.path } — ${ page.bytes } bytes; a page carries what the code cannot tell you, not a summary`);
        }

        const key = basename(page.path).toLowerCase();
        names.set(key, [ ...(names.get(key) ?? []), page.path ]);

        for (const [ , link ] of page.text.matchAll(/\[\[([^\]]+)\]\]/g)) {
            const target = all.some((candidate) => basename(candidate.path).replace(/\.md$/, "") === link);
            if (!target) {
                problems.push(`broken link [[${ link }]] in ${ page.path }`);
            }
        }
    }

    for (const [ key, paths ] of names) {
        if (paths.length > 1) {
            problems.push(`name collision ${ key }: ${ paths.join(", ") }`);
        }
    }

    write({ pages: all.length, problems }, [
        `${ all.length } page(s), ${ problems.length } problem(s)`,
        ...problems.map((problem) => `  ${ problem }`),
    ]);
    process.exit(problems.length > 0 ? 1 : 0);
}

// --rehash: stamp the current source hash, which is what makes a page count as fresh.
if (process.argv.includes("--rehash")) {
    const all = pages().filter((page) => page.meta.source && existsSync(page.meta.source));
    const target = process.argv.includes("--all") ? all : all.filter((page) => freshness(page) !== "ok");
    const done = [];

    for (const page of target) {
        const hash = hashOf(page.meta.source);
        const updated = page.text.replace(/^(---\r?\n[\s\S]*?)source_hash:.*$/m, `$1source_hash: ${ hash }`);
        const stamped = updated === page.text
            ? page.text.replace(/^---\r?\n/, `---\nsource_hash: ${ hash }\n`)
            : updated;
        writeFileSync(page.path, stamped.replace(/^(---\r?\n[\s\S]*?)updated:.*$/m, `$1updated: ${ new Date().toISOString().slice(0, 10) }`));
        done.push(page.path);
    }

    write({ stamped: done }, [ `stamped ${ done.length } page(s)`, ...done.map((path) => `  ${ path }`) ]);
    process.exit(0);
}

// --build-index: one place that lists what the vault covers.
if (process.argv.includes("--build-index")) {
    const all = pages().sort((a, b) => a.path.localeCompare(b.path));
    const grouped = new Map();

    for (const page of all) {
        const key = dirname(relative(VAULT, page.path));
        grouped.set(key, [ ...(grouped.get(key) ?? []), page ]);
    }

    const lines = [
        "# Knowledge index",
        "",
        "Generated by `docs-map.mjs --build-index`. A page carries what the code cannot tell you:",
        "invariants, contracts, gotchas, and why it is this way. Read the page before the source.",
        "",
    ];

    for (const [ group, groupPages ] of [ ...grouped ].sort()) {
        lines.push(`## ${ group }`, "");
        for (const page of groupPages) {
            const state = freshness(page);
            const name = basename(page.path).replace(/\.md$/, "");
            lines.push(`- [[${ name }]]${ state === "ok" ? "" : ` — ${ state }` } · \`${ page.meta.source ?? "no source" }\``);
        }
        lines.push("");
    }

    if (!json) {
        mkdirSync(VAULT, { recursive: true });
        writeFileSync(join(VAULT, "index.md"), `${ lines.join("\n") }\n`);
    }

    write({ pages: all.length }, [ `wrote ${ join(VAULT, "index.md") } — ${ all.length } page(s)` ]);
    process.exit(0);
}

// --hotpath: what to document first. Churn is the only honest ranking: the code that changes most
// is the code whose invariants are being rediscovered most often.
if (process.argv.includes("--hotpath")) {
    const months = Number(arg("months", "6"));
    const top = Number(arg("top", "40"));
    const since = `${ months } months ago`;
    const counts = new Map();

    for (const path of git([ "log", `--since=${ since }`, "--name-only", "--pretty=format:" ]).split("\n")) {
        if (path && documentable(path)) {
            counts.set(path, (counts.get(path) ?? 0) + 1);
        }
    }

    const ranked = [ ...counts ]
        .sort((a, b) => b[1] - a[1])
        .slice(0, top)
        .map(([ source, changes ]) => ({ ...statusOf(source), changes }));

    write({ months, ranked }, [
        `top ${ ranked.length } documentable sources by changes in the last ${ months } months`,
        ...ranked.map((row) => `  ${ String(row.changes).padStart(3) }  ${ row.status.padEnd(9) } ${ row.source }`),
    ]);
    process.exit(0);
}

process.stdout.write("nothing to do; pass --find, --pending, --lint, --rehash, --build-index or --hotpath\n");
