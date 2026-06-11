/// <reference types="vite/client" />

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare const DEV: boolean;
declare const FORCE_RUN_ANALYTICS: boolean;

declare module "centrifuge-legacy/centrifuge" {
    const CentrifugeLegacy: new (options: Record<string, unknown>) => unknown;

    export default CentrifugeLegacy;
}
