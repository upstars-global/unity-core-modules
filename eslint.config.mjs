import browserConfig from "unity-eslint-config/browser";
import nodeConfig from "unity-eslint-config/node";

const commonConfig = {
    files: [ "**/*.{js,cjs,mjs,jsx,ts,mts,tsx}" ],
    ignores: [ "/node_modules/", "yarn.lock" ],
};

const legacyRules = {
    "preserve-caught-error": "off",
};

export default [
    ...browserConfig,
    ...nodeConfig,
    {
        ...commonConfig,
        name: "unity-core-modules",
        rules: {
            ...legacyRules,
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/ban-ts-comment": "error",
            "n/no-unsupported-features/node-builtins": [
                "error",
                {
                    version: ">=22.22.0",
                    ignores: [ "localStorage" ],
                },
            ],
        },
    },
    {
        files: [ "**/*.cjs" ],
        languageOptions: {
            globals: {
                module: "readonly",
            },
        },
    },
];
