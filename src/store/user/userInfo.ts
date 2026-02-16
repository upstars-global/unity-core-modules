import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { Currencies } from "../../models/enums/currencies";
import { BettingPlayerSettings } from "../../models/player";
import type { IUserData, IUserStatus } from "../../models/user";
import { ISeasonStartPoints } from "../../models/user";
import type { IPlayerStats, ISubscriptions, IUserSettings } from "../../services/api/DTO/playerDTO";
import { useCommon } from "../common";

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
    const bettingBonuses = ref<unknown[]>([]);
    const bettingPlayerSettings = ref<BettingPlayerSettings>({
        oddsTypes: [],
        selectedOddsType: "european",
    });
    const userStartSeasonInfo = ref<ISeasonStartPoints>();

    const getUserInfo = computed(() => info.value);
    const getUserBettingBonuses = computed(() => bettingBonuses.value);
    const getUserSumsubVerified = computed(() => getUserInfo.value.sumsub_verified);
    const getUserVerified = computed(() => getUserInfo.value.verified);
    const getUserSubscriptions = computed(() => subscriptions.value);
    const getUserCurrency = computed(() => info.value.currency || getDefaultCurrency.value);

    const getIsLogged = computed(() => isLogged.value);
    const getNotice = computed(() => notice.value);
    const getSettings = computed(() => settings.value);
    const getFreshChatRestoreIdLoaded = computed(() => freshchatRestoreIdLoaded.value);
    const getFreshChatRestoreId = computed(() => freshchatRestoreId.value);

    const isCryptoUserCurrency = computed(() => getCurrencyCrypto.value.includes(getUserCurrency.value));

    const getIsUserLoadedOneTime = computed(() => info.value.dataUserLoadedOneTime);
    const getDataIsLoaded = computed(() => info.value.dataIsLoaded);
    const getUserNickName = computed(() => info.value.nickname || info.value.email);
    const getIsLoadedUsedData = computed(() => isLoadedUsedData.value);
    const getPlayerStats = computed(() => stats.value);
    const getUserStartSeasonInfo = computed(() => userStartSeasonInfo.value);

    function setPlayerStats(data: IPlayerStats) {
        stats.value = data;
    }

    function setUserData(data: Partial<IUserData>) {
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

    function setUserSubscriptions(data: ISubscriptions) {
        subscriptions.value = data;
    }

    function setUserInfo(data: IUserData & { subscriptions?: ISubscriptions }) {
        info.value = data;
    }

    function addUserGroup(userGroup: IUserStatus) {
        info.value.statuses.push(userGroup);
    }

    function removeUserGroup(userGroup: IUserStatus) {
        const indexCurrentGroup = info.value.statuses.findIndex((status) => status.id === userGroup.id);

        if (indexCurrentGroup >= 0) {
            info.value.statuses.splice(indexCurrentGroup, 1);
        }
    }

    function setUserStatuses(userGroups: IUserStatus[]) {
        info.value.statuses = userGroups;
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

    function setFreshChatRestoreId(restoreId: string) {
        freshchatRestoreId.value = restoreId;
    }

    function addUserStatuses(newStatus: IUserStatus) {
        info.value.statuses = [
            ...info.value.statuses.filter(({ id }) => id !== newStatus.id),
            newStatus,
        ];
    }

    const getSubunitsToUnitsByCode = (codeProp?: Currencies) => {
        const { currencies } = storeToRefs(useCommonStore);
        const currencyInfo = currencies.value.find(({ code }) => {
            return code === (codeProp || getUserInfo.value?.currency);
        });

        return currencyInfo?.subunits_to_unit;
    };

    function setUserInfoSavedFlag(flag: boolean = true) {
        // @ts-expect-error Property 'saved' does not exist on type 'IUserData'.
        info.value.saved = flag;
    }

    function updateUserInfo(data: Partial<IUserData>) {
        info.value = {
            ...info.value,
            ...data,
        };
    }

    function setBettingBonuses(data: unknown[]) {
        bettingBonuses.value = data;
    }

    function setBettingPlayerSettings(data: BettingPlayerSettings) {
        bettingPlayerSettings.value = data;
    }

    function setUserSettings(data: IUserSettings) {
        settings.value = data;
    }

    function setUserSeasonStartPoints(data: ISeasonStartPoints) {
        userStartSeasonInfo.value = data;
    }

    return {
        getUserInfo,
        setUserInfo,
        getUserSumsubVerified,
        getUserVerified,
        info,
        updateUserInfo,
        isLogged,
        getUserCurrency,
        isCryptoUserCurrency,
        getIsLogged,
        getNotice,
        getSettings,
        getFreshChatRestoreIdLoaded,
        setFreshChatRestoreIdLoaded,
        getFreshChatRestoreId,
        setFreshChatRestoreId,
        getUserSubscriptions,
        setUserSubscriptions,
        getIsUserLoadedOneTime,
        getDataIsLoaded,
        getUserNickName,
        getIsLoadedUsedData,
        getUserBettingBonuses,
        getPlayerStats,
        getUserStartSeasonInfo,
        setPlayerStats,
        getSubunitsToUnitsByCode,
        toggleUserIsLogged,
        setUserData,
        addUserGroup,
        removeUserGroup,
        clearUserData,
        addUserStatuses,
        setUserStatuses,
        setUserInfoSavedFlag,
        setBettingBonuses,
        bettingPlayerSettings,
        setBettingPlayerSettings,
        setUserSettings,
        setUserSeasonStartPoints,
    };
});
