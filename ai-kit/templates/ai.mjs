// ai — runs a unity-ai toolkit script, from wherever the toolkit actually is.
//
// This wrapper exists because ${CLAUDE_PLUGIN_ROOT} is only substituted inside plugin.json and
// hooks.json. In the body of a SKILL.md it stays a literal, so a skill cannot address the scripts
// that ship with the plugin. One resolver per repository solves it for every skill at once.
//
// Copy of ai-kit/templates/ai.mjs in unity-core-modules. Update it from there.
//
// Usage:
//   node scripts/ai.mjs                        # what is installed, and which scripts exist
//   node scripts/ai.mjs collect-evidence --json
//   node scripts/ai.mjs docs-map --find Cashbox

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// In order of trust: the pinned package (always present in an application), this checkout (when
// the repository *is* the toolkit), then the installed plugin if its variable happens to be set.
const candidates = [
    join(root, "node_modules/unity-core-modules/ai-kit"),
    join(root, "ai-kit"),
    process.env.CLAUDE_PLUGIN_ROOT ?? "",
].filter(Boolean);

const kit = candidates.find((path) => existsSync(join(path, "scripts")));

if (!kit) {
    console.error(
        "unity-ai toolkit not found. In an application, bump the unity-core-modules pin to a\n"
        + "release that ships ai-kit and run yarn install; in the library, run this from its root.",
    );
    process.exit(1);
}

const version = (() => {
    try {
        return JSON.parse(readFileSync(join(kit, ".claude-plugin/plugin.json"), "utf8")).version;
    } catch {
        return "unknown";
    }
})();

const [ name, ...rest ] = process.argv.slice(2);

if (!name) {
    const scripts = readdirSync(join(kit, "scripts"))
        .filter((file) => file.endsWith(".mjs") && file !== "rules.mjs")
        .map((file) => file.replace(/\.mjs$/, ""));

    console.log(`unity-ai ${ version } at ${ kit }\n`);
    console.log(`usage: node scripts/ai.mjs <script> [args]\n\nscripts: ${ scripts.join(", ") }`);
    process.exit(0);
}

const script = join(kit, "scripts", `${ name.replace(/\.mjs$/, "") }.mjs`);

if (!existsSync(script)) {
    console.error(`no such toolkit script: ${ name }. Run node scripts/ai.mjs to list them.`);
    process.exit(1);
}

process.argv = [ process.argv[0], script, ...rest ];
await import(`file://${ script }`);
