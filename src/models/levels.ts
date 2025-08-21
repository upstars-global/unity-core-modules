import { type Currencies } from "./enums/currencies";

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

type LifetimeLevel = `lifetime_level_${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;
type VipLevel = `vip_level_${1 | 2 | 3 | 4 | 5 | 6}`;

export type Level = LifetimeLevel | VipLevel;

export interface ILevels {
    [level: string]: {
        gift_descriptions: Array<{
            name: string;
            type: string;
        }>;
        image: string;
    };
}

export interface ILevelCard {
    reward: string,
    rewards: Record<string, string>
}

export type Reward = {
        id: string;
        image?: string;
        eventLink?: string;
        bonusLink?: string;
        bonus?: boolean;
        variables?: Record<string, Record<Currencies, string>>;
        details?: {
            conditions?: Array<{
                id: string;
                link?: string;
            }>;
        };
    }

export type Rewards = Record<Level, Reward[]>;

export type LevelConfig = {
    image: {
        src: string,
        srcRetina: string
    },
    saveTarget: number
}
export interface IVipProgramConfig {
    rewardCards: Record<Level, Reward[]>,
    levelsConfig: Record<Level, LevelConfig>
}
