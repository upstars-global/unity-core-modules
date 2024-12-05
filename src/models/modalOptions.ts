export interface IModalOptions {
    new?: boolean;
    disableBackdropClosing?: boolean;
    mobileFriendly?: boolean;
    minHeight?: boolean;
    showFirst?: boolean;
    alwaysBottom?: boolean;
    name: string;
    component: unknown;
    props?: Record<string, unknown>;
    callback?(): void;
}
