declare interface Window {
    __pinia?: Record<string, StateTree>;

    /**
     * __deferredPWAInstallEvent store the 'beforeinstallprompt' event if it fires early, before app initialization.
     * Captured globally to allow deferred PWA install prompt handling in the Vue app.
     * Optional: may be null if event never fired. Initialized as null in index.html
     */
    __deferredPWAInstallEvent: null | BeforeInstallPromptEvent;
}


declare interface BeforeInstallPromptEvent extends Event {

    /**
     * Returns an array of DOMString items containing the platforms on which the event was dispatched.
     * This is provided for user agents that want to present a choice of versions to the user such as,
     * for example, "web" or "play" which would allow the user to chose between a web version or
     * an Android version.
     */
    readonly platforms: Array<string>;

    /**
     * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
     */
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed",
        platform: string
    }>;

    /**
     * Allows a developer to show the install prompt at a time of their own choosing.
     * This method returns a Promise.
     */
    prompt(): Promise<void>;

}

declare interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
}
