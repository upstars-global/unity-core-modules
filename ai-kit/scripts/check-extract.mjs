// check-extract — tells you whether a file from an application can move into unity-core-modules,
// and what has to happen first. Deterministic: it reads the file's imports and the library's own
// shape, nothing else.
//
// The library is not a second application. It has no components at all, and the project aliases
// it uses (@config, @theme, @helpers, @modules, @plugins, @controllers) are supplied by whichever
// application consumes it — inside the library those only resolve in tests, through the mocks in
// tests/mocks. Code that quietly depends on an application's build lands as a green MR and breaks
// the other twin.
//
// CLI (run from the application, pointing at the library checkout):
//   node .../check-extract.mjs --core ../unity-core-modules packages/front-ss/src/helpers/foo.ts
//   node .../check-extract.mjs --core ../unity-core-modules --json <files...>

import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

function arg (name, fallback = "") {
    const index = process.argv.indexOf(`--${ name }`);

    return index !== -1 && process.argv[index + 1] && !process.argv[index + 1].startsWith("--")
        ? process.argv[index + 1]
        : fallback;
}

const core = resolve(arg("core", "../unity-core-modules"));
const files = process.argv.slice(2).filter((value) => !value.startsWith("--") && value !== arg("core"));

if (!existsSync(join(core, "src"))) {
    process.stderr.write(`--core does not look like a unity-core-modules checkout: ${ core }\n`);
    process.exit(1);
}

if (files.length === 0) {
    process.stderr.write("pass one or more files to check\n");
    process.exit(1);
}

// Aliases the library only resolves through its test mocks.
const MOCKED_ALIASES = [ "@config", "@controllers", "@helpers", "@modules", "@plugins", "@theme" ];
const mockAvailable = (alias) => existsSync(join(core, "tests/mocks", alias.slice(1)));

// Where the library keeps what kind of code — used to suggest a destination.
const DESTINATIONS = [
    [ /store|pinia|defineStore/i, "src/store" ],
    [ /services?\/api|request|http/i, "src/services/api" ],
    [ /services?/i, "src/services" ],
    [ /models?|dto|enums?/i, "src/models" ],
    [ /controllers?/i, "src/controllers" ],
    [ /consts?|constants?/i, "src/consts" ],
];

function checkOne (file) {
    const findings = [];
    const notes = [];

    if (!existsSync(file)) {
        return { file, blocked: true, findings: [ "file not found" ], notes };
    }

    if (file.endsWith(".vue")) {
        findings.push(
            "components cannot go into unity-core-modules: the library ships zero .vue files."
            + " A component shared by both applications belongs in packages/front-core.",
        );
    }

    const source = readFileSync(file, "utf8");
    const imports = [ ...source.matchAll(/from\s*["']([^"']+)["']/g) ].map((match) => match[1]);

    for (const alias of MOCKED_ALIASES) {
        if (imports.some((path) => path === alias || path.startsWith(`${ alias }/`))) {
            notes.push(mockAvailable(alias)
                ? `imports ${ alias } — the application provides it at build time and tests/mocks/${ alias.slice(1) } covers it in the library`
                : `imports ${ alias } — no mock in the library's tests/mocks, so its tests will not run until you add one`);
        }
    }

    const appOnly = imports.filter((path) => /^@(ui|views|layouts|components|mixins|hooks|assets|filters|api|store|src|front\/core)(\/|$)/.test(path));
    if (appOnly.length > 0) {
        findings.push(`imports application-only paths that the library cannot resolve: ${ [ ...new Set(appOnly) ].join(", ") }`);
    }

    const relative = imports.filter((path) => path.startsWith("."));
    if (relative.length > 0) {
        notes.push(`${ relative.length } relative import(s) — each target either moves too or has to exist in the library: ${ relative.slice(0, 6).join(", ") }`);
    }

    // A test that stays behind stops covering the code.
    const name = basename(file).replace(/\.[a-z]+$/, "");
    const testCandidates = [
        file.replace(/\.([a-z]+)$/, ".test.$1"),
        join(file.split("/").slice(0, 2).join("/"), "tests/unit", ...file.split("/").slice(3, -1), `${ name }.test.ts`),
    ];
    notes.push(existsSync(testCandidates[0]) || existsSync(testCandidates[1])
        ? "a test exists for this file — move it as well, into the library's mirrored tests/ tree"
        : "no test found for this file — the library expects one; write it as part of the extraction");

    // Only worth suggesting when the move is possible at all.
    if (findings.length === 0) {
        const destination = DESTINATIONS.find(([ pattern ]) => pattern.test(file))?.[1] ?? "src/helpers";
        notes.push(`suggested destination: ${ destination }`);
    }

    return { file, blocked: findings.length > 0, findings, notes };
}

const results = files.map(checkOne);

if (process.argv.includes("--json")) {
    process.stdout.write(`${ JSON.stringify(results, null, 2) }\n`);
    process.exit(0);
}

const out = [];
for (const result of results) {
    out.push(`${ result.blocked ? "BLOCKED" : "ok" }  ${ result.file }`);
    result.findings.forEach((finding) => out.push(`    ! ${ finding }`));
    result.notes.forEach((note) => out.push(`    - ${ note }`));
}

out.push(
    "",
    "After moving: commit in the library with a conventional-commit type (feat for new shared",
    "behaviour, fix for a fix), let the release run, then point the applications at the new tag",
    "with sync-consumers.mjs. Both twins have to end up green, not just the one you were working in.",
);

process.stdout.write(`${ out.join("\n") }\n`);
