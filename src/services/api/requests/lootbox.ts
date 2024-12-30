import { log } from "../../../controllers/Logger";
import type { ILootbox } from "../../../models/lootboxes";
import type { UserGroup } from "../../../models/user";
import { IPageItemCMS } from "../DTO/CMS";
import { ILootboxesFileConfig } from "../DTO/lootboxes";
import { http } from "../http";

export async function loadMockLootboxWheelConfigs():
    Promise<ILootboxesFileConfig | Error | undefined> {
    try {
        const { data } = await http().get<ILootboxesFileConfig>("/api/fe/config/rocket-wheel-config-segments");

        return data;
    } catch (err) {
        log.error("LOAD_MOCK_SECTIONS_ROCKET_WHEEL_ERROR", err);
        throw err;
    }
}

export async function getLootboxes() {
    try {
        const { data } = await http().get<ILootbox[]>("/api/player/lootboxes");

        return data;
    } catch (err) {
        log.error("LOAD_LOOTBOXES_LIST_ERROR", err);
        throw err;
    }
}

export async function activateLootbox(id: number) {
    try {
        const { data } = await http().post(`/api/player/lootboxes/${id}/activation`);

        return data;
    } catch (err) {
        log.error("LOAD_PRIZE_OF_LOOTBOX_ERROR", err);
    }
}

export async function loadPageContentFromCmsReq(slugPage: UserGroup): Promise<IPageItemCMS | void> { // TODO: rename
    try {
        const { data } = await http().get<IPageItemCMS>(`/api/cms/pages/${ slugPage }`);
        return data;
    } catch (err) {
        log.error("LOAD_PAGE_CONTENT_FORM_CMS_REQ_ERROR", err);
    }
}

export async function loadPageContentFromWheelCmsReq(userId: UserGroup): Promise<IPageItemCMS | void> {
    try {
        const { data } = await http().get<IPageItemCMS>(`/api/cms/pages/rocket-wheel/${ userId }`);
        return data;
    } catch (err) {
        log.error("LOAD_PAGE_CONTENT_FORM_CMS_REQ_ERROR", err);
    }
}
