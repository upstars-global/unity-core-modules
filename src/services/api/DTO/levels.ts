import { ILevelCard, Level, LevelConfig, RewardConfig } from "../../../models/levels";

export interface IVipProgramConfigDTO {
    rewardCards: Record<string, RewardConfig>,
    levelRewards: Record<Level, string[]>,
    levelsConfig: Record<Level, LevelConfig>,
    levelCards: Record<Level, ILevelCard>,
    levelBonusesCount: Record<Level, number>,
}
