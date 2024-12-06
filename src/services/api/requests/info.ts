import log from "../../../controllers/Logger";
import { ICountries, ICryptoExchangeRates, ICurrencies, IProjectInfo } from "../DTO/info";
import { http } from "../http";

export async function loadCountriesReq(): Promise<ICountries[] | undefined> {
    try {
        const { data } = await http().get<ICountries[]>("/api/info/countries");
        return data;
    } catch (err) {
        log.error("LOAD_COUNTRIES_ERROR", err);
    }
}

export async function loadCurrenciesReq(): Promise<ICurrencies[] | undefined> {
    try {
        const { data } = await http().get<ICurrencies[]>("/api/info/currencies");
        return data;
    } catch (err) {
        log.error("LOAD_CURRENCIES_ERROR", err);
    }
}

export async function loadProjectInfoReq(): Promise<IProjectInfo | undefined> {
    try {
        const { data } = await http().get<IProjectInfo>("/api/info/project");
        return data;
    } catch (err) {
        log.error("LOAD_PROJECT_INFO_ERROR", err);
    }
}

export async function loadCryptoExchangeRatesReq(): Promise<ICryptoExchangeRates | undefined> {
    try {
        const { data } = await http().get<ICryptoExchangeRates>("/api/info/crypto_exchange_rates");
        return data;
    } catch (err) {
        log.error("LOAD_CRYPTO_EXCHANGE_RATES_ERROR", err);
    }
}
