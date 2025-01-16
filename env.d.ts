/// <reference types="vite/client" />

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare const DEV: boolean;
declare const FORCE_RUN_ANALYTICS: boolean;
declare const log: { error: ()=> void };
