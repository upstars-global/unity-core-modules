// component-scaffold — creates the files a new component needs, in the places this repository
// actually puts them. No AI: every byte here follows from the arguments, so it costs nothing and
// cannot drift from the conventions.
//
// What it knows, from the repositories rather than from habit:
//   front-ss     components live in src/<dir>/<Name>.vue, tests mirror them in tests/unit/<dir>/
//   front-core   tests sit next to the source, there is no mirrored tests tree
//   library      unity-core-modules mirrors src/ into tests/
//   stories      packages/storybook-ss/src/stories/<Name>.stories.ts
//   i18n         new keys go into src/i18n/messages/en.json ONLY; every other locale comes back
//                from Lokalise after the MR, so writing them here would be overwritten
//
// CLI:
//   node .../component-scaffold.mjs --name FeBadge --dir components/FeBadge
//   node .../component-scaffold.mjs --name VipCard --package front-core --dir modules/VipProgram
//   node .../component-scaffold.mjs --name FeBadge --dir ui/FeBadge --story
//   node .../component-scaffold.mjs --name FeBadge --dir ui/FeBadge --i18n-keys BADGE.TITLE=Badge
//   ... --dry-run     print what would be written and touch nothing

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

function arg (name, fallback = "") {
    const index = process.argv.indexOf(`--${ name }`);

    return index !== -1 && process.argv[index + 1] && !process.argv[index + 1].startsWith("--")
        ? process.argv[index + 1]
        : fallback;
}

const dryRun = process.argv.includes("--dry-run");
const withStory = process.argv.includes("--story");
const name = arg("name");
const pkg = arg("package", "front-ss");
const dir = arg("dir", `components/${ name }`).replace(/^\/+|\/+$/g, "");
const i18nKeys = arg("i18n-keys");

if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name)) {
    process.stderr.write("--name is required and must be PascalCase, for example --name FeBadge\n");
    process.exit(1);
}

// Where each package keeps sources and tests. Adding a package means adding a row here, not
// teaching a model a new convention.
const LAYOUTS = {
    "front-ss": { src: "packages/front-ss/src", tests: "packages/front-ss/tests/unit", mirror: true },
    "front-core": { src: "packages/front-core", tests: null, mirror: false },
    "server-core": { src: "packages/server-core", tests: null, mirror: false },
    library: { src: "src", tests: "tests", mirror: true },
};

const layout = LAYOUTS[pkg];
if (!layout) {
    process.stderr.write(`unknown --package ${ pkg }; known: ${ Object.keys(LAYOUTS).join(", ") }\n`);
    process.exit(1);
}

if (!existsSync(layout.src)) {
    process.stderr.write(`${ layout.src } does not exist — run this from the repository root\n`);
    process.exit(1);
}

const componentPath = join(layout.src, dir, `${ name }.vue`);
const testPath = layout.mirror
    ? join(layout.tests, dir, `${ name }.test.ts`)
    : join(layout.src, dir, `${ name }.test.ts`);
const storyPath = join("packages/storybook-ss/src/stories", `${ name }.stories.ts`);

// Script first, then template: that is the order the recently written components use.
const component = `<script setup lang="ts">
interface Props {
    title?: string;
}

const props = withDefaults(defineProps<Props>(), {
    title: "",
});

const emit = defineEmits<{
    click: [];
}>();
</script>

<template>
    <div class="${ name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase() }">
        <button type="button" @click="emit('click')">
            {{ props.title }}
        </button>
    </div>
</template>
`;

const importPath = pkg === "front-ss"
    ? `@${ dir.startsWith("ui/") ? "ui" : dir.split("/")[0] }/${ dir.split("/").slice(1).concat(`${ name }.vue`).join("/") }`
    : `./${ name }.vue`;

const test = `import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import ${ name } from "${ importPath }";

describe("${ name }", () => {
    it("renders its title", () => {
        const wrapper = mount(${ name }, {
            props: { title: "Example" },
        });

        expect(wrapper.text()).toContain("Example");
    });

    it("emits click", async() => {
        const wrapper = mount(${ name });

        await wrapper.get("button").trigger("click");

        expect(wrapper.emitted("click")).toHaveLength(1);
    });
});
`;

const story = `import type { Meta, StoryObj } from "@storybook/vue3";
import ${ name } from "${ importPath }";
import type { ComponentProps } from "vue-component-type-helpers";

type ${ name }Props = ComponentProps<typeof ${ name }>;

const meta: Meta<${ name }Props> = {
    title: "UiKit/${ name }",
    component: ${ name },
    tags: [ "autodocs" ],
} satisfies Meta<typeof ${ name }>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: "Example",
    },
};
`;

const planned = [
    { path: componentPath, content: component },
    { path: testPath, content: test },
];

if (withStory) {
    planned.push({ path: storyPath, content: story });
}

// New translation keys go into the default language only, sorted, and never over an existing key:
// the other locales are pulled back from Lokalise and would lose anything written here.
function addTranslations (pairs) {
    const messages = join(layout.src, "i18n/messages/en.json");
    if (!existsSync(messages)) {
        return `skipped i18n: ${ messages } not found`;
    }

    const json = JSON.parse(readFileSync(messages, "utf8"));
    const added = [];
    const existing = [];

    for (const pair of pairs) {
        const [ key, ...rest ] = pair.split("=");
        const value = rest.join("=") || key.split(".").pop();
        const parts = key.split(".");
        let node = json;

        for (const part of parts.slice(0, -1)) {
            if (typeof node[part] !== "object" || node[part] === null) {
                node[part] = {};
            }
            node = node[part];
        }

        const leaf = parts[parts.length - 1];
        if (leaf in node) {
            existing.push(key);
        } else {
            node[leaf] = value;
            added.push(key);
        }
    }

    const sorted = (value) => (typeof value !== "object" || value === null || Array.isArray(value)
        ? value
        : Object.fromEntries(Object.keys(value).sort().map((key) => [ key, sorted(value[key]) ])));

    if (added.length > 0 && !dryRun) {
        writeFileSync(messages, `${ JSON.stringify(sorted(json), null, 4) }\n`);
    }

    return [
        added.length > 0 ? `i18n added to en.json: ${ added.join(", ") }` : "",
        existing.length > 0 ? `i18n already present, left alone: ${ existing.join(", ") }` : "",
        added.length > 0 ? "Other locales come back from Lokalise after the MR — do not add them here." : "",
    ].filter(Boolean).join("\n");
}

const clashes = planned.filter((file) => existsSync(file.path));
if (clashes.length > 0) {
    process.stderr.write(`refusing to overwrite:\n${ clashes.map((file) => `  ${ file.path }`).join("\n") }\n`);
    process.exit(1);
}

const done = [];
for (const file of planned) {
    if (!dryRun) {
        mkdirSync(dirname(file.path), { recursive: true });
        writeFileSync(file.path, file.content);
    }
    done.push(`${ dryRun ? "would write" : "wrote" } ${ file.path }`);
}

if (i18nKeys) {
    done.push(addTranslations(i18nKeys.split(",").map((pair) => pair.trim()).filter(Boolean)));
}

done.push("", "Next: fill in the component, keep the test asserting behaviour rather than markup,");
done.push("and run the package's own test script on it before anything else.");

process.stdout.write(`${ done.filter(Boolean).join("\n") }\n`);
