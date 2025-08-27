import { type Currencies } from "./enums/currencies";

type LifetimeLevel = `lifetime_level_${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;
type VipLevel = `vip_level_${1 | 2 | 3 | 4 | 5 | 6}`;

export type Level = LifetimeLevel | VipLevel;

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
    levelsConfig: Record<Level, LevelConfig>,
    levelCards: Record<Level, ILevelCard>,
    levelBonusesCount: Record<Level, number>,
}
