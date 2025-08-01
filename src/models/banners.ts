import { type UserGroup } from "./user";

export interface IBannerConfig {
    categories: string[];
    url: string;
    description: {
        text: string;
        size: string;
    };
    id: string;
    logged: boolean;
    title: {
        text: string;
    };
    identity: number;
    gradient: {
        colorLeft: string;
        colorLeftCenter: string;
        colorRightCenter: string;
        colorRight: string;
    };
    labels: [
        {
            title: string;
        }
    ];
    button: {
        name: string;
        url: string;
    };
    secondButton?: {
        name: string;
        popup: {
            title: string;
            secondTitle: string;
            desc: string;
        }
    };
    order: Record<string, number>,
    image: string;
    overlayImage: string;
    frontend_identifier: string;
    isSkeleton: boolean;
    groupIds?: UserGroup[]
}

export interface IViewedGTMBanners {
    promotion_id: string | number;
    promotion_name: string;
    location_id: string;
    creative_slot: number;
}

export interface IBannerCMSConfig {
    banners: IBannerConfig[]
}
