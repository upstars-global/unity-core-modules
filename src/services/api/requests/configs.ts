import { log } from "../../../controllers/Logger";
import { type CurrencyData } from "../../../models/cashbox";
import { type IStagByReferName, type ISurveyConfig } from "../../../models/configs";
import { type IBettingConfig } from "../../../models/configs";
import { type IVipProgramConfig } from "../../../models/levels";
import { type MainWidgetItem } from "../../../models/mainWidget";
import { type IGiftModifyConfig } from "../DTO/gifts";
import { type IVipAdventuresConfig } from "../DTO/vipAdventuresDTO";
import { http } from "../http";

const loadConfig = async <T>(endpoint: string, logError: string, params?:unknown): Promise<T | undefined> => {
    try {
        const { data } = await (params ? http().post<T>(endpoint, params) : http().get<T>(endpoint));

        return data;
    } catch (err) {
        log.error(logError, err);
        return undefined;
    }
};

const loadStagByReferNameReq = () =>
    loadConfig<IStagByReferName>("/api/fe/config/stag-by-referrer-name", "LOAD_STAG_BY_REFER_NAME_CONFIG");
const loadSurveyConfigReq = () => loadConfig<ISurveyConfig>("/api/fe/config/survey-config", "LOAD_SURVEY_CONFIG_ERROR");
const loadBettingConfigReq = () => loadConfig<IBettingConfig>("/api/fe/config/betting-config", "LOAD_BETTING_CONFIG_ERROR");
const loadVipAdventuresConfigReq = () =>
    loadConfig<IVipAdventuresConfig>("/api/fe/config/vip-adventures", "LOAD_VIP_ADVENTURES_CONFIG_ERROR");
const loadDisabledBonusesConfigReq = () =>
    loadConfig<{ group_keys: string[] }>("/api/fe/config/disabled-bonuses", "LOAD_DISABLED_BONUSES_CONFIG_ERROR");
const loadModifyGiftsConfigReq = () =>
    loadConfig<IGiftModifyConfig[]>("/api/fe/config/modify-gifts-config", "LOAD_MODIFY_GIFTS_CONFIG_ERROR");
const loadManagersConfigReq = (userGroups) => loadConfig("/api/fe/config/managers", "LOAD_MANAGERS_CONFIG_ERROR", { userGroups });
const loadExcludedPromoStagsReq = () =>
    loadConfig<string[]>("/api/fe/config/excluded-promo-stags", "LOAD_EXCLUDED_PROMO_STAGS_CONFIG_ERROR");
const loadCurrencyConfigReq = () => loadConfig<CurrencyData>("/api/fe/config/currency-config", "LOAD_CURRENCY_CONFIG_ERROR");
const loadFooterPaymentsConfigReq = () =>
    loadConfig<string[]>("/api/fe/config/footer-payments-config", "LOAD_FOOTER_PAYMENTS_CONFIG_ERROR");
const loadAdditionalDepositGiftsConfigReq = () => loadConfig(
    "/api/fe/config/additional-gifts",
    "LOAD_ADDITIONAL_DEPOSIT_GIFTS_CONFIG_ERROR",
);
const loadMainWidgetConfigReq = () => loadConfig<{widgets?: MainWidgetItem[]}>(
    "/api/fe/config/main-widget-config",
    "LOAD_MAIN_WIDGET_CONFIG_ERROR",
);
const loadVipProgramConfigReq = () => loadConfig<IVipProgramConfig>(
    "/api/fe/config/vip-program-config",
    "LOAD_VIP_PROGRAM_REWARDS_CONFIG_ERROR",
);
const loadDisabledProvidersConfigReq = () => loadConfig<string[]>("/api/fe/config/providers-config", "LOAD_PROFIDERS_CONFIG_ERROR");

export {
    loadAdditionalDepositGiftsConfigReq,
    loadBettingConfigReq,
    loadCurrencyConfigReq,
    loadDisabledBonusesConfigReq,
    loadDisabledProvidersConfigReq,
    loadExcludedPromoStagsReq,
    loadFooterPaymentsConfigReq,
    loadMainWidgetConfigReq,
    loadManagersConfigReq,
    loadModifyGiftsConfigReq,
    loadStagByReferNameReq,
    loadSurveyConfigReq,
    loadVipAdventuresConfigReq,
    loadVipProgramConfigReq,
};
