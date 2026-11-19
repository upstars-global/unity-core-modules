import { describe, expect, it } from "vitest";

import releaseConfig from "../../release.config.js";

// Guards the release pipeline against incompatible changelog tooling updates,
// e.g. a conventional-changelog-conventionalcommits major that needs a newer conventional-changelog-writer
// than @semantic-release/release-notes-generator ships, or a preset that no longer accepts the .hbs commitPartial.

type PluginEntry = string | [string, Record<string, unknown>];
type SemanticReleasePlugin = {
    analyzeCommits?: (config: Record<string, unknown>, context: Record<string, unknown>) => Promise<string | null>;
    generateNotes?: (config: Record<string, unknown>, context: Record<string, unknown>) => Promise<string>;
};

// A non-literal specifier keeps TypeScript from requiring typings for the untyped plugin packages.
const loadPlugin = (name: string): Promise<SemanticReleasePlugin> => import(name);

function getPluginConfig (name: string): Record<string, unknown> {
    const entry = (releaseConfig.plugins as PluginEntry[])
        .find((plugin) => (Array.isArray(plugin) ? plugin[0] : plugin) === name);

    return { preset: releaseConfig.preset, ...(Array.isArray(entry) ? entry[1] : {}) };
}

const repositoryUrl = "https://github.com/upstars-global/unity-core-modules";
const featureHash = "a".repeat(40);
const fixHash = "b".repeat(40);

const context = {
    cwd: process.cwd(),
    env: {},
    logger: { log: () => undefined, warn: () => undefined, error: () => undefined, success: () => undefined },
    options: { repositoryUrl: `${repositoryUrl}.git` },
    lastRelease: { gitTag: "v1.0.0", version: "1.0.0" },
    nextRelease: { gitTag: "v2.0.0", version: "2.0.0" },
    commits: [
        {
            hash: featureHash,
            message: "feat(api): add release check (#42)\n\n* feat: first change\n\nBREAKING CHANGE: old api removed",
        },
        {
            hash: fixHash,
            message: "fix: handle empty config\n\n* fix: second change",
        },
    ],
};

describe("release.config", () => {
    it("analyzes commits with the configured release rules", async () => {
        const { analyzeCommits } = await loadPlugin("@semantic-release/commit-analyzer");

        await expect(analyzeCommits!(getPluginConfig("@semantic-release/commit-analyzer"), context))
            .resolves.toBe("major");
    });

    it("renders release notes with the configured preset and commit template", async () => {
        const { generateNotes } = await loadPlugin("@semantic-release/release-notes-generator");

        const notes = await generateNotes!(getPluginConfig("@semantic-release/release-notes-generator"), context);

        expect(notes).toContain(`[2.0.0](${repositoryUrl}/compare/v1.0.0...v2.0.0)`);
        expect(notes).toContain("### 🚀 Features");
        expect(notes).toContain("### 🐛 Bug Fixes");
        expect(notes).toContain("**api:** add release check");
        expect(notes).toContain(`(${repositoryUrl}/commit/${featureHash})`);
        expect(notes).toContain(`(${repositoryUrl}/commit/${fixHash})`);
        expect(notes).toContain("* feat: first change");
        expect(notes).toContain("* fix: second change");
        expect(notes).toContain("**BREAKING CHANGE**: old api removed");
    });
});
