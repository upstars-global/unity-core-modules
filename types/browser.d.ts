interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
}

interface CustomerIOQueue {
    push(value: unknown[]): number;
    identify(data: object): void;
    [method: string]: unknown;
}

interface Window {
    _cio?: CustomerIOQueue;
    _smartico_language: string | null;
    _smartico_user_id: string | null;
    antifrodScriptsPath?: string;
    dfpObj?: {
        getDFP(): string;
    };
}

declare const _cio: CustomerIOQueue;

interface HTMLScriptElement {
    language: string;
}
