interface IPersistentCompPoints {
    type: string;
    exclude_end: boolean;
    min: number;
    max: number;
}

interface ILevelConditions {
    persistent_comp_points: IPersistentCompPoints;
}

interface IGiftDescriptions {
    type: string;
    name: string;
}

export interface IUserLevelInfo {
    name: string;
    conditions: ILevelConditions[];
    status: boolean;
    id: number | string;
    writable: boolean;
    image: string;
    gift_descriptions: IGiftDescriptions[];
}

export interface IStatus {
    name: string;
    conditions: ILevelConditions[];
    status: boolean;
    id: number | string;
    levelNumber: number;
    writable: boolean;
    min: number;
    max: number;
}

export interface ILevels {
    [level: string]: {
        gift_descriptions: Array<{
            name: string;
            type: string;
        }>;
        image: string;
    };
}
