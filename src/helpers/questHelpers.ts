// @ts-expect-error -- TS2307: Cannot find module '@config/quest' or its corresponding type declarations.
import getQuestConfig from "@config/quest";

const SEPARATOR_QUEST_FRONT_IS = "--";
const PLACE_SLUG_IN_FRONT_ID = 2;
const PLACE_SIZE_QUEST_IN_FRONT_ID = 1;

// @ts-expect-error -- TS7006: Parameter 'frontId' implicitly has an 'any' type.
export function isQuest(frontId) {
    return String(frontId).includes("quest");
}

export function questSlugById(frontendId = "") {
    return frontendId.split(SEPARATOR_QUEST_FRONT_IS)[PLACE_SLUG_IN_FRONT_ID];
}

export function questSizeById(frontendId = "") {
    return frontendId.split(SEPARATOR_QUEST_FRONT_IS)[PLACE_SIZE_QUEST_IN_FRONT_ID];
}

// @ts-expect-error -- TS7006: Parameter 'questSize' implicitly has an 'any' type.; TS7006: Parameter 'defaultCurrency' implicitly has an 'any' type.; TS7006: Parameter 'userBets' implicitly has an 'any' type.
export function getCurrentLevelData(questSize, defaultCurrency, userBets) {
    if (!questSize && !defaultCurrency && !userBets) {
        return [];
    }

    // @ts-expect-error -- TS2339: Property 'bets' does not exist on type 'unknown'.
    return Object.entries(getQuestConfig(questSize).mockLevels).find(([ , { bets } = {} ], index, array) => {
        const [ , nextItemData ] = array[index + 1] || [];
        // @ts-expect-error -- TS2339: Property 'bets' does not exist on type '{}'.
        const betForNext = nextItemData?.bets?.[defaultCurrency];

        if ((array.length - 1) === index) {
            return userBets >= bets[defaultCurrency];
        }

        return userBets >= bets[defaultCurrency] && userBets < betForNext;
    }) || [];
}

// @ts-expect-error -- TS7006: Parameter 'questSize' implicitly has an 'any' type.; TS7006: Parameter 'currentLevelData' implicitly has an 'any' type.; TS7006: Parameter 'defaultCurrency' implicitly has an 'any' type.; TS7006: Parameter 'userBetsInTargetQuest' im
export function findNextLevelData(questSize, currentLevelData, defaultCurrency, userBetsInTargetQuest) {
    if (!questSize && !currentLevelData && !defaultCurrency && !userBetsInTargetQuest) {
        return [];
    }
    return Object.entries(getQuestConfig(questSize).mockLevels)
        // @ts-expect-error -- TS2339: Property 'bets' does not exist on type 'unknown'.
        .find(([ , { bets } ], index, array) => {
            const [ , nextItemData ] = array[index] || [];

            if (nextItemData && currentLevelData) {
                // @ts-expect-error -- TS2339: Property 'bets' does not exist on type '{}'.
                const betForNext = nextItemData?.bets?.[defaultCurrency];

                if ((array.length - 1) === index) {
                    return userBetsInTargetQuest >= currentLevelData.bets[defaultCurrency];
                }

                return userBetsInTargetQuest < bets[defaultCurrency] &&
                    currentLevelData.bets[defaultCurrency] <= betForNext;
            }
        }) || [];
}
