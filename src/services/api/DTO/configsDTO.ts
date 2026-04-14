type WelcomeOfferBannerConfig = Record<string, {
    image: {
        src: string;
        srcRetina: string;
    };
    title?: string;
    description?: string;
}>;

export interface IWelcomeOfferConfigDTO {
    stag: WelcomeOfferBannerConfig;
    geoIp: WelcomeOfferBannerConfig;
}
