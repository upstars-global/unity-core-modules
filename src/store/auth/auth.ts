import * as Sentry from "@sentry/vue";
import { useTournamentsStore } from "@store/tournaments/tournamentsStore";
import config from "@theme/configs/config";
import featureFlags from "@theme/configs/featureFlags";
import { defineStore } from "pinia";
import { checkEmail, registerUser, signIn, signOut } from "src/services/api/requests/auth";

import ABTestController from "../../controllers/ABTest/ABTestController";
import authController from "../../controllers/authController";
import CoveryController from "../../controllers/CoveryController";
import log from "../../controllers/Logger";
import { FullStory } from "../../controllers/MetriksController/FullStory";
import WS from "../../controllers/WebsocketController";
import { promiseAll } from "../../helpers/promiseHelpers";
import { UsePing } from "../../helpers/usePinger";
import vipStatusHelper from "../../helpers/vipStatusHelper";
import { EventBus as bus } from "../../plugins/EventBus";
import { addPlayerToGroup } from "../../services/api/requests/player";
import { userSetToGroupForAbTest } from "../../services/user";
import { useStatusCompPointsStore } from "../compPoints/statusCompPointsStore";
import { useGamesFavorite } from "../games/gamesFavorite";
import { useGamesCommon } from "../games/gamesStore";
import { useGiftsStore } from "../gifts";
import { useLootboxesStore } from "../lootboxes";
import { useLotteriesStore } from "../lotteries";
import { useNoticesStore } from "../notices";
import { useQuestStore } from "../quest/questStore";
import { useUserBalance } from "../user/userBalance";
import { useUserInfo } from "../user/userInfo";
import { useUserLimits } from "../user/userLimits";

export enum IbizaKeysValidation {
    BLACKLISTED = "IBIZA::INVALID::BLACKLISTED",
    INVALID_DOMAIN = "IBIZA::INVALID::INVALID_DOMAIN",
    REJECTED_EMAIL = "IBIZA::INVALID::REJECTED_EMAIL",
    RISKY = "IBIZA::RISKY::RISKY",
    NON_PERSONAL = "IBIZA::RISKY::NON_PERSONAL",
    INBOX_FULL = "IBIZA::RISKY::INBOX_FULL",
    TEMPORARY = "IBIZA::RISKY::TEMPORARY",
    TIMEOUT = "IBIZA::RISKY::TIMEOUT",
    ACCEPTED_EMAIL = "IBIZA::VALID::ACCEPTED_EMAIL",
    WHITELISTED = "IBIZA::VALID::WHITELISTED",
}

interface IRespIbizaService {
    errors: {
        message: IbizaKeysValidation;
    };
}

// eslint-disable-next-line @typescript-eslint/init-declarations
let userGiftsPing: UsePing | undefined;

export const useAuth = defineStore("auth", () => {
    const {
        toggleUserIsLogged,
        loadUserProfile,
        setUserData,
        addUserGroup,
        clearUserData,
    } = useUserInfo();
    async function checkEmailVerify(email: string): Promise<IRespIbizaService> {
        return checkEmail(email);
    }

    async function loginTwoFactor(otp: string) {
        try {
            const data = await signIn({ otp });

            toggleUserIsLogged(true);
            await loadUserProfile({});

            return data;
            // @ts-expect-error Property 'response' does not exist on type 'unknown'
        } catch ({ response }) {
            log.error("LOGIN_TWO_FACTORS_ERROR", response);
            throw response.data;
        }
    }

    async function login({ email, password, captcha, route }: { email: string; password: string; captcha: string; route: string }) {
        try {
            const data = await signIn({
                email,
                password,
                dfpc: CoveryController.deviceFingerprint(),
                captcha,
            });

            toggleUserIsLogged(true);

            await loadAuthData({ route });

            return data;
            // @ts-expect-error Property 'response' does not exist on type 'unknown'
        } catch ({ response }) {
            log.error("LOGIN_ERROR", response);
            throw response;
        }
    }

    async function logout(redirect: string) {
        try {
            await signOut();

            authController.resetAuthData(redirect);
        // @ts-expect-error Property 'response' does not exist on type 'unknown'
        } catch ({ response }) {
            log.error("LOGOUT_ERROR", response);
        }
    }
    // @ts-expect-error arameter 'registrationData' implicitly has an 'any' type.
    async function registration(registrationData) {
        if (registrationData.user) {
            registrationData.user.dfpc = CoveryController.deviceFingerprint();
        }
        try {
            const data = await registerUser(registrationData);

            setUserData(data);
            if (featureFlags.enableABReg) {
                addUserGroup({ id: ABTestController.groupById });
                await addPlayerToGroup(ABTestController.groupById);
            }

            toggleUserIsLogged(true);
            await loadAuthData();
            bus.$emit("user.registration");

            return data;
            // @ts-expect-error Property 'response' does not exist on type 'unknown'
        } catch ({ response }) {
            log.error("REGISTRATION_ERROR", response);
            throw response;
        }
    }

    async function loadAuthData({ route }: { route?: string } = {}) {
        const { loadUserLimits } = useUserLimits();
        const {
            loadGiftsData,
            loadDisabledBonuses,
            loadAdditionalDepositGifts,
            loadDepositGiftsData,
            loadRegistrationGiftsData,
            loadFSGiftsData,
        } = useGiftsStore();
        const {
            loadUserSettings,
            loadUserStats,
            loadUserSubscriptions,
        } = useUserInfo();
        const { loadUserBalance } = useUserBalance();
        const { loadFavoriteGames } = useGamesFavorite();
        const { loadLootboxesList } = useLootboxesStore();
        const { loadLotteryStatuses } = useLotteriesStore();
        const { loadUserTournaments } = useTournamentsStore();
        const { loadRatesMoney, loadUserCompPoints } = useStatusCompPointsStore();
        const { loadLastGames } = useGamesCommon();

        try {
            // @ts-expect-error Property 'data' does not exist on type
            const { data } = await loadUserProfile({ route });
            if (data?.id) {
                if ((!DEV || FORCE_RUN_ANALYTICS) && config.fullStoryId) {
                    FullStory.identify(data, config.fullStoryId);

                    const { status } = vipStatusHelper(data);
                    Sentry.setUser({ id: data.id, vip: Boolean(status) });
                }

                userGiftsPing = new UsePing(loadGiftsData, 10000);
                userGiftsPing.runPing();

                return await promiseAll([
                    loadUserBalance(),
                    loadUserCompPoints(),
                    loadDisabledBonuses(),
                    loadDepositGiftsData(),
                    loadAdditionalDepositGifts(),
                    loadRegistrationGiftsData(),
                    loadFSGiftsData(),
                    loadUserLimits(),
                    loadUserTournaments(),
                    loadRatesMoney(),
                    loadLotteryStatuses(),
                    loadFavoriteGames(),
                    loadLootboxesList(),
                    loadLastGames(),

                    // UserInfo
                    loadUserSettings(),
                    loadUserStats(),
                    loadUserSubscriptions({ reload: true }),
                    userSetToGroupForAbTest(),
                ]);
            }
            return data;
        } finally {
            WS.start();
        }
    }

    async function resetAuthData() {
        if (window?.PaymentsAPI) {
            await window.PaymentsAPI.resetCache();
        }
        const giftStore = useGiftsStore();
        const questStore = useQuestStore();
        const lotteriesStore = useLotteriesStore();
        const gamesFavoriteStore = useGamesFavorite();
        const noticesStore = useNoticesStore();
        const tournamentsStore = useTournamentsStore();
        const gamesStore = useGamesCommon();
        const lootboxesStore = useLootboxesStore();
        const storeLimits = useUserLimits();
        const userBalanceStore = useUserBalance();
        const statusCompPointsStore = useStatusCompPointsStore();

        toggleUserIsLogged(false);
        clearUserData();

        tournamentsStore.clearTournamentUserData();
        gamesFavoriteStore.clearUserData();
        giftStore.giftsStoreClear();
        questStore.clearQuestUserData();
        lotteriesStore.clearLotteriesUserData();
        noticesStore.clearUserNotification();
        gamesStore.clearRecentGames();
        lootboxesStore.clearLootboxesUserData();
        storeLimits.clearState();
        userBalanceStore.clearState();
        statusCompPointsStore.clearState();

        if (userGiftsPing) {
            userGiftsPing.clearPing();
        }
    }

    return {
        checkEmailVerify,
        loginTwoFactor,
        login,
        logout,
        registration,
        loadAuthData,
        resetAuthData,
    };
});
