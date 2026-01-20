import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CurrencyData } from "../../src/models/cashbox";
import { EnumContextFields, EnumFormFields, type IPlayerFieldsInfo } from "../../src/models/common";
import type { IStagByReferName } from "../../src/models/configs";
import { Currencies } from "../../src/models/enums/currencies";
import { type MainWidgetItem, Widgets } from "../../src/models/mainWidget";
import { createUnityConfigPlugin } from "../../src/plugins/ConfigPlugin";
import type { ICurrentIP } from "../../src/services/api/DTO/current-ip";
import type { ICountries, ICryptoExchangeRates, ICurrencies, IProjectInfo } from "../../src/services/api/DTO/info";
import { UserAccountLicense } from "../../src/services/api/DTO/playerDTO";
import { useCommon } from "../../src/store/common";
import { useMultilangStore } from "../../src/store/multilang";
import { baseUnityConfig } from "../mocks/unityConfig";

const referrers = {
    GOOGLE: "google",
    BING: "bing",
    YAHOO: "yahoo",
};

const mockGetUserAgentPlatform = vi.fn<() => Promise<{ isMobile: boolean; transitionName: string }>>();

vi.mock("../../src/helpers/userAgentPlatform", () => ({
    getUserAgentPlatform: () => mockGetUserAgentPlatform(),
}));

const globalWithWindow = globalThis as typeof globalThis & { window?: unknown };
const originalWindow = globalWithWindow.window;
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("useCommon store", () => {
    beforeEach(() => {
        const pinia = createPinia();
        pinia.use(createUnityConfigPlugin(baseUnityConfig));
        setActivePinia(pinia);
        vi.clearAllMocks();
        mockGetUserAgentPlatform.mockResolvedValue({
            isMobile: true,
            transitionName: "slide-left",
        });
        globalWithWindow.window = originalWindow;
    });

    afterEach(() => {
        globalWithWindow.window = originalWindow;
    });

    it("initializes with config defaults", () => {
        const store = useCommon();

        expect(store.enableCurrencies).toEqual(baseUnityConfig.ENABLE_CURRENCIES);
        expect(store.getAllCurrencies).toEqual([]);
        expect(store.countries).toEqual([]);
        expect(store.widgetsConfig).toEqual([]);
        expect(store.currencyConfig).toBeNull();
        expect(store.getDefaultCurrency).toBe(baseUnityConfig.currencyDefault);
    });

    it("setDefaultOptions overrides defaults without mutating source data", () => {
        const store = useCommon();
        const enableCurrencies = [ Currencies.USD, Currencies.BTC ];

        store.setDefaultOptions({
            defaultCurrency: Currencies.USD,
            enableCurrencies,
        });

        expect(store.getDefaultCurrency).toBe(Currencies.USD);
        expect(store.enableCurrencies).toEqual(enableCurrencies);

        enableCurrencies.push(Currencies.EUR);
        expect(store.enableCurrencies).toEqual([ Currencies.USD, Currencies.BTC ]);
    });

    it("getDefaultCurrency uses ip currency when it is allowed", () => {
        const store = useCommon();
        const ipInfo: ICurrentIP = {
            ip: "127.0.0.1",
            country_code: "CA",
            region_code: null,
            default_currency: Currencies.CAD,
        };

        store.setCurrentIpInfo(ipInfo);

        expect(store.getDefaultCurrency).toBe(Currencies.CAD);
    });

    it("getDefaultCurrency falls back to config when ip currency is filtered out", () => {
        const store = useCommon();

        store.setCurrentIpInfo({
            ip: "127.0.0.1",
            country_code: "BR",
            region_code: null,
            default_currency: Currencies.BTC,
        });

        expect(store.getDefaultCurrency).toBe(baseUnityConfig.currencyDefault);
    });

    it("reorders countries so that user geo goes first", () => {
        const store = useCommon();
        const multilang = useMultilangStore();
        multilang.geo = "BR";
        const countries: ICountries[] = [
            { name: "Canada", code: "CA", default_currency: Currencies.CAD },
            { name: "Brazil", code: "BR", default_currency: Currencies.BRL },
            { name: "Germany", code: "DE", default_currency: Currencies.EUR },
        ];

        store.setCountries(countries);

        expect(store.countries[0].code).toBe("CA");
        const prepared = store.getCountries;

        expect(prepared[0].code).toBe("BR");
        expect(prepared).toHaveLength(countries.length);
    });

    it("exposes helpers for player fields info", () => {
        const store = useCommon();
        const contexts = (Object.values(EnumContextFields) as EnumContextFields[]).reduce((acc, contextKey) => {
            acc[contextKey] = [];
            return acc;
        }, {} as Record<EnumContextFields, EnumFormFields[]>);

        contexts[EnumContextFields.registration] = [ EnumFormFields.first_name, EnumFormFields.state ];

        const playerFieldsInfo: IPlayerFieldsInfo = {
            fields: [
                { field: EnumFormFields.first_name, type: "text" },
                { field: EnumFormFields.state, type: "select" },
            ],
            contexts: {
                ...contexts,
                payment_systems: {} as IPlayerFieldsInfo["contexts"]["payment_systems"],
            },
        };

        store.setPlayerFieldsInfo(playerFieldsInfo);

        expect(store.hasFieldsInContext(EnumContextFields.registration, EnumFormFields.state)).toBe(true);
        expect(store.hasFieldsInContext(EnumContextFields.deposit, EnumFormFields.state)).toBe(false);
        expect(store.getFieldsType(EnumContextFields.registration, EnumFormFields.state)).toEqual(playerFieldsInfo.fields[1]);
    });

    it("classifies currencies into fiat and crypto buckets", () => {
        const store = useCommon();
        const currencies: ICurrencies[] = [
            {
                code: Currencies.USD,
                symbol: "$",
                subunits_to_unit: 100,
                fiat: true,
                default: true,
                subcurrencies: [],
            },
            {
                code: Currencies.BTC,
                symbol: "₿",
                subunits_to_unit: 100000000,
                fiat: false,
                default: false,
                subcurrencies: [],
            },
            {
                code: Currencies.ETH,
                symbol: "Ξ",
                subunits_to_unit: 100000000,
                fiat: false,
                default: false,
                subcurrencies: [],
            },
        ];

        store.setCurrencies(currencies);

        expect(store.getAllCurrencies).toEqual(currencies);
        expect(store.getCurrencyFiat).toEqual([ Currencies.USD ]);
        expect(store.getCurrencyCrypto).toEqual([ Currencies.BTC, Currencies.ETH ]);
        expect(store.isCryptoCurrency(Currencies.BTC)).toBe(true);
        expect(store.isCryptoCurrency(Currencies.USD)).toBe(false);
        expect(store.isCryptoCurrency(Currencies.NZD)).toBe(true);
    });

    it("updates misc configs via dedicated setters", () => {
        const store = useCommon();
        const exchangeRates: ICryptoExchangeRates = {
            [Currencies.EUR]: {
                [Currencies.BTC]: {
                    exchange_rate: 42000,
                    fee: 0.1,
                    total_exchange_rate: 42000.1,
                },
            },
        };
        const currencyConfig: CurrencyData = {
            EUR: {
                defaultAmount: 10,
                rounding: 2,
                steps: [
                    { min: 10, max: 100, step: 10 },
                ],
            },
            AUD: {
                defaultAmount: 0,
                rounding: 0,
                steps: [],
            },
            CAD: {
                defaultAmount: 0,
                rounding: 0,
                steps: [],
            },
            NZD: {
                defaultAmount: 0,
                rounding: 0,
                steps: [],
            },
            USD: {
                defaultAmount: 0,
                rounding: 0,
                steps: [],
            },
            JPY: {
                defaultAmount: 0,
                rounding: 0,
                steps: [],
            },
            NOK: {
                defaultAmount: 0,
                rounding: 0,
                steps: [],
            },
            BRL: {
                defaultAmount: 0,
                rounding: 0,
                steps: [],
            },
            BTC: {
                defaultAmount: 0,
                rounding: 0,
                steps: [],
            },
            ETH: {
                defaultAmount: 0,
                rounding: 0,
                steps: [],
            },
            BCH: {
                defaultAmount: 0,
                rounding: 0,
                steps: [],
            },
            LTC: {
                defaultAmount: 0,
                rounding: 0,
                steps: [],
            },
            DOG: {
                defaultAmount: 0,
                rounding: 0,
                steps: [],
            },
            USDT: {
                defaultAmount: 0,
                rounding: 0,
                steps: [],
            },
        };
        const widgetsConfig: MainWidgetItem[] = [
            { name: "Quest", image: "quest.png", type: Widgets.quest, isNew: true },
        ];
        const projectInfo: IProjectInfo = {
            apps: {
                sportsbook: true,
                casino: true,
            },
            sns_config: {
                enable: true,
                base_url: "https://example.com",
                flow: "default",
            },
            license: UserAccountLicense.CW,
            player_two_factor_auth: true,
            available_currency_exchange: true,
            available_referral_system: false,
            supported_payment_api_versions: [ "v1" ],
            hooyu_integration: false,
            country_flags: null,
            livespins: {
                enabled: true,
            },
            authentication_key: "key",
        };
        const stagsByReferName: IStagByReferName = {
            pages: {
                [referrers.GOOGLE]: {
                    "/": "home",
                },
                [referrers.BING]: {},
                [referrers.YAHOO]: {},
            },
            countries: {
                CA: {
                    [referrers.GOOGLE]: "111",
                    [referrers.BING]: "222",
                    [referrers.YAHOO]: "333",
                },
            },
        };

        store.setCryptoExchangeRates(exchangeRates);
        store.setCurrencyConfig(currencyConfig);
        store.setMainWidgetConfig(widgetsConfig);
        store.setProjectInfo(projectInfo);
        store.setExcludedPromoStags([ "stagA", "stagB" ]);
        store.setStagByReferName(stagsByReferName);

        expect(store.cryptoExchangeRates).toEqual(exchangeRates);
        expect(store.currencyConfig).toEqual(currencyConfig);
        expect(store.widgetsConfig).toEqual(widgetsConfig);
        expect(store.infoProject).toEqual(projectInfo);
        expect(store.excludedPromoStags).toEqual([ "stagA", "stagB" ]);
        expect(store.stagsByReferName).toEqual(stagsByReferName);
    });

    it("resolves platform info when window is available", async () => {
        globalWithWindow.window = {};
        const store = useCommon();

        await flushPromises();

        expect(mockGetUserAgentPlatform).toHaveBeenCalledTimes(1);
        expect(store.isMobile).toBe(true);
    });
});
