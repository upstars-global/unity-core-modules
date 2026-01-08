import { log } from "../../../controllers/Logger";
import { type CurrencyData } from "../../../models/cashbox";
import { type IStagByReferName, type ISurveyConfig } from "../../../models/configs";
import { type IBettingConfig } from "../../../models/configs";
import { type IEnabledGames } from "../../../models/game";
import { type MainWidgetItem } from "../../../models/mainWidget";
import { type IProvidersList } from "../../../models/providers";
import { type UserGroup } from "../../../models/user";
import { type IVipManager } from "../../../models/vipManagers";
import { type ICashboxPresets, IManageWithdrawConfig } from "../DTO/cashbox";
import { type IGiftModifyConfig } from "../DTO/gifts";
import { type IVipProgramConfigDTO } from "../DTO/levels";
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
const loadManagersConfigReq = (userGroups: UserGroup[]) =>
    loadConfig<IVipManager>("/api/fe/config/managers", "LOAD_MANAGERS_CONFIG_ERROR", { userGroups });
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
const loadVipProgramConfigReq = () => loadConfig<IVipProgramConfigDTO>(
    "/api/fe/config/vip-program-config",
    "LOAD_VIP_PROGRAM_REWARDS_CONFIG_ERROR",
);
const loadDisabledProvidersConfigReq = () => loadConfig<IProvidersList>(
    "/api/fe/config/providers-config",
    "LOAD_PROVIDERS_CONFIG_ERROR",
);
const loadEnabledGamesConfigReq = () => loadConfig<IEnabledGames>(
    "/api/fe/config/enable-games-config",
    "LOAD_ENABLED_GAMES_CONFIG_ERROR",
);
const loadCashboxPresetsReq = () => loadConfig<ICashboxPresets[]>(
    "/api/fe/config/cashbox-presets",
    "LOAD_CASHBOX_PRESETS_ERROR",
);
const loadManageWithdrawConfigReq = () => loadConfig<IManageWithdrawConfig>(
    "/api/fe/config/manage-withdraw-config",
    "LOAD_MANAGE_WITHDRAW_CONFIG_ERROR_REQ",
);

export {
    loadAdditionalDepositGiftsConfigReq,
    loadBettingConfigReq,
    loadCashboxPresetsReq,
    loadCurrencyConfigReq,
    loadDisabledBonusesConfigReq,
    loadDisabledProvidersConfigReq,
    loadEnabledGamesConfigReq,
    loadExcludedPromoStagsReq,
    loadFooterPaymentsConfigReq,
    loadMainWidgetConfigReq,
    loadManagersConfigReq,
    loadManageWithdrawConfigReq,
    loadModifyGiftsConfigReq,
    loadStagByReferNameReq,
    loadSurveyConfigReq,
    loadVipAdventuresConfigReq,
    loadVipProgramConfigReq };
