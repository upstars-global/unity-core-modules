// routes-map — extracts the route table from the router source: URL, route name and the
// component module behind it. Deterministic, so no skill has to guess which page renders a file.
//
// This is what turns "modules/GameHall/LobbyPage/LobbyPage.vue changed" into "open / and /pokies",
// which is the only thing a manual tester actually needs from an impact analysis.
//
// The routers in these applications declare components as lazy consts
// (`const LobbyPage = () => import("@modules/.../LobbyPage.vue")`) and then reference them by
// name, so both halves are collected and joined.
//
// CLI:
//   node ai-kit/scripts/routes-map.mjs                       # the whole table
//   node ai-kit/scripts/routes-map.mjs --for <path> [<path>]  # routes that render these files
//   node ai-kit/scripts/routes-map.mjs --json
//   node ai-kit/scripts/routes-map.mjs --dir packages/front-ss/src/router

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function arg (name, fallback) {
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

const CANDIDATE_DIRS = [
    "packages/front-ss/src/router",
    "src/router",
];

function routerDir () {
    const explicit = arg("dir", "");
    if (explicit) {
        return explicit;
    }

    return CANDIDATE_DIRS.find((dir) => existsSync(dir)) ?? "";
}

function sourceFiles (dir) {
    const files = [];

    const walk = (current) => {
        for (const entry of readdirSync(current)) {
            const path = join(current, entry);
            if (statSync(path).isDirectory()) {
                walk(path);
            } else if (/\.(ts|js|mjs)$/.test(entry)) {
                files.push(path);
            }
        }
    };

    walk(dir);

    return files;
}

// Alias prefixes used by the applications, mapped to where the file actually lives.
const ALIASES = [
    [ /^@modules\//, "packages/front-ss/src/modules/" ],
    [ /^@layouts\//, "packages/front-ss/src/layouts/" ],
    [ /^@components\//, "packages/front-ss/src/components/" ],
    [ /^@views\//, "packages/front-ss/src/views/" ],
    [ /^@src\//, "packages/front-ss/src/" ],
    [ /^@front\/core\//, "packages/front-core/" ],
];

function resolveModule (specifier) {
    for (const [ pattern, replacement ] of ALIASES) {
        if (pattern.test(specifier)) {
            return specifier.replace(pattern, replacement);
        }
    }

    return specifier;
}

// `const Name = () => import("...")` and `const Name = () => { return import("..."); }`
const LAZY = /const\s+([A-Za-z_$][\w$]*)\s*=\s*\(\s*\)\s*=>\s*\{?\s*(?:return\s*)?import\(\s*["']([^"']+)["']/g;

// Static imports of components, also used for route components.
const STATIC = /import\s+([A-Za-z_$][\w$]*)\s+from\s*["']([^"']+\.vue)["']/g;

// One write, and a swallowed EPIPE: this output is meant to be piped into head or grep.
function write (text) {
    process.stdout.on("error", () => {});
    process.stdout.write(`${ text }\n`);
}

const dir = routerDir();
if (!dir) {
    process.stderr.write("no router directory found; pass --dir\n");
    process.exit(1);
}

const components = new Map();
const routes = [];

for (const file of sourceFiles(dir)) {
    const source = readFileSync(file, "utf8");

    for (const [ , name, specifier ] of source.matchAll(LAZY)) {
        components.set(name, resolveModule(specifier));
    }

    for (const [ , name, specifier ] of source.matchAll(STATIC)) {
        components.set(name, resolveModule(specifier));
    }

    // Route entries: take each `path:` and look ahead a little for the name and component that
    // belong to it. Router files are hand-written objects, so the window is small and reliable.
    for (const match of source.matchAll(/path:\s*["'`]([^"'`]*)["'`]/g)) {
        const window = source.slice(match.index, match.index + 420);
        const name = (/name:\s*(?:routeNames\.)?([A-Za-z_$][\w$.]*)/.exec(window) ?? [])[1]
            ?? (/name:\s*["']([^"']+)["']/.exec(window) ?? [])[1]
            ?? null;
        const component = (/component:\s*([A-Za-z_$][\w$]*)/.exec(window) ?? [])[1] ?? null;

        routes.push({
            path: match[1],
            name,
            component,
            module: component ? components.get(component) ?? null : null,
            source: file,
        });
    }
}

// Child routes declare a path relative to their parent ("all", ":slug"). The files are written
// parent-first, so the nearest preceding absolute path is the parent — good enough to give a
// tester a URL to open, and clearly better than printing ":slug" on its own.
let lastAbsolute = "/";
for (const route of routes) {
    if (route.path.startsWith("/")) {
        lastAbsolute = route.path;
        route.fullPath = route.path;
    } else {
        route.fullPath = `${ lastAbsolute.replace(/\/$/, "") }/${ route.path }`;
    }
}

// A layout is a wrapper, not a page; keep it out of the listing but leave it in the data.
const pages = routes.filter((route) => !(route.module ?? "").includes("/layouts/"));

const wanted = argList("for");

// A file belongs to a route when the route's component is that file, or lives in the same module
// directory. Prefixes stop at src/<kind>/<name> — go shallower and every route in the package
// matches, which is worse than saying nothing.
function moduleDirs (file) {
    const dirs = file.split("/").slice(0, -1);
    const srcIndex = dirs.lastIndexOf("src");
    const min = srcIndex === -1 ? Math.min(2, dirs.length) : srcIndex + 3;
    const prefixes = [];

    for (let i = dirs.length; i >= min && i > 0; i -= 1) {
        prefixes.push(`${ dirs.slice(0, i).join("/") }/`);
    }

    return prefixes;
}

function routesFor (file) {
    const prefixes = moduleDirs(file);
    if (prefixes.length === 0) {
        return { direct: [], nearby: [] };
    }

    const own = prefixes[0];
    const direct = [];
    const nearby = [];

    for (const route of pages) {
        if (!route.module) {
            continue;
        }

        if (route.module === file || route.module.startsWith(own)) {
            direct.push(route);
        } else if (prefixes.some((prefix) => route.module.startsWith(prefix))) {
            nearby.push(route);
        }
    }

    return { direct, nearby };
}

if (wanted.length > 0) {
    const result = wanted.map((file) => ({ file, ...routesFor(file) }));

    if (process.argv.includes("--json")) {
        write(JSON.stringify(result, null, 2));
        process.exit(0);
    }

    const lines = [];
    const row = (route) => `      ${ (route.fullPath || "/").padEnd(30) } ${ route.name ?? "" }`;

    for (const { file, direct, nearby } of result) {
        lines.push(file);
        if (direct.length === 0 && nearby.length === 0) {
            lines.push("      no route renders this file — trace its importers instead");
        }
        if (direct.length > 0) {
            lines.push("    renders this file:");
            direct.slice(0, 12).forEach((route) => lines.push(row(route)));
        }
        if (nearby.length > 0) {
            lines.push(`    same module area (${ nearby.length }):`);
            nearby.slice(0, 8).forEach((route) => lines.push(row(route)));
        }
    }

    write(lines.join("\n"));
    process.exit(0);
}

if (process.argv.includes("--json")) {
    write(JSON.stringify({ dir, routes: pages, allEntries: routes }, null, 2));
    process.exit(0);
}

write([
    `router: ${ dir } — ${ pages.length } pages (${ routes.length } route entries), ${ components.size } components`,
    "",
    ...pages.map((route) => `${ (route.fullPath || "/").padEnd(32) } ${ (route.name ?? "").padEnd(28) } ${ route.module ?? "" }`),
].join("\n"));
