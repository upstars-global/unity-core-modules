import eslintFrontera from "eslint-config-frontera";

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
        rules: {
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/ban-ts-comment": "error",
            "id-length": "off",
            "n/no-unsupported-features/node-builtins": [
                "error",
                {
                    version: ">=22.4.1",
                    ignores: [ "localStorage" ],
                },
            ],
        },
    },
];
