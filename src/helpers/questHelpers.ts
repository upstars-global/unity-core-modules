import { useConfigStore } from "../store/configStore";

const SEPARATOR_QUEST_FRONT_IS = "--";
const PLACE_SLUG_IN_FRONT_ID = 2;
const PLACE_SIZE_QUEST_IN_FRONT_ID = 1;

export function isQuest(frontId) {
    return String(frontId).includes("quest");
}

export function questSlugById(frontendId = "") {
    return frontendId.split(SEPARATOR_QUEST_FRONT_IS)[PLACE_SLUG_IN_FRONT_ID];
}

export function questSizeById(frontendId = "") {
    return frontendId.split(SEPARATOR_QUEST_FRONT_IS)[PLACE_SIZE_QUEST_IN_FRONT_ID];
}

export function getCurrentLevelData(questSize, defaultCurrency, userBets) {
    const { $defaultProjectConfig } = useConfigStore();
    const { getQuestConfig } = $defaultProjectConfig;
    if (!questSize && !defaultCurrency && !userBets) {
        return [];
    }

    return Object.entries(getQuestConfig(questSize).mockLevels).find(([ , { bets } = {} ], index, array) => {
        const [ , nextItemData ] = array[index + 1] || [];
        const betForNext = nextItemData?.bets?.[defaultCurrency];

        if ((array.length - 1) === index) {
            return userBets >= bets[defaultCurrency];
        }

        return userBets >= bets[defaultCurrency] && userBets < betForNext;
    }) || [];
}

export function findNextLevelData(questSize, currentLevelData, defaultCurrency, userBetsInTargetQuest) {
    const { $defaultProjectConfig } = useConfigStore();
    const { getQuestConfig } = $defaultProjectConfig;
    if (!questSize && !currentLevelData && !defaultCurrency && !userBetsInTargetQuest) {
        return [];
    }
    return Object.entries(getQuestConfig(questSize).mockLevels)
        .find(([ , { bets } ], index, array) => {
            const [ , nextItemData ] = array[index] || [];

            if (nextItemData && currentLevelData) {
                const betForNext = nextItemData?.bets?.[defaultCurrency];

                if ((array.length - 1) === index) {
                    return userBetsInTargetQuest >= currentLevelData.bets[defaultCurrency];
                }

                return userBetsInTargetQuest < bets[defaultCurrency] &&
                    currentLevelData.bets[defaultCurrency] <= betForNext;
            }
        }) || [];
}
