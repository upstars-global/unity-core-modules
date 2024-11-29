enum Browser {
    CHROME = "Chrome",
    SAFARI = "Safari",
}

export interface IClientContext {
    userAgent: string;
    isMetaWebview: boolean;
    isIOS: boolean;
    isMobile: boolean;
    isApp: boolean;
    browser: Browser | string;
    isBot: boolean;
}
