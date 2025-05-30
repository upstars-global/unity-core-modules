import { log } from "../../../controllers/Logger";
import type { IStagByReferName, ISurveyConfig } from "../../../models/configs";
import type { IGiftModifyConfig } from "../DTO/gifts";
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
const loadModifyGiftsConfigReq = () =>
    loadConfig<IGiftModifyConfig[]>("/api/fe/config/modify-gifts-config", "LOAD_MODIFY_GIFTS_CONFIG_ERROR");
const loadManagersConfigReq = (userGroups) => loadConfig("/api/fe/config/managers", "LOAD_MANAGERS_CONFIG_ERROR", { userGroups });
const loadExcludedPromoStagsReq = () =>
    loadConfig<string[]>("/api/fe/config/excluded-promo-stags", "LOAD_EXCLUDED_PROMO_STAGS_CONFIG_ERROR");
const loadCurrencyConfigReq = () => loadConfig<string[]>("/api/fe/config/currency-config", "LOAD_CURRENCY_CONFIG_ERROR");
const loadFooterPaymentsConfigReq = () =>
    loadConfig<string[]>("/api/fe/config/footer-payments-config", "LOAD_FOOTER_PAYMENTS_CONFIG_ERROR");
const loadMainWidgetConfigReq = () => loadConfig<string[]>("/api/fe/config/main-widget-config", "LOAD_MAIN_WIDGET_CONFIG_ERROR");

export {
    loadBettingConfigReq,
    loadCurrencyConfigReq,
    loadDisabledBonusesConfigReq,
    loadExcludedPromoStagsReq,
    loadFooterPaymentsConfigReq,
    loadMainWidgetConfigReq,
    loadManagersConfigReq,
    loadModifyGiftsConfigReq,
    loadStagByReferNameReq,
    loadSurveyConfigReq,
    loadVipAdventuresConfigReq };
