import { cioIdentifyUser } from "@controllers/CustomerIO";
import { useUserTermsAcceptingPopup } from "@controllers/userTermsAcceptingPopup";
import { usePopupNewProvider } from "@modules/Popups/PopupProviderNew/usePopupNewProviderController";
import { getStateByCounty } from "@theme/configs/stateFieldConfig";
import type { Pinia } from "pinia";
import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { Currencies } from "../../models/enums/currencies";
import type { IUserData, IUserInfo } from "../../models/user";
import { EventBus as bus } from "../../plugins/EventBus";
import type { IPlayerStats, ISubscriptions, IUserSettings } from "../../services/api/DTO/playerDTO";
import {
    addPlayerToGroup, confirmEmailResendReg, confirmPlayerReq, loadFreshChatRestoreIdReq, loadUserBettingBonuses,
    loadUserProfileReq,
    loadUserSettingsReq, loadUserStatsReq, loadUserSubscriptionsReq,
    putUserSubscriptionReq, restorePasswordRequestReq, restorePasswordRestoreReq, sendFreshChatRestoreIdReq,
    sendUserDataReq, updateAuthDetailsProvidersReq,
} from "../../services/api/requests/player";
import { updateLocale } from "../../services/localization.service";
import { EnumContextFields, EnumFormFields } from "../../types/common";
import { useCommon } from "../common";

const defaultUser: IUserData = {
    user_id: "",
    level: 1,
    hash: "",
    userDataIsSet: false,
    dataIsLoaded: false,
    dataUserLoadedOneTime: false,

    // data from SS
    id: "",
    email: "",
    auth_fields_missed: [],
    statuses: [],
    created_at: "",
    current_sign_in_at: "",
    confirmed_at: "",
    deposit_bonus_code: null,
    can_issue_bonuses: null,
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

    const getUserInfo = computed<IUserInfo>(() => {
        return info.value;
    });

    const getUserBettingBonuses = computed<IUserInfo>(() => {
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
            const stateForEdit = getStateByCounty(info.value.country, userPostCode);
            if (stateForEdit) {
                await sendUserData({
                    context: "edition",
                    player: { state: stateForEdit },
                });
            }
        }
    }

    async function putUserSubscription(data) {
        await putUserSubscriptionReq(data);
        return loadUserSubscriptions({ reload: false });
    }

    async function loadUserProfile({ reload = false, route } = {}) {
        const { checkToShowPopup } = usePopupNewProvider();
        const { runShowingTermsPopup } = useUserTermsAcceptingPopup();
        const multilang = useMultilang();

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

                loadFreshChatRestoreId();

                useCommon().loadPlayerFieldsInfo({ reload: true })
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

    // TODO: move and remove
    async function userSetToGroupForAbTest() {
        const ID_GROUP_FOR_PAIRED_ID = 543;
        const ID_GROUP_FOR_UNPAIRED_ID = 544;
        const userStatuses = useUserStatuses();
        const isUserIncludingInAB = userStatuses.getUserGroups.some((id) => {
            return id === ID_GROUP_FOR_PAIRED_ID || id === ID_GROUP_FOR_UNPAIRED_ID;
        });
        if (isUserIncludingInAB) {
            return;
        }
        const groupForAdding = info.value.id % 2 ? ID_GROUP_FOR_UNPAIRED_ID : ID_GROUP_FOR_PAIRED_ID;

        await addPlayerToGroup(groupForAdding);
    }

    async function sendUserData(data) {
        const resp = await sendUserDataReq(data);
        info.value.saved = true;
        await loadUserProfile({ reload: true });
        return resp;
    }

    async function restorePasswordRequest(payload) {
        try {
            return await restorePasswordRequestReq(payload);
        } catch (err) {
            throw err.response;
        }
    }

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
            dataForConfirm.user.captcha = captcha;
        }

        return await confirmEmailResendReg(dataForConfirm);
    }

    async function updateAuthDetailsProviders(data) {
        return await updateAuthDetailsProvidersReq(data);
    }

    async function loadFreshChatRestoreId() {
        setFreshChatRestoreIdLoaded(false);
        const data = await loadFreshChatRestoreIdReq(info.value.user_id);

        const restoreId = data?.restoreId;

        if (restoreId) {
            freshchatRestoreId.value = restoreId.trim();
        }
        setFreshChatRestoreIdLoaded();
    }

    async function sendFreshChatRestoreId(restoreId: string) {
        // to prevent override restore id when it is not initialized yet
        if (freshchatRestoreIdLoaded.value || restoreId === freshchatRestoreId.value) {
            return;
        }

        freshchatRestoreId.value = restoreId;
        setFreshChatRestoreIdLoaded();
        await sendFreshChatRestoreIdReq(info.value.user_id, restoreId);
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
        userSetToGroupForAbTest,
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
