import { ILevelCard, Level, LevelConfig, RewardConfig, VipLevelSave } from "../../../models/levels";

export interface IVipProgramConfigDTO {
    rewardCards: Record<string, RewardConfig>,
    levelRewards: Record<Level | VipLevelSave, string[]>,
    levelsConfig: Record<Level, LevelConfig>,
    levelCards: Record<Level, ILevelCard>,
    levelBonusesCount: Record<Level, number>,
    seasonInfo: {
        dateEnd: string,
        dateStart: string,
    },
}
