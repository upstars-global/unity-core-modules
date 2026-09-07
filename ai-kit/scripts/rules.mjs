// rules — shared reader for the toolkit's rule files. No AI, no dependencies.
//
// A rule file is markdown with YAML-ish frontmatter:
//   name         short identifier, matches the file name
//   description  one line: what the file covers, used in the index
//   appliesTo    all | apps | library
//
// Consumers: rules-inject.mjs (SessionStart index) and sync-agents-md.mjs (AGENTS.md).
//
// As a module:
//   import { readRules, repoRole, relativeFromCwd } from "./rules.mjs"

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));

export const PLUGIN_DIR = resolve(scriptDir, "..");
export const PACKAGE_ROOT = resolve(PLUGIN_DIR, "..");

// Canonical location of the package inside a consuming repository.
export const PACKAGE_IN_NODE_MODULES = join("node_modules", "unity-core-modules");

// A checkout of unity-core-modules itself always describes its own rules; anywhere else the
// rules come from wherever this script was loaded from (the installed plugin or node_modules).
function rulesRoot (cwd = process.cwd()) {
    const local = join(cwd, "ai-kit");

    return existsSync(join(local, "rules")) ? local : PLUGIN_DIR;
}

function frontmatter (text) {
    const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
    if (!match) {
        return {};
    }

    const fields = {};
    for (const line of match[1].split("\n")) {
        const pair = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line.trim());
        if (pair) {
            fields[pair[1]] = pair[2].trim();
        }
    }

    return fields;
}

// Every rule file, sorted by name, with its frontmatter and absolute path.
export function readRules (cwd = process.cwd()) {
    const dir = join(rulesRoot(cwd), "rules");
    if (!existsSync(dir)) {
        return [];
    }

    return readdirSync(dir)
        .filter((file) => file.endsWith(".md"))
        .sort()
        .map((file) => {
            const path = join(dir, file);
            const meta = frontmatter(readFileSync(path, "utf8"));

            return {
                name: meta.name ?? file.replace(/\.md$/, ""),
                description: meta.description ?? "",
                appliesTo: meta.appliesTo ?? "all",
                path,
            };
        });
}

// "library" for unity-core-modules itself, "app" for a consuming application.
// Derived from the package name so no repository needs to carry a config file.
export function repoRole (cwd = process.cwd()) {
    try {
        const pkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8"));

        return pkg.name === "unity-core-modules" ? "library" : "app";
    } catch {
        return "app";
    }
}

export function appliesToRole (rule, role) {
    return rule.appliesTo === "all"
        || (role === "app" && rule.appliesTo === "apps")
        || (role === "library" && rule.appliesTo === "library");
}

// Path as a human should type it from the repository root: inside unity-core-modules
// that is ai-kit/rules/x.md, in a consumer node_modules/unity-core-modules/ai-kit/rules/x.md.
export function relativeFromCwd (path, cwd = process.cwd()) {
    const rel = relative(cwd, path);
    if (!rel.startsWith("..")) {
        return rel;
    }

    // Outside the repository: this happens when the toolkit runs from an installed plugin, or when
    // a checkout of the package generates files for a consumer. Either way the path a developer in
    // that repository should use is the one inside node_modules.
    const inPackage = relative(PACKAGE_ROOT, path);

    return inPackage.startsWith("..") ? path : join(PACKAGE_IN_NODE_MODULES, inPackage);
}
