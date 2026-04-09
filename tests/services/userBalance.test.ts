import { beforeEach, describe, expect, it, vi } from "vitest";

import { Currencies } from "../../src/models/enums/currencies";
import type { IUserAccount } from "../../src/services/api/DTO/playerDTO";
import * as playerRequests from "../../src/services/api/requests/player";
import { useUserBalanceService } from "../../src/services/userBalance";

const setUserBalanceMock = vi.fn();
const defaultProjectConfigMock = {
    disabledCurrencies: [] as Currencies[],
};

const createWallet = (currency: Currencies): IUserAccount => ({
    currency,
    amount_cents: 1000,
    available_to_cashout_cents: 700,
    available_to_bet_with_locked_cent: 1000,
    hidden_at: null,
    deposit_available: true,
    selected_lottery_id: 1,
    active: true,
});

vi.mock("../../src/store/user/userBalance", () => ({
    useUserBalance: vi.fn(() => ({
        setUserBalance: setUserBalanceMock,
    })),
}));

vi.mock("../../src/store/configStore", () => ({
    useConfigStore: vi.fn(() => ({
        $defaultProjectConfig: defaultProjectConfigMock,
    })),
}));

vi.mock("../../src/services/api/requests/player", () => ({
    loadUserBalanceReq: vi.fn(),
    selectUserWalletReq: vi.fn(),
}));

vi.mock("../../src/services/user", () => ({
    loadUserLimits: vi.fn(),
    loadUserProfile: vi.fn(),
}));

vi.mock("../../src/controllers/Logger", () => ({
    log: {
        error: vi.fn(),
    },
}));

describe("useUserBalanceService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        defaultProjectConfigMock.disabledCurrencies = [];
    });

    it("filters disabled currencies before saving balance", async () => {
        defaultProjectConfigMock.disabledCurrencies = [ Currencies.BTC ];
        vi.mocked(playerRequests.loadUserBalanceReq).mockResolvedValue([
            createWallet(Currencies.USD),
            createWallet(Currencies.BTC),
        ]);

        await useUserBalanceService().loadUserBalance();

        expect(setUserBalanceMock).toHaveBeenCalledWith([
            expect.objectContaining({ currency: Currencies.USD }),
        ]);
    });

    it("saves full balance when disabled currencies are not configured", async () => {
        vi.mocked(playerRequests.loadUserBalanceReq).mockResolvedValue([
            createWallet(Currencies.USD),
            createWallet(Currencies.BTC),
        ]);

        await useUserBalanceService().loadUserBalance();

        expect(setUserBalanceMock).toHaveBeenCalledWith([
            expect.objectContaining({ currency: Currencies.USD }),
            expect.objectContaining({ currency: Currencies.BTC }),
        ]);
    });
});
