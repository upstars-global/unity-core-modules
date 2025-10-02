import { vi } from "vitest";


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
