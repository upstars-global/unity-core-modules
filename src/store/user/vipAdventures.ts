import dayjs from "dayjs";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { type Currencies } from "../../models/enums/currencies";
import type { IUserStatus, UserGroup } from "../../models/user";
import type { IVipAdventuresDayConfig } from "../../models/vipAdventures";
import type { IPrizeConfigItem, IVipAdventuresConfig, IVipProgress } from "../../services/api/DTO/vipAdventuresDTO";
import { useConfigStore } from "../../store/configStore";
import { useEnvironments } from "../../store/environments";
import { useUserStatuses } from "./userStatuses";


function prepareVipAdventureCollectionDays(configDays: IPrizeConfigItem[], userStatuses: IUserStatus[]): IVipAdventuresDayConfig[] {
    return configDays.map((configDayItem) => {
        const { day, step, stepTotal } = parseAdventuresTitleDayConfig(configDayItem.title);
        return {
            day,
            step,
            stepTotal,
            isCompleted: userStatuses.some(({ name }) => name === configDayItem.title),
            ...configDayItem,
        };
    });
}


export function parseAdventuresTitleDayConfig(title: string): {
    day: string;
    step: number;
    stepTotal: number;
} {
    const [ __, stepInfo, day ] = title.split("__");
    const [ step, stepTotal ] = stepInfo.split("/");
    return {
        day,
        step: Number(step),
        stepTotal: Number(stepTotal),
    };
}

export function parseGiftAdventureTitle(title: string): {
    step: number;
    giftTitle: string;
    day: string
} | string {
    if (title.includes("__")) {
        const [ __, step, day, giftTitle ] = title.split("__");
        return {
            step: Number(step),
            day,
            giftTitle,
        };
    }

    return title;
}
export const useVipAdventures = defineStore("vipAdventures", () => {
    const configStore = useConfigStore();
    const userStatuses = useUserStatuses();
    const vipAdventuresFullConfig = ref<IVipAdventuresConfig>();

    const vipAdvGroups = computed<number[]>(() => {
        const prizes = vipAdventuresFullConfig.value?.prizes;
        return prizes ? Object.keys(prizes).map(Number) : [];
    });

    const userGroupForAdventure = computed<number | undefined>(() => {
        return vipAdvGroups.value.find((id) => userStatuses.getUserGroups.includes(id));
    });

    const vipAdventuresConfigFile = computed<IPrizeConfigItem[] | undefined>(() => {
        const prizes = vipAdventuresFullConfig.value?.prizes;
        if (!prizes) {
            return;
        }

        const groupId = userGroupForAdventure.value ?? -1;
        return prizes[groupId] ?? Object.values(prizes)[0];
    });

    const vipAdventuresVariables = computed<Record<string, Record<Currencies, string>>>(() => {
        const variables = vipAdventuresFullConfig.value?.variables;
        if (!variables) {
            return {};
        }

        const groupId = userGroupForAdventure.value ?? -1;
        return variables[groupId] ?? Object.values(variables)[0] ?? {};
    });

    const toDay = computed(() => {
        const { useMocker } = useEnvironments();

        const dayMocker = parseAdventuresTitleDayConfig(vipAdventuresConfigFile.value?.[2]?.title || "__")?.day;
        return useMocker && dayMocker ?
            dayjs(dayMocker, formatDateVipAdv.value) :
            dayjs().utc();
    });

    const calendarConfig = computed(() => {
        if (!vipAdventuresConfigFile.value) {
            return [];
        }

        return vipAdventuresConfigFile.value.map((item, index) => {
            const { day } = parseAdventuresTitleDayConfig(item.title);
            const date = dayjs(day, formatDateVipAdv.value);

            return {
                index,
                fullDate: day,
                day: date.date(),
                weekday: date.weekday(),
                month: date.month(),
                today: toDay.value.format(formatDateVipAdv.value) === day,
                isCompleted: userStatuses.getUserStatuses.some(({ name }) => name === item.title),
            };
        });
    });
    const superConfig = computed(() => {
        const calendarLength = calendarConfig.value.length;
        const lastCalendarDay = calendarConfig.value[calendarLength - 1];

        return {
            index: calendarConfig.value.length,
            today: dayjs(lastCalendarDay.fullDate, formatDateVipAdv.value).isBefore(toDay.value, "day"),
        };
    });

    const vipAdventuresDays = computed<IVipAdventuresDayConfig[]>(() => {
        if (!vipAdventuresConfigFile.value) {
            return [];
        }
        return prepareVipAdventureCollectionDays(vipAdventuresConfigFile.value, userStatuses.getUserStatuses);
    });
    const superDay = computed<IVipAdventuresDayConfig | void>(() => {
        if (!vipAdventuresConfigFile.value) {
            return;
        }

        const calendarLength = vipAdventuresDays.value.length;
        const lastCalendarDay = vipAdventuresDays.value[calendarLength - 1];

        return {
            ...lastCalendarDay,
            day: dayjs(lastCalendarDay.day, formatDateVipAdv.value).add(1, "day").format(formatDateVipAdv.value),
            step: lastCalendarDay.step + 1,
        };
    });

    const userVipStatusProgress = ref<IVipProgress>();
    const formatDateVipAdv = computed(() => configStore.$defaultProjectConfig.vipAdventures.formatDateVipAdv);

    return {
        vipAdventuresFullConfig,
        vipAdventuresConfigFile,
        vipAdventuresVariables,

        vipAdventuresDays,
        superDay,
        userVipStatusProgress,
        userGroupForAdventure,

        calendarConfig,
        superConfig,
        toDay,
    };
});
