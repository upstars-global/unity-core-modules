import eslintFrontera from "eslint-config-frontera";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const commonConfig = {
    files: [ "**/*.{js,cjs,mjs,jsx,ts,mts,tsx}" ],
    ignores: [ "/node_modules/", "yarn.lock" ],
};

export default [
    ...eslintFrontera.map((config) => {
        return {
            ...config,
            ...commonConfig,
        };
    }),
    {
        ...commonConfig,
        name: "unity-core-modules",
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            "n/no-sync": "off",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/ban-ts-comment": "error",
            "id-length": "off",
            "n/no-unsupported-features/node-builtins": [
                "error",
                {
                    version: ">=22.22.0",
                    ignores: [ "localStorage" ],
                },
            ],
            "simple-import-sort/imports": "warn",
            "simple-import-sort/exports": "warn",
        },
    },
];
