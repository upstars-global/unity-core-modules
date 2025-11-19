import { storeToRefs } from "pinia";

import { isExistData } from "../helpers/isExistData";
import { isServer } from "../helpers/ssrHelpers";
import { useCommon } from "../store/common";
import { usePWA } from "../store/pwa";
import { useUserInfo } from "../store/user/userInfo";
import type { PWAEvent } from "./api/DTO/PWAEvent";
import { fetchCurrentIPReq, sendPWAEventReq } from "./api/requests/common";
import { loadStagByReferNameReq } from "./api/requests/configs";
import { loadCountriesReq, loadCryptoExchangeRatesReq, loadCurrenciesReq, loadProjectInfoReq } from "./api/requests/info";

export async function loadCurrentIP() {
    const commonStore = useCommon();
    const data = await fetchCurrentIPReq();

    if (data) {
        commonStore.setCurrentIpInfo(data);
    }
}

export function checkIsNativePWA() {
    if (!isServer) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("pwaType") === "native";
    }
}

export async function subscribeToStandaloneMQL() {
    if (!isServer) {
        const pwaStore = usePWA();

        let hasBeenSent = false;

        pwaStore.setIsPWA(); // setting default state;

        if (pwaStore.isPWA) {
            await sendPWAEvent("open");
            hasBeenSent = true;
        }

        const standaloneMediaQuery = window.matchMedia("(display-mode: standalone)");

        standaloneMediaQuery.addEventListener("change", async (event) => {
            pwaStore.setIsPWA(event.matches);
            if (event.matches && !hasBeenSent) {
                await sendPWAEvent("open");
                hasBeenSent = true;
            }
        });
    }
}

export async function sendPWAEvent(event: PWAEvent) {
    const userStore = useUserInfo();
    const isNativePWA = checkIsNativePWA();
    if (userStore.getIsLogged && isNativePWA) {
        await sendPWAEventReq(event);
    }
}

export async function loadStagByReferName() {
    const commonStore = useCommon();
    const { stagsByReferName } = storeToRefs(commonStore);

    if (stagsByReferName.value) {
        return stagsByReferName.value;
    }

    const data = await loadStagByReferNameReq();

    if (data) {
        commonStore.setStagByReferName(data);
    }

    return data;
}

export async function loadCountries({ reload } = { reload: false }) {
    const commonStore = useCommon();
    const { countries } = storeToRefs(commonStore);

    if (!reload && isExistData(countries.value)) {
        return countries.value;
    }

    const data = await loadCountriesReq();

    if (data) {
        commonStore.setCountries(data);
    }
}

export async function loadCurrencies() {
    const commonStore = useCommon();
    const { currencies, enableCurrencies } = storeToRefs(commonStore);

    if (isExistData(currencies.value)) {
        return;
    }

    const data = await loadCurrenciesReq();

    if (data) {
        const enabledCurrencies = data.filter(({ code }) => enableCurrencies.value.includes(code));

        commonStore.setCurrencies(enabledCurrencies);
    }
}

export async function loadProjectInfo(): Promise<void> {
    const commonStore = useCommon();
    const { infoProject } = storeToRefs(commonStore);

    if (isExistData(infoProject.value)) {
        return;
    }

    const data = await loadProjectInfoReq();

    if (data) {
        commonStore.setProjectInfo(data);
    }
}

export async function loadCryptoExchangeRates(): Promise<void> {
    const commonStore = useCommon();
    const { cryptoExchangeRates } = storeToRefs(commonStore);

    if (isExistData(cryptoExchangeRates.value)) {
        return;
    }

    const data = await loadCryptoExchangeRatesReq();

    if (data) {
        commonStore.setCryptoExchangeRates(data);
    }
}
