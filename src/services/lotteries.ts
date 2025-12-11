import { storeToRefs } from "pinia";

import { useLotteriesStore } from "../store/lotteries";
import {
    getLotteryByIDReq,
    getLotteryStatusByIDReq,
    loadLotteriesListReq,
    loadLotteriesStatusesReq,
} from "./api/requests/lotteries";

export async function loadLotteriesList() {
    const lotteriesStore = useLotteriesStore();

    const data = await loadLotteriesListReq();

    if (data) {
        lotteriesStore.setLotteriesList(data);
    }
}

export async function loadLotteryStatuses() {
    const lotteriesStore = useLotteriesStore();
    const { lotteriesStatuses } = storeToRefs(lotteriesStore);
    const data = await loadLotteriesStatusesReq();

    if (data) {
        const existingIds = new Set(lotteriesStatuses.value.map((item) => item.lottery_id));
        const uniqueStatuses = data.filter((item) => !existingIds.has(item.lottery_id));

        lotteriesStore.setLotteriesStatuses([
            ...lotteriesStatuses.value,
            ...uniqueStatuses,
        ]);
    }
}

export async function loadLotteryByID(id: number) {
    const { currentLottery } = storeToRefs(useLotteriesStore());

    if (currentLottery.value?.id === id) {
        return currentLottery.value;
    }

    currentLottery.value = null;

    const data = await getLotteryByIDReq(id);

    if (data) {
        currentLottery.value = data;
    }

    return currentLottery.value;
}

export async function loadLotteryStatusByID(id: number): Promise<void> {
    const lotteriesStore = useLotteriesStore();
    const { lotteriesStatuses } = storeToRefs(lotteriesStore);

    const data = await getLotteryStatusByIDReq(id);

    if (data) {
        lotteriesStore.setLotteriesStatuses([
            ...lotteriesStatuses.value.filter(({ lottery_id }) => lottery_id !== data.lottery_id),
            data,
        ]);
    }
}
