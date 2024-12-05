export interface IModalOptions {
    new?: boolean;
    disableBackdropClosing?: boolean;
    mobileFriendly?: boolean;
    minHeight?: boolean;
    showFirst?: boolean;
    alwaysBottom?: boolean;
    name: string;
    component: any;
    props?: Record<string, unknown>;
    callback?(): void;
}
