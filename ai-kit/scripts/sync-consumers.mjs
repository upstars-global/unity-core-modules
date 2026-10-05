// sync-consumers — points the applications at a new release of unity-core-modules: the pin in
// package.json and the three lines yarn writes into yarn.lock for a git dependency.
//
// This exists because doing it by hand is three files of fiddly edits per release, and because
// getting the lock wrong is invisible until someone's install resolves a different commit.
//
// It refuses to touch the lock when the package's own dependencies changed between the two
// versions: yarn rewrites more than three lines then, and guessing would corrupt the file.
//
// CLI (run from the unity-core-modules checkout, or pass --core):
//   node ai-kit/scripts/sync-consumers.mjs --version v1.112.0
//   node ai-kit/scripts/sync-consumers.mjs --latest
//   node ai-kit/scripts/sync-consumers.mjs --latest --apps ../frontera ../king-front
//   node ai-kit/scripts/sync-consumers.mjs --latest --dry-run
//
// Always run `yarn install` in each application afterwards: it confirms the lock resolves, and
// it is the only thing that can prove this script guessed right.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const PACKAGE = "unity-core-modules";

function git (cwd, args, fallback = "") {
    try {
        return execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }).trim();
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

const dryRun = process.argv.includes("--dry-run");
const core = resolve(arg("core", process.cwd()));

if (!existsSync(join(core, ".git")) || basename(core) !== PACKAGE) {
    process.stderr.write(`--core must point at a ${ PACKAGE } checkout (got ${ core })\n`);
    process.exit(1);
}

const version = process.argv.includes("--latest")
    ? git(core, [ "tag", "--list", "v*", "--sort=-v:refname" ]).split("\n")[0]
    : arg("version");

if (!/^v\d+\.\d+\.\d+$/.test(version)) {
    process.stderr.write("pass --version vX.Y.Z or --latest (and fetch tags first)\n");
    process.exit(1);
}

const sha = git(core, [ "rev-parse", `${ version }^{commit}` ]);
if (!/^[0-9a-f]{40}$/.test(sha)) {
    process.stderr.write(`tag ${ version } not found in ${ core } — git fetch --tags first\n`);
    process.exit(1);
}

const apps = (argList("apps").length > 0 ? argList("apps") : [ "../frontera", "../king-front" ])
    .map((path) => resolve(core, path))
    .filter((path) => existsSync(join(path, "package.json")));

if (apps.length === 0) {
    process.stderr.write("no application checkouts found; pass --apps <path> <path>\n");
    process.exit(1);
}

// yarn's own dependency block for the entry only changes when the package's dependencies do.
function dependenciesChanged (fromVersion) {
    const at = (ref) => {
        try {
            return JSON.stringify(JSON.parse(git(core, [ "show", `${ ref }:package.json` ], "{}")).dependencies ?? {});
        } catch {
            return null;
        }
    };

    const before = at(fromVersion);
    const after = at(version);

    return before === null || after === null ? null : before !== after;
}

const report = [ `${ PACKAGE } ${ version } (${ sha.slice(0, 9) })`, "" ];

for (const app of apps) {
    const name = basename(app);
    const pkgPath = join(app, "package.json");
    const lockPath = join(app, "yarn.lock");
    const pkg = readFileSync(pkgPath, "utf8");
    const current = (new RegExp(`"${ PACKAGE }": "([^"]+)"`).exec(pkg) ?? [])[1];

    if (!current) {
        report.push(`${ name }: does not depend on ${ PACKAGE } — skipped`);
        continue;
    }

    const currentVersion = (/#(v\d+\.\d+\.\d+)$/.exec(current) ?? [])[1];

    if (currentVersion === version) {
        report.push(`${ name }: already at ${ version }`);
        continue;
    }

    const changed = currentVersion ? dependenciesChanged(currentVersion) : null;
    const lock = existsSync(lockPath) ? readFileSync(lockPath, "utf8") : "";
    const entry = new RegExp(
        `${ PACKAGE }@[^\\n]*#${ currentVersion?.replace(/\./g, "\\.") }:\\n  version "[^"]+"\\n  resolved "[^"]+"`,
    );

    if (!dryRun) {
        writeFileSync(pkgPath, pkg.replace(`#${ currentVersion }"`, `#${ version }"`));
    }
    report.push(`${ name }: ${ currentVersion } -> ${ version } in package.json`);

    if (changed === true) {
        report.push(
            "    yarn.lock NOT touched: the package's dependencies changed between these versions,",
            "    so yarn rewrites more than the three lines this script knows about. Run yarn install.",
        );
        continue;
    }

    if (!entry.test(lock)) {
        report.push(
            "    yarn.lock NOT touched: its entry is not in the shape this script expects.",
            "    Run yarn install and commit whatever it writes.",
        );
        continue;
    }

    if (!dryRun) {
        writeFileSync(lockPath, lock.replace(entry, (match) => match
            .replace(`#${ currentVersion }:`, `#${ version }:`)
            .replace(/version "[^"]+"/, `version "${ version.slice(1) }"`)
            .replace(/resolved "[^"]+"/, `resolved "https://codeload.github.com/upstars-global/${ PACKAGE }/tar.gz/${ sha }"`)));
    }
    report.push("    yarn.lock entry updated (key, version, resolved commit)");
}

report.push(
    "",
    dryRun ? "dry run — nothing written." : "Now run yarn install in each application and commit the result.",
    "If yarn rewrites the lock further, that rewrite is the truth — keep it.",
);

process.stdout.write(`${ report.join("\n") }\n`);
