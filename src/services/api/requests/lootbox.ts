import { log } from "../../../controllers/Logger";
import type { ILootbox } from "../../../models/lootboxes";
import type { UserGroup } from "../../../models/user";
import { IPageItemCMS } from "../DTO/CMS";
import { ILootboxesFileConfig } from "../DTO/lootboxes";
import { http } from "../http";

export async function loadMockLootboxWheelConfigs():
    Promise<ILootboxesFileConfig | undefined> {
    try {
        const { data } = await http().get<ILootboxesFileConfig>("/api/fe/config/wheel-config");

        return data;
    } catch (err) {
        log.error("LOAD_MOCK_SECTIONS_ROCKET_WHEEL_ERROR", err);
    }
}

export async function loadMockLootboxWheelSegmentsConfigs():
    Promise<Record<string, ILootboxesFileConfig> | undefined> {
    try {
        const { data } = await http().get<Record<string, ILootboxesFileConfig>>("/api/fe/config/wheel-config-segments");

        return data;
    } catch (err) {
        log.error("LOAD_MOCK_SECTIONS_ROCKET_WHEEL_ERROR", err);
    }
}

export async function getLootboxesReq() {
    try {
        const { data } = await http().get<ILootbox[]>("/api/player/lootboxes");

        return data;
    } catch (err) {
        log.error("LOAD_LOOTBOXES_LIST_ERROR", err);
    }
}

export async function activateLootboxReq(id: number) {
    try {
        const { data } = await http().post(`/api/player/lootboxes/${id}/activation`);

        return data;
    } catch (err) {
        log.error("LOAD_PRIZE_OF_LOOTBOX_ERROR", err);
    }
}

export async function loadBetBonusReq(type: string, id: string) {
    try {
        const { data } = await http().get(`/api/v2/bonuses/${type}/${id}`);
        return data;
    } catch (err) {
        log.error("LOAD_BET_BONUS_ERROR", err);
    }
}
