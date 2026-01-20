import { beforeEach, vi } from "vitest";

vi.mock("pinia", async () => {
    const actual = await vi.importActual<typeof import("pinia")>("pinia");
    const { createUnityConfigPlugin } = await import("../src/plugins/ConfigPlugin");
    const { baseUnityConfig } = await import("./mocks/unityConfig");
    return {
        ...actual,
        createPinia: () => {
            const pinia = actual.createPinia();
            pinia.use(createUnityConfigPlugin(baseUnityConfig));
            return pinia;
        },
    };
});

beforeEach(async () => {
    const { createPinia, setActivePinia } = await import("pinia");
    setActivePinia(createPinia());
});


vi.mock("@helpers/lootBoxes", () => ({

}));

vi.mock("@helpers/user", () => ({
    getUserVipGroup: () => {
        return true;
    },
    getUserIsDiamond: () => {
        return true;
    },
}));

vi.mock("@src/config/gift", () => ({
    LOOTBOX_TYPE_GIFTS: [ "random" ],
    STATUSES_GIFT_CANCELED: "canceled",
    STATUSES_GIFT_FINISHED: "finished",
    STATUSES_GIFT_EXPIRED: "expired",
    STATUSES_GIFT_WAGERDONE: "wager_done",
    STATUSES_GIFT_LOST: "lost",
    STATUSES_GIFT_HANDLEBETS: "handle_bets",
    STATUSES_GIFT_ISSUED: "issued",
    STATUSES_LOST_GIFT: [
        "finished",
        "canceled",
        "expired",
        "wager_done",
        "lost",
    ],
    TYPE_GIFT_BONUS: "bonus",
    TYPE_GIFT_DEPOSIT: "deposit",
    TYPE_GIFT_REGISTRATION: "registration",
    TYPE_GIFT_FS: "fs",
}), { virtual: true });

vi.mock("@modules/Limits/limitConstants", () => ({
    LIMIT_TYPE_COOLING_OFF: "cooling_off",
    LIMIT_TYPE_DEPOSIT: "deposit",
}));
