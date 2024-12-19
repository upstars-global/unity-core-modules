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
    id: string;
    writable: boolean;
    image: string;
    gift_descriptions: IGiftDescriptions[];
    condition: []
}

export interface IGroup {
    name: string;
    conditions: ILevelConditions[];
    status: boolean;
    id: number | string;
    writable: boolean;
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
