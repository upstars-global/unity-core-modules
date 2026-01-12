import { FE_API_PREFIX } from "../../../consts/apiConfig";
import { log } from "../../../controllers/Logger";
import { type CurrencyData } from "../../../models/cashbox";
import { type IStagByReferName, type ISurveyConfig } from "../../../models/configs";
import { type IBettingConfig } from "../../../models/configs";
import { type IEnabledGames } from "../../../models/game";
import { type MainWidgetItem } from "../../../models/mainWidget";
import { type IProvidersList } from "../../../models/providers";
import { type UserGroup } from "../../../models/user";
import { type IVipManager } from "../../../models/vipManagers";
import { type ICashboxPresets } from "../DTO/cashbox";
import { IDailyGiftConfig, type IGiftModifyConfig } from "../DTO/gifts";
import { type IVipProgramConfigDTO } from "../DTO/levels";
import { type IVipAdventuresConfig } from "../DTO/vipAdventuresDTO";
import { http } from "../http";

const loadConfig = async <T>(endpoint: string, logError: string, params?: unknown): Promise<T | undefined> => {
    try {
        const { data } = await (params ? http().post<T>(endpoint, params) : http().get<T>(endpoint));

        return data;
    } catch (err) {
        log.error(logError, err);
        return undefined;
    }
};

const loadStagByReferNameReq = () => loadConfig<IStagByReferName>(
    `${ FE_API_PREFIX }/config/stag-by-referrer-name`,
    "LOAD_STAG_BY_REFER_NAME_CONFIG",
);
const loadSurveyConfigReq = () => loadConfig<ISurveyConfig>(
    `${ FE_API_PREFIX }/config/survey-config`,
    "LOAD_SURVEY_CONFIG_ERROR");
const loadBettingConfigReq = () => loadConfig<IBettingConfig>(
    `${ FE_API_PREFIX }/config/betting-config`,
    "LOAD_BETTING_CONFIG_ERROR",
);
const loadVipAdventuresConfigReq = () => loadConfig<IVipAdventuresConfig>(
    `${ FE_API_PREFIX }/config/vip-adventures`,
    "LOAD_VIP_ADVENTURES_CONFIG_ERROR",
);
const loadDisabledBonusesConfigReq = () => loadConfig<{ group_keys: string[] }>(
    `${ FE_API_PREFIX }/config/disabled-bonuses`,
    "LOAD_DISABLED_BONUSES_CONFIG_ERROR",
);
const loadModifyGiftsConfigReq = () => loadConfig<IGiftModifyConfig[]>(
    `${ FE_API_PREFIX }/config/modify-gifts-config`,
    "LOAD_MODIFY_GIFTS_CONFIG_ERROR",
);
const loadManagersConfigReq = (userGroups: UserGroup[]) => loadConfig<IVipManager>(
    `${ FE_API_PREFIX }/config/managers`,
    "LOAD_MANAGERS_CONFIG_ERROR", { userGroups },
);
const loadExcludedPromoStagsReq = () => loadConfig<string[]>(
    `${ FE_API_PREFIX }/config/excluded-promo-stags`,
    "LOAD_EXCLUDED_PROMO_STAGS_CONFIG_ERROR",
);
const loadCurrencyConfigReq = () => loadConfig<CurrencyData>(
    `${ FE_API_PREFIX }/config/currency-config`,
    "LOAD_CURRENCY_CONFIG_ERROR",
);
const loadFooterPaymentsConfigReq = () => loadConfig<string[]>(
    `${ FE_API_PREFIX }/config/footer-payments-config`,
    "LOAD_FOOTER_PAYMENTS_CONFIG_ERROR",
);
const loadAdditionalDepositGiftsConfigReq = () => loadConfig(
    `${ FE_API_PREFIX }/config/additional-gifts`,
    "LOAD_ADDITIONAL_DEPOSIT_GIFTS_CONFIG_ERROR",
);
const loadMainWidgetConfigReq = () => loadConfig<{ widgets?: MainWidgetItem[] }>(
    `${ FE_API_PREFIX }/config/main-widget-config`,
    "LOAD_MAIN_WIDGET_CONFIG_ERROR",
);
const loadVipProgramConfigReq = () => loadConfig<IVipProgramConfigDTO>(
    `${ FE_API_PREFIX }/config/vip-program-config`,
    "LOAD_VIP_PROGRAM_REWARDS_CONFIG_ERROR",
);
const loadDisabledProvidersConfigReq = () => loadConfig<IProvidersList>(
    `${ FE_API_PREFIX }/config/providers-config`,
    "LOAD_PROVIDERS_CONFIG_ERROR",
);
const loadEnabledGamesConfigReq = () => loadConfig<IEnabledGames>(
    `${ FE_API_PREFIX }/config/enable-games-config`,
    "LOAD_ENABLED_GAMES_CONFIG_ERROR",
);
const loadCashboxPresetsReq = () => loadConfig<ICashboxPresets[]>(
    "/api/fe/config/cashbox-presets",
    "LOAD_CASHBOX_PRESETS_ERROR",
);
const loadDailyBonusConfigReq = () => loadConfig<Record<string, IDailyGiftConfig>>(
    "/api/fe/config/daily-bonus-config",
    "LOAD_DAILY_BONUS_CONFIG_ERROR",
);

export {
    loadAdditionalDepositGiftsConfigReq,
    loadBettingConfigReq,
    loadCashboxPresetsReq,
    loadCurrencyConfigReq,
    loadDailyBonusConfigReq,
    loadDisabledBonusesConfigReq,
    loadDisabledProvidersConfigReq,
    loadEnabledGamesConfigReq,
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
