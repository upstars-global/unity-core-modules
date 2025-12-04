import { type Currencies } from "./enums/currencies";

type LifetimeLevel = `lifetime_level_${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;
type VipLevel = `vip_level_${1 | 2 | 3 | 4 | 5 | 6}`;

export type Level = LifetimeLevel | VipLevel;

export interface ILevelCard {
    reward: string,
    rewards: Record<string, string>
}

export type RewardConfig = {
    level: Level;
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
    isVIPManagerReward?: boolean
}

export type Reward = RewardConfig & {
    id: string;
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
    rewards: Rewards,
    levelsConfig: Record<Level, LevelConfig>,
    levelCards: Record<Level, ILevelCard>,
    levelBonusesCount: Record<Level, number>,
}
export interface ILevel {
    name: string;
    status: boolean;
    id: string;
    levelNumber: number;
    min: number;
    max: number;
    image: string;
}

export interface IGroup {
    name: string;
    conditions: ILevelConditions[];
    status: boolean;
    id: number | string;
    writable: boolean;
}
