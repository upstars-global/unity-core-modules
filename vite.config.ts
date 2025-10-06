/// <reference types="vitest/config" />

import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "./src/index.ts",
            name: "Permask",
            formats: [ "cjs", "es", "umd" ],
        },
        sourcemap: true,
        minify: true,
        rollupOptions: {
            external: [
                "vue",
                "pinia",
                /^@front\/core/,
                /^@(config|controllers|helpers|plugins|theme|modules)/,
            ],
            output: {
            },
        },
    },
    plugins: [],
    test: {
        reporters: process.env.GITHUB_ACTIONS ? [ "dot", "github-actions" ] : [ "dot" ],
        setupFiles: "./tests/vitest.setup.ts",
        coverage: {
            provider: "v8",
            reporter: [ "text", "json-summary", "json" ],
            include: [ "src/**/*.ts" ],
            exclude: [ "src/services/api/**", "src/models/**" ],
            reportOnFailure: true,
        },
        alias: [
            {
                find: /^@(config|controllers|helpers|plugins|theme|modules)/,
                replacement: "/tests/mocks/$1",
            },
        ],
        server: {
            deps: {
                external: [
                    "vue",
                    "pinia",
                    /^@front\/core/,
                    /^@(consts|components|controllers|helpers|theme|modules|store)/,
                ],
            },
        },
    },
});
