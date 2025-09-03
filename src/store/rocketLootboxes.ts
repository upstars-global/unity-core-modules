import dayjs from "dayjs";
import { defineStore, storeToRefs } from "pinia";
import { computed } from "vue";

import { type LootboxMap, Mode, type ModeLootbox, RocketLootboxSkin } from "../models/lootboxes";
import { EnumLootboxState } from "../models/lootboxes";
import type { ILootbox, ILootboxItemConfig } from "../services/api/DTO/lootboxes";
import { useCMS } from "./CMS";
import { useLootboxesStore } from "./lootboxes";

export const useRocketLootboxesStore = defineStore("rocketLootboxes", () => {
    const lootboxesStore = useLootboxesStore();
    const { lootboxesList } = storeToRefs(lootboxesStore);
    const { currentStaticPage } = storeToRefs(useCMS());

    function isLootboxValid({ created_at, stage }: ILootbox) {
        const used = stage === EnumLootboxState.activated;
        const expired = stage === EnumLootboxState.expired;
        const sameDay = dayjs().isSame(dayjs(created_at), "day");

        return !expired && (used && sameDay || !used);
    };

    const validLootboxes = computed(() => (lootboxesList.value as unknown as ILootbox[]).filter(isLootboxValid));

    function isItemWithPrize(lootboxItem: ILootboxItemConfig) {
        return lootboxItem.prize;
    }

    function createModeLootbox(acc: LootboxMap, mode: Mode): LootboxMap {
        const modeLootbox: ILootbox | undefined = validLootboxes.value.find(({ group_key }) => group_key === mode);

        acc[mode] = {
            type: mode,
            id: modeLootbox?.id,
            available: modeLootbox?.stage === EnumLootboxState.issued,
            used: modeLootbox?.stage === EnumLootboxState.activated,
            validUntil: modeLootbox?.valid_until,
            createdAt: modeLootbox?.created_at,
            prize: modeLootbox?.items.find(isItemWithPrize),
            items: modeLootbox?.items || [],
        } as ModeLootbox;

        return acc;
    }

    const lootboxes = computed<LootboxMap>(() => Object.values(Mode).reduce(createModeLootbox, {} as LootboxMap));
    const notUsedLootboxes = computed<ModeLootbox[]>(() => Object.values(lootboxes.value).filter(({ used }) => !used));
    const skin = computed<RocketLootboxSkin>(() => {
        return currentStaticPage.value?.meta.json.skin || {} as RocketLootboxSkin;
    });

    return {
        lootboxes,
        notUsedLootboxes,
        skin,
    };
});
