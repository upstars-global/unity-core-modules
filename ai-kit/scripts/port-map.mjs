// port-map — an honest comparison of the twin applications, and a per-file verdict on whether a
// change can be carried across. No AI, no network: both repositories are on disk.
//
// The twins are ~90% the same code with different surroundings, and the surroundings are what
// break a port: different default branches, a different pin on the shared library, turbo in one
// of them, a guides directory whose name is spelled differently. A port that ignores that is
// exactly how a "simple cherry-pick" silently drops half a change.
//
// CLI:
//   node .../port-map.mjs                         # structural comparison
//   node .../port-map.mjs --commit HEAD           # verdict per file of that commit
//   node .../port-map.mjs --for a.ts b.vue        # verdict for these files
//   node .../port-map.mjs --twin ../king-front    # where the twin is (default: guessed sibling)
//   node .../port-map.mjs --json

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

function git (cwd, args, fallback = "") {
    try {
        return execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
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

function argList (name) {
    const index = process.argv.indexOf(`--${ name }`);
    if (index === -1) {
        return [];
    }

    const values = [];
    for (let i = index + 1; i < process.argv.length && !process.argv[i].startsWith("--"); i += 1) {
        values.push(process.argv[i]);
    }

    return values;
}

const here = git(process.cwd(), [ "rev-parse", "--show-toplevel" ], process.cwd());
const hereName = basename(here);

// The twin is a sibling checkout. Guessing beats requiring a config file nobody remembers to add.
const TWINS = { frontera: "king-front", "king-front": "frontera" };

function findTwin () {
    const explicit = arg("twin");
    if (explicit) {
        return resolve(here, explicit);
    }

    const expected = TWINS[hereName];
    if (!expected) {
        return "";
    }

    const sibling = resolve(here, "..", expected);

    return existsSync(join(sibling, ".git")) ? sibling : "";
}

const twin = findTwin();
if (!twin) {
    process.stderr.write(
        `no twin checkout found next to ${ hereName }; pass --twin <path>\n`
        + "expected a sibling directory named "
        + `${ TWINS[hereName] ?? "frontera or king-front" }\n`,
    );
    process.exit(1);
}

const twinName = basename(twin);

// Paths that are the same thing under a different name. The typo in king-front is real and
// pretending otherwise makes every port of a guide land in a new directory.
const RENAMES = [
    { from: "guides-md/", to: "guids-md/", when: `${ hereName }->${ twinName }` === "frontera->king-front" },
    { from: "guids-md/", to: "guides-md/", when: `${ hereName }->${ twinName }` === "king-front->frontera" },
];

function mapPath (path) {
    for (const rename of RENAMES) {
        if (rename.when && path.startsWith(rename.from)) {
            return { path: path.replace(rename.from, rename.to), renamed: true };
        }
    }

    return { path, renamed: false };
}

function hash (path) {
    return existsSync(path) ? createHash("sha256").update(readFileSync(path)).digest("hex") : null;
}

function pin (root) {
    try {
        const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

        return pkg.dependencies?.["unity-core-modules"] ?? "not pinned";
    } catch {
        return "unreadable";
    }
}

function defaultBranch (root) {
    return git(root, [ "symbolic-ref", "--short", "refs/remotes/origin/HEAD" ])
        || [ "origin/master", "origin/main" ].find((ref) => git(root, [ "rev-parse", "--verify", "--quiet", ref ]))
        || "unknown";
}

function packages (root) {
    const dir = join(root, "packages");

    return existsSync(dir)
        ? git(root, [ "ls-tree", "--name-only", "-d", "HEAD", "packages/" ]).split("\n").filter(Boolean).map((entry) => basename(entry))
        : [];
}

const structure = {
    here: { name: hereName, root: here, branch: git(here, [ "rev-parse", "--abbrev-ref", "HEAD" ]) },
    twin: { name: twinName, root: twin, branch: git(twin, [ "rev-parse", "--abbrev-ref", "HEAD" ]) },
    defaultBranch: { [hereName]: defaultBranch(here), [twinName]: defaultBranch(twin) },
    corePin: { [hereName]: pin(here), [twinName]: pin(twin) },
    packages: { [hereName]: packages(here), [twinName]: packages(twin) },
    markers: {},
};

// Presence of these decides whether a ported change will even make sense on the other side.
for (const marker of [ "turbo.json", "CLAUDE.md", "AGENTS.md", "docs/ai-context", "guides-md", "guids-md", ".gitlab-ci.yml", ".claude/settings.json" ]) {
    structure.markers[marker] = {
        [hereName]: existsSync(join(here, marker)),
        [twinName]: existsSync(join(twin, marker)),
    };
}

// Which files a change touches: either an explicit list or the files of a commit.
function subjectFiles () {
    const explicit = argList("for");
    if (explicit.length > 0) {
        return explicit;
    }

    const commit = arg("commit");
    if (!commit) {
        return [];
    }

    const range = commit.includes("..") ? commit : `${ commit }^..${ commit }`;

    return git(here, [ "diff", "--name-only", range ]).split("\n").filter(Boolean);
}

// The verdict is about the file, not about the change: identical files port cleanly, files that
// already differ need a human to decide, missing files mean the feature does not exist there.
function verdict (path) {
    const mapped = mapPath(path);
    const mine = hash(join(here, path));
    const theirs = hash(join(twin, mapped.path));

    if (mine === null) {
        // Whether the deletion still has to be mirrored, or the twin is already without it.
        return {
            path,
            twinPath: mapped.path,
            renamed: mapped.renamed,
            state: "deleted-here",
            twinStillHas: theirs !== null,
        };
    }

    if (theirs === null) {
        return { path, twinPath: mapped.path, renamed: mapped.renamed, state: "missing-in-twin" };
    }

    return {
        path,
        twinPath: mapped.path,
        renamed: mapped.renamed,
        state: mine === theirs ? "identical" : "differs",
    };
}

const files = subjectFiles().map(verdict);

if (process.argv.includes("--json")) {
    process.stdout.write(`${ JSON.stringify({ structure, files }, null, 2) }\n`);
    process.exit(0);
}

const out = [
    `here            ${ structure.here.name } (${ structure.here.branch })`,
    `twin            ${ structure.twin.name } (${ structure.twin.branch }) at ${ structure.twin.root }`,
    `default branch  ${ hereName }: ${ structure.defaultBranch[hereName] }   ${ twinName }: ${ structure.defaultBranch[twinName] }`,
    `core pin        ${ hereName }: ${ structure.corePin[hereName] }`,
    `                ${ twinName }: ${ structure.corePin[twinName] }`,
];

const onlyHere = structure.packages[hereName].filter((name) => !structure.packages[twinName].includes(name));
const onlyTwin = structure.packages[twinName].filter((name) => !structure.packages[hereName].includes(name));
out.push(
    `packages        ${ structure.packages[hereName].length } here, ${ structure.packages[twinName].length } in the twin`
    + `${ onlyHere.length || onlyTwin.length ? "" : " (same set)" }`,
);
if (onlyHere.length > 0) {
    out.push(`                only here: ${ onlyHere.join(", ") }`);
}
if (onlyTwin.length > 0) {
    out.push(`                only twin: ${ onlyTwin.join(", ") }`);
}

const asymmetric = Object.entries(structure.markers).filter(([ , v ]) => v[hereName] !== v[twinName]);
if (asymmetric.length > 0) {
    out.push("", "asymmetric surroundings — a port that assumes these exist on both sides is wrong:");
    for (const [ marker, value ] of asymmetric) {
        out.push(`  ${ marker.padEnd(22) } ${ hereName }: ${ value[hereName] ? "yes" : "no" }   ${ twinName }: ${ value[twinName] ? "yes" : "no" }`);
    }
}

if (files.length > 0) {
    const groups = {
        identical: "port cleanly — the file is byte-identical today",
        differs: "already differ — decide per hunk, do not overwrite",
        "missing-in-twin": "absent in the twin — the change brings a new file, or the feature does not exist there",
        "deleted-here": "deleted here — mirror the deletion deliberately",
    };

    out.push("", `files (${ files.length }):`);
    for (const [ state, caption ] of Object.entries(groups)) {
        const rows = files.filter((file) => file.state === state);
        if (rows.length === 0) {
            continue;
        }

        out.push("", `  ${ state } — ${ caption }`);
        for (const row of rows) {
            const note = row.state === "deleted-here"
                ? (row.twinStillHas ? "  (twin still has it)" : "  (already gone in the twin)")
                : "";
            out.push(`    ${ row.path }${ row.renamed ? ` -> ${ row.twinPath }` : "" }${ note }`);
        }
    }
} else {
    out.push("", "no files given; pass --commit <sha> or --for <paths> for a per-file verdict");
}

process.stdout.write(`${ out.join("\n") }\n`);
