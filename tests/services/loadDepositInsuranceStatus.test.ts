import { IRON_STATUS } from "@config/user-statuses";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import type { IDepositInsuranceStatus } from "../../src/models/user";
import { useGiftsStore } from "../../src/store/gifts";

const getIsLogged = ref(true);
const getUserCurrency = ref("EUR");
const isVip = ref(true);
const userVipGroup = ref<string | undefined>("gold");

const depositInsuranceStatusReqMock = vi.fn();
const depositInsuranceClaimReqMock = vi.fn();

vi.mock("../../src/store/user/userInfo", () => ({
    useUserInfo: () => ({ getIsLogged, getUserCurrency }),
}));

vi.mock("../../src/store/user/userStatuses", () => ({
    useUserStatuses: () => ({ isVip, userVipGroup }),
}));

vi.mock("../../src/controllers/Logger", () => ({
    log: { error: vi.fn() },
}));

vi.mock("../../src/services/api/requests/player", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../src/services/api/requests/player")>();

    return {
        ...actual,
        depositInsuranceStatusReq: (...args: unknown[]) => depositInsuranceStatusReqMock(...args),
        depositInsuranceClaimReq: (...args: unknown[]) => depositInsuranceClaimReqMock(...args),
    };
});

function minimalDepositInsuranceStatus(): IDepositInsuranceStatus {
    return {
        activatedAmount: 0,
        dailyLimit: 100,
        percentage: 10,
        minDeposit: 10,
        maxBonus: 100,
        wager: 35,
        currencyIso: "EUR",
        conditions: {
            lowBalance: { value: 100, valid: true },
            vipSpentAmount: { value: 50, valid: true },
            noActiveBonus: { value: null, valid: true },
            hasDeposits: { value: null, valid: true },
            hasNoCashoutAfterDeposit: { value: null, valid: true },
            aboveMinDeposit: { value: null, valid: true },
        },
    };
}

describe("loadDepositInsuranceStatus", () => {
    beforeEach(async () => {
        vi.resetModules();
        setActivePinia(createPinia());
        getIsLogged.value = true;
        isVip.value = true;
        userVipGroup.value = "gold";
        getUserCurrency.value = "EUR";
        depositInsuranceStatusReqMock.mockReset();
        depositInsuranceClaimReqMock.mockReset();
        depositInsuranceStatusReqMock.mockResolvedValue(minimalDepositInsuranceStatus());

        const { log } = await import("../../src/controllers/Logger");
        vi.mocked(log.error).mockClear();
    });

    it("clears store and skips API when user is not logged in", async () => {
        getIsLogged.value = false;
        const { loadDepositInsuranceStatus } = await import("../../src/services/user");
        const store = useGiftsStore();

        await loadDepositInsuranceStatus();

        expect(depositInsuranceStatusReqMock).not.toHaveBeenCalled();
        expect(store.depositInsuranceGift).toBeUndefined();
    });

    it("clears store and skips API when user is not VIP", async () => {
        isVip.value = false;
        const { loadDepositInsuranceStatus } = await import("../../src/services/user");
        const store = useGiftsStore();

        await loadDepositInsuranceStatus();

        expect(depositInsuranceStatusReqMock).not.toHaveBeenCalled();
        expect(store.depositInsuranceGift).toBeUndefined();
    });

    it("clears store and skips API when VIP group is Iron", async () => {
        userVipGroup.value = IRON_STATUS;
        const { loadDepositInsuranceStatus } = await import("../../src/services/user");
        const store = useGiftsStore();

        await loadDepositInsuranceStatus();

        expect(depositInsuranceStatusReqMock).not.toHaveBeenCalled();
        expect(store.depositInsuranceGift).toBeUndefined();
    });

    it("sets gift from API when eligible and API returns data", async () => {
        const data = minimalDepositInsuranceStatus();
        depositInsuranceStatusReqMock.mockResolvedValue(data);
        const { loadDepositInsuranceStatus } = await import("../../src/services/user");
        const store = useGiftsStore();

        await loadDepositInsuranceStatus();

        expect(depositInsuranceStatusReqMock).toHaveBeenCalledTimes(1);
        expect(store.depositInsuranceGift).toEqual(data);
    });

    it("clears store when API returns undefined", async () => {
        depositInsuranceStatusReqMock.mockResolvedValue(undefined);
        const { loadDepositInsuranceStatus } = await import("../../src/services/user");
        const store = useGiftsStore();

        await loadDepositInsuranceStatus();

        expect(depositInsuranceStatusReqMock).toHaveBeenCalledTimes(1);
        expect(store.depositInsuranceGift).toBeUndefined();
    });

    it("clears store and logs when API throws", async () => {
        depositInsuranceStatusReqMock.mockRejectedValue(new Error("network"));
        const { loadDepositInsuranceStatus } = await import("../../src/services/user");
        const { log } = await import("../../src/controllers/Logger");
        const store = useGiftsStore();

        await loadDepositInsuranceStatus();

        expect(store.depositInsuranceGift).toBeUndefined();
        expect(log.error).toHaveBeenCalledWith(
            "PORTOFRANCO_DEPOSIT_INSURANCE_STATUS_ERROR",
            expect.any(Error),
        );
    });

    it("deduplicates concurrent in-flight requests", async () => {
        const { loadDepositInsuranceStatus } = await import("../../src/services/user");

        await Promise.all([
            loadDepositInsuranceStatus(),
            loadDepositInsuranceStatus(),
        ]);

        expect(depositInsuranceStatusReqMock).toHaveBeenCalledTimes(1);
    });

    it("allows a new request after the previous one finished", async () => {
        const { loadDepositInsuranceStatus } = await import("../../src/services/user");

        await loadDepositInsuranceStatus();
        await loadDepositInsuranceStatus();

        expect(depositInsuranceStatusReqMock).toHaveBeenCalledTimes(2);
    });

    it("passes currency to depositInsuranceStatusReq", async () => {
        getUserCurrency.value = "EUR";
        const { loadDepositInsuranceStatus } = await import("../../src/services/user");

        await loadDepositInsuranceStatus();

        expect(depositInsuranceStatusReqMock).toHaveBeenCalledWith("EUR");
    });
});

describe("claimDepositInsurance", () => {
    it("calls depositInsuranceClaimReq with currency", async () => {
        getUserCurrency.value = "CAD";
        const { claimDepositInsurance } = await import("../../src/services/user");

        await claimDepositInsurance();

        expect(depositInsuranceClaimReqMock).toHaveBeenCalledWith("CAD");
    });
});
