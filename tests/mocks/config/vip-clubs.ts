interface IImageConfig {
    src: string;
    srcRetina: string;
}

export interface IStatus {
    id: number;
    name: string;
    img: IImageConfig;
    order: number;
}

interface IStatuses {
    [key: string]: IStatus;
}

export enum VIP_CLUB_IDS {
    BRONZE = 1,
    SILVER = 2,
    GOLD = 3,
    PLATINUM = 4,
    DIAMOND = 5,
}

export const VIP_CLUB_STATUSES = {
    [VIP_CLUB_IDS.BRONZE]: "Bronze",
    [VIP_CLUB_IDS.SILVER]: "Silver",
    [VIP_CLUB_IDS.GOLD]: "Gold",
    [VIP_CLUB_IDS.PLATINUM]: "Platinum",
    [VIP_CLUB_IDS.DIAMOND]: "Diamond",
};

interface IMageConfig {
    src: string;
    srcRetina: string;
}

const IMG_BRONZE: IMageConfig = {
    src: "bronze",
    srcRetina: "bronzeX2",
};

const IMG_SILVER: IMageConfig = {
    src: "silver",
    srcRetina: "silverX2",
};

const IMG_GOLD: IMageConfig = {
    src: "gold",
    srcRetina: "goldX2",
};

const IMG_PLATINUM: IMageConfig = {
    src: "platinum",
    srcRetina: "platinumX2",
};

const IMG_DIAMOND: IMageConfig = {
    src: "diamond",
    srcRetina: "diamondX2",
};

export const IMG_STATUSES: Record<number, IMageConfig> = {
    26: IMG_BRONZE,
    27: IMG_SILVER,
    28: IMG_GOLD,
    29: IMG_PLATINUM,
    30: IMG_DIAMOND,
};

export const IMG_BY_NAME_STATUSES: Record<string, IMageConfig> = {
    Bronze: IMG_BRONZE,
    Silver: IMG_SILVER,
    Gold: IMG_GOLD,
    Platinum: IMG_PLATINUM,
    Diamond: IMG_DIAMOND,
};

export const DIAMOND_STATUS = "diamond";

export const STATUSES: IStatuses = {
    BRONZE: {
        id: VIP_CLUB_IDS.BRONZE,
        name: "Bronze",
        img: IMG_BRONZE,
        order: 1,
    },
    SILVER: {
        id: VIP_CLUB_IDS.SILVER,
        name: "Silver",
        img: IMG_SILVER,
        order: 2,
    },
    GOLD: {
        id: VIP_CLUB_IDS.GOLD,
        name: "Gold",
        img: IMG_GOLD,
        order: 3,
    },
    PLATINUM: {
        id: VIP_CLUB_IDS.PLATINUM,
        name: "Platinum",
        img: IMG_PLATINUM,
        order: 4,
    },
    DIAMOND: {
        id: VIP_CLUB_IDS.DIAMOND,
        name: "Diamond",
        img: IMG_DIAMOND,
        order: 5,
    },
};
