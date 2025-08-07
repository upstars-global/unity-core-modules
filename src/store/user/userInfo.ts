import { usePopupNewProvider } from "@modules/Popups/PopupProviderNew/usePopupNewProviderController";
import { PROJECT } from "@theme/configs/constantsFreshChat";
import { getStateByCounty } from "@theme/configs/stateFieldConfig";
import { defineStore, type Pinia, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { cioIdentifyUser } from "../../controllers/CustomerIO";
import { useUserTermsAcceptingPopup } from "../../controllers/userTermsAcceptingPopup";
import { EnumContextFields, EnumFormFields } from "../../models/common";
import { Currencies } from "../../models/enums/currencies";
import { BettingPlayerSettings } from "../../models/player";
import type { IUserData } from "../../models/user";
import { EventBus as bus } from "../../plugins/EventBus";
import type { IPlayerStats, ISubscriptions, IUserSettings } from "../../services/api/DTO/playerDTO";
import {
    confirmEmailResendReg, confirmPlayerReq,
    loadFreshChatRestoreIdReq, loadUserBettingBonuses,
    loadUserProfileReq,
    loadUserSettingsReq, loadUserStatsReq, loadUserSubscriptionsReq,
    putUserSubscriptionReq, restorePasswordRequestReq, restorePasswordRestoreReq, sendFreshChatRestoreIdReq,
    sendUserDataReq, updateAuthDetailsProvidersReq,
} from "../../services/api/requests/player";
import { updateLocale } from "../../services/localization";
import { loadPlayerFieldsInfo } from "../../services/user";
import { useCommon } from "../common";
import { useMultilangStore } from "../multilang";

const defaultUser: IUserData = {
    user_id: "",
    level: 1,
    hash: "",
    userDataIsSet: false,
    dataIsLoaded: false,
    dataUserLoadedOneTime: false,
    // @ts-expect-error Type 'null' is not assignable to type 'number'
    id: null,
    email: "",
    auth_fields_missed: [],
    statuses: [],
    created_at: "",
    current_sign_in_at: "",
    confirmed_at: "",
    deposit_bonus_code: null,
    can_issue_bonuses: false,
    profession: null,
    autoregistered: false,
    autologin_link: null,
    verified: false,
    license_name: "",
    sow_questionnaire_expires_at: null,
    two_factor_enabled: false,
    address: null,
    nickname: null,
    gender: null,
    receive_promos: false,
    city: null,
    first_name: null,
    receive_sms_promos: false,
    postal_code: null,
    country: null,
    date_of_birth: null,
    last_name: null,
    currency: "",
    language: "",
    sumsub_verified: null,
};

export const useUserInfo = defineStore("userInfo", () => {
    const useCommonStore = useCommon();
    const { getDefaultCurrency, getCurrencyCrypto } = storeToRefs(useCommonStore);

    const info = ref<IUserData>(defaultUser);
    const settings = ref<IUserSettings>();
    const isLoadedUsedData = ref<boolean>(false);
    const freshchatRestoreIdLoaded = ref<boolean>(false);
    const freshchatRestoreId = ref<string>("");
    const isLogged = ref<boolean>(false);
    const subscriptions = ref<ISubscriptions>();
    const notice = ref<unknown[]>([]);
    const stats = ref<IPlayerStats>();
    const bettingBonuses = ref([]);
    const bettingPlayerSettings = ref<BettingPlayerSettings>({
        oddsTypes: [],
        selectedOddsType: "european",
    });

    const getUserInfo = computed(() => {
        return info.value;
    });

    const getUserBettingBonuses = computed(() => {
        return bettingBonuses.value;
    });

    const getUserSumsubVerified = computed(() => {
        return getUserInfo.value.sumsub_verified;
    });
    const getUserSubscriptions = computed(() => {
        return subscriptions.value;
    });
    const getUserCurrency = computed(() => {
        return info.value.currency || getDefaultCurrency.value;
    });

    const getIsLogged = computed(() => {
        return isLogged.value;
    });
    const getNotice = computed(() => {
        return notice.value;
    });
    const getSettings = computed(() => {
        return settings.value;
    });
    const getFreshChatRestoreIdLoaded = computed(() => {
        return freshchatRestoreIdLoaded.value;
    });
    const getFreshChatRestoreId = computed(() => {
        return freshchatRestoreId.value;
    });

    const isCryptoUserCurrency = computed(() => {
        return getCurrencyCrypto.value.includes(getUserCurrency.value);
    });

    const getIsUserLoadedOneTime = computed(() => {
        return info.value.dataUserLoadedOneTime;
    });
    const getDataIsLoaded = computed(() => {
        return info.value.dataIsLoaded;
    });
    const getUserNickName = computed(() => {
        return info.value.nickname ? info.value.nickname : info.value.email;
    });
    const getIsLoadedUsedData = computed(() => {
        return isLoadedUsedData.value;
    });
    const getPlayerStats = computed(() => {
        return stats.value;
    });

    // @ts-expect-error Parameter 'data' implicitly has an 'any' type.
    function setUserData(data) {
        const payload = {
            ...data,
            nick_name: data.nickname || data.email,
            locale: data.language,
            user_id: data.id,
            userDataIsSet: Boolean(data.first_name),
            dataIsLoaded: true,
        };
        info.value = Object.assign({}, info.value, payload);
        isLoadedUsedData.value = true;
    }

    // @ts-expect-error Parameter 'userGroup' implicitly has an 'any' type.
    function addUserGroup(userGroup) {
        info.value.statuses.push(userGroup);
    }

    function clearUserData() {
        info.value = defaultUser;
        isLogged.value = false;
        notice.value = [];
    }

    function toggleUserIsLogged(status: boolean) {
        isLogged.value = status;
    }

    function setFreshChatRestoreIdLoaded(status: boolean = true) {
        freshchatRestoreIdLoaded.value = status;
    }

    // @ts-expect-error Parameter 'newStatus' implicitly has an 'any' type.
    function addUserStatuses(newStatus) {
        info.value.statuses = [
            info.value.statuses.filter(({ id }) => {
                return Number(id) !== newStatus.id;
            }),
            newStatus,
        ];
    }

    async function checkUserState() {
        const stateFieldConfig = useCommonStore.getFieldsType(EnumContextFields.edition, EnumFormFields.state);
        const userState = getUserInfo.value.state;
        const userPostCode = getUserInfo.value.postal_code;

        if (stateFieldConfig && !userState && userPostCode) {
            const stateForEdit = getStateByCounty(info.value.country as string, userPostCode);
            if (stateForEdit) {
                await sendUserData({
                    context: "edition",
                    player: { state: stateForEdit },
                });
            }
        }
    }

    // @ts-expect-error Parameter 'data' implicitly has an 'any' type.
    async function putUserSubscription(data) {
        await putUserSubscriptionReq(data);
        return loadUserSubscriptions({ reload: true });
    }

    async function loadUserProfile({ reload = false, route }: { reload?: boolean; route?: string } = {}) {
        const { checkToShowPopup } = usePopupNewProvider();
        const { runShowingTermsPopup } = useUserTermsAcceptingPopup();
        const multilang = useMultilangStore();

        const profile = info.value;
        if (profile.id && !reload) {
            cioIdentifyUser(profile);
            return { data: profile };
        }

        info.value.dataIsLoaded = false;
        try {
            const response = await loadUserProfileReq();
            if (response) {
                setUserData(response.data);

                runShowingTermsPopup();

                const responseLang = response.data.language;

                if (responseLang !== multilang.getUserLocale && response.data.id) {
                    // @ts-expect-error 'route' does not exist in type '{ lang: string; }'
                    updateLocale({ lang: responseLang, route });
                }

                if (!response.data.id) {
                    setFreshChatRestoreIdLoaded();
                    toggleUserIsLogged(false);
                    return;
                }
                toggleUserIsLogged(true);

                bus.$emit("user.data.received");
                bus.$emit("user.login", response.data);
                cioIdentifyUser(response.data);
                checkToShowPopup();

                loadFreshChatRestoreId(PROJECT);

                loadPlayerFieldsInfo({ reload: true })
                    .then(checkUserState);
            }

            return response;
        } finally {
            info.value.dataIsLoaded = true;
            info.value.dataUserLoadedOneTime = true;
        }
    }

    async function loadUserSettings() {
        const data = await loadUserSettingsReq();
        if (data) {
            settings.value = data;
        }

        return data;
    }

    // @ts-expect-error Parameter 'data' implicitly has an 'any' type.
    async function sendUserData(data) {
        const resp = await sendUserDataReq(data);
        // @ts-expect-error Property 'saved' does not exist on type
        info.value.saved = true;
        await loadUserProfile({ reload: true });
        return resp;
    }

    // @ts-expect-error Parameter 'data' implicitly has an 'any' type.
    async function restorePasswordRequest(payload) {
        try {
            return await restorePasswordRequestReq(payload);
        } catch (err) {
            // @ts-expect-error 'err' is of type 'unknown'.
            throw err.response;
        }
    }

    // @ts-expect-error Parameter 'data' implicitly has an 'any' type.
    async function restorePasswordRestore(payload) {
        return await restorePasswordRestoreReq(payload);
    }

    async function confirmPlayer(token: string) {
        return await confirmPlayerReq(token);
    }

    async function confirmEmailResend(captcha: string) {
        const dataForConfirm = {
            user: { email: info.value.email },
        };

        if (captcha) {
            // @ts-expect-error Property 'captcha' does not exist on type '{ email: string; }'
            dataForConfirm.user.captcha = captcha;
        }

        return await confirmEmailResendReg(dataForConfirm);
    }

    // @ts-expect-error Parameter 'data' implicitly has an 'any' type.
    async function updateAuthDetailsProviders(data) {
        return await updateAuthDetailsProvidersReq(data);
    }

    async function loadFreshChatRestoreId(project: string) {
        setFreshChatRestoreIdLoaded(false);
        const { data } = await loadFreshChatRestoreIdReq(info.value.user_id, project);

        const restoreId = data?.restoreId;

        if (restoreId) {
            freshchatRestoreId.value = restoreId.trim();
        }
        setFreshChatRestoreIdLoaded();
    }

    async function sendFreshChatRestoreId(restoreId: string, project: string) {
        // to prevent override restore id when it is not initialized yet
        if (!freshchatRestoreIdLoaded.value || restoreId === freshchatRestoreId.value) {
            return;
        }

        freshchatRestoreId.value = restoreId;
        setFreshChatRestoreIdLoaded();
        await sendFreshChatRestoreIdReq(info.value.user_id, restoreId, project);
    }

    async function loadUserSubscriptions({ reload = false }) {
        if (!reload && subscriptions.value) {
            return Promise.resolve(subscriptions.value);
        }

        const data = await loadUserSubscriptionsReq();

        if (data) {
            subscriptions.value = data;
            info.value = { ...info.value, ...subscriptions };
        }

        return data;
    }

    async function loadUserStats() {
        const data = await loadUserStatsReq();

        if (data) {
            stats.value = data;
        }
        return data;
    }

    async function loadUserBonuses() {
        const data = await loadUserBettingBonuses();

        if (data) {
            bettingBonuses.value = data;
        }
        return data;
    }

    const getSubunitsToUnitsByCode = (codeProp?: Currencies) => {
        const { currencies } = storeToRefs(useCommonStore);
        const currencyInfo = currencies.value.find(({ code }) => {
            return code === (codeProp || getUserInfo.value?.currency);
        });

        return currencyInfo?.subunits_to_unit;
    };

    function setBettingPlayerSettings(data: BettingPlayerSettings) {
        bettingPlayerSettings.value = data;
    }

    return {
        getUserInfo,
        getUserSumsubVerified,
        checkUserState,
        info,
        isLogged,
        getUserCurrency,
        isCryptoUserCurrency,
        getIsLogged,
        getNotice,
        getSettings,
        getFreshChatRestoreIdLoaded,
        getFreshChatRestoreId,
        getUserSubscriptions,
        getIsUserLoadedOneTime,
        getDataIsLoaded,
        getUserNickName,
        getIsLoadedUsedData,
        getUserBettingBonuses,
        getPlayerStats,
        getSubunitsToUnitsByCode,

        toggleUserIsLogged,
        setUserData,
        addUserGroup,
        clearUserData,
        addUserStatuses,

        putUserSubscription,
        loadUserSettings,
        loadUserProfile,
        sendUserData,
        restorePasswordRequest,
        restorePasswordRestore,
        confirmPlayer,
        confirmEmailResend,
        updateAuthDetailsProviders,
        sendFreshChatRestoreId,
        loadUserBonuses,
        loadUserStats,
        loadUserSubscriptions,

        bettingPlayerSettings,
        setBettingPlayerSettings,
    };
});

export function useUserInfoFetchService(pinia?: Pinia) {
    useUserInfo(pinia);

    function loadUserInfo() {
        return Promise.resolve();
    }

    return {
        loadUserInfo,
    };
}
