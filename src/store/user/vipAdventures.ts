import dayjs from "dayjs";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { type Currencies } from "../../models/enums/currencies";
import type { IUserStatus } from "../../models/user";
import type { IVipAdventuresDayConfig } from "../../models/vipAdventures";
import type { IPrizeConfigItem, IVipAdventuresConfig, IVipProgress } from "../../services/api/DTO/vipAdventuresDTO";
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
    const userStatuses = useUserStatuses();
    const vipAdventuresFullConfig = ref<IVipAdventuresConfig>();

    const vipAdvGroups = computed<string[]>(() => {
        const prizes = vipAdventuresFullConfig.value?.prizes;
        return prizes ? Object.keys(prizes) : [];
    });

    const userGroupForAdventure = computed<string | undefined>(() => {
        return vipAdvGroups.value.find((id) =>
            userStatuses.getUserGroups.some((groupId) => String(groupId) === String(id)),
        );
    });

    const vipAdventuresConfigFile = computed<IPrizeConfigItem[] | undefined>(() => {
        const prizes = vipAdventuresFullConfig.value?.prizes;
        if (!prizes || userGroupForAdventure.value === undefined) {
            return;
        }

        return prizes[userGroupForAdventure.value];
    });

    const vipAdventuresVariables = computed<Record<string, Record<Currencies, string>>>(() => {
        const variables = vipAdventuresFullConfig.value?.variables;
        if (!variables || userGroupForAdventure.value === undefined) {
            return {};
        }

        return variables[userGroupForAdventure.value] ?? {};
    });

    const toDay = computed(() => {
        const { useMocker } = useEnvironments();

        const dayMocker = parseAdventuresTitleDayConfig(vipAdventuresConfigFile.value?.[2]?.title || "__")?.day;
        return useMocker && dayMocker ?
            dayjs(dayMocker, "DD/MM/YYYY") :
            dayjs().utc();
    });

    const calendarConfig = computed(() => {
        if (!vipAdventuresConfigFile.value) {
            return [];
        }

        return vipAdventuresConfigFile.value.map((item, index) => {
            const { day } = parseAdventuresTitleDayConfig(item.title);
            const date = dayjs(day, "DD/MM/YYYY");

            return {
                index,
                fullDate: day,
                day: date.date(),
                weekday: date.weekday(),
                month: date.month(),
                today: toDay.value.format("DD/MM/YYYY") === day,
                isCompleted: userStatuses.getUserStatuses.some(({ name }) => name === item.title),
            };
        });
    });
    const superConfig = computed(() => {
        const calendarLength = calendarConfig.value.length;
        if (!calendarLength) {
            return { index: 0, today: false };
        }

        const lastCalendarDay = calendarConfig.value[calendarLength - 1];

        return {
            index: calendarLength,
            today: dayjs(lastCalendarDay.fullDate, "DD/MM/YYYY").isBefore(toDay.value, "day"),
        };
    });

    const vipAdventuresDays = computed<IVipAdventuresDayConfig[]>(() => {
        if (!vipAdventuresConfigFile.value) {
            return [];
        }
        return prepareVipAdventureCollectionDays(vipAdventuresConfigFile.value, userStatuses.getUserStatuses);
    });
    const superDay = computed<IVipAdventuresDayConfig | void>(() => {
        if (!vipAdventuresConfigFile.value || !vipAdventuresDays.value.length) {
            return;
        }

        const calendarLength = vipAdventuresDays.value.length;
        const lastCalendarDay = vipAdventuresDays.value[calendarLength - 1];

        return {
            ...lastCalendarDay,
            day: dayjs(lastCalendarDay.day, "DD/MM/YYYY").add(1, "day").format("DD/MM/YYYY"),
            step: lastCalendarDay.step + 1,
        };
    });

    const userVipStatusProgress = ref<IVipProgress>();

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
