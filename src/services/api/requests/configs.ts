import log from "../../../controllers/Logger";
import type { IStagByReferName, ISurveyConfig } from "../../../models/configs";
import { IVipAdventuresConfig } from "../DTO/vipAdventuresDTO";
import { http } from "../http";

const loadConfig = async <type>(endpoint: string, logError: string, params?:unknown) => {
    try {
        const { data } = await (params ? http().post(endpoint, params) : http().get<type>(endpoint));

        return data;
    } catch (err) {
        log.error(logError, err);
    }
};

const loadStagByReferNameReq = () =>
    loadConfig<IStagByReferName>("/api/fe/config/stag-by-referrer-name", "LOAD_STAG_BY_REFER_NAME_CONFIG");
const loadSurveyConfigReq = () => loadConfig<ISurveyConfig>("/api/fe/config/survey-config", "LOAD_SURVEY_CONFIG_ERROR");
const loadBettingConfigReq = () => loadConfig<string[]>("/api/fe/config/betting-config", "LOAD_BETTING_CONFIG_ERROR");
const loadVipAdventuresConfigReq = () =>
    loadConfig<IVipAdventuresConfig>("/api/fe/config/vip-adventures", "LOAD_VIP_ADVENTURES_CONFIG_ERROR");
const loadDisabledBonusesConfigReq = () =>
    loadConfig<{ group_keys: string[] }>("/api/fe/config/disabled-bonuses", "LOAD_DISABLED_BONUSES_CONFIG_ERROR");

const loadManagersConfigReq = (userGroups) => loadConfig("/api/fe/config/managers", "LOAD_MANAGERS_CONFIG_ERROR", { userGroups });

export {
    loadBettingConfigReq,
    loadDisabledBonusesConfigReq,
    loadManagersConfigReq,
    loadStagByReferNameReq,
    loadSurveyConfigReq,
    loadVipAdventuresConfigReq,
};
