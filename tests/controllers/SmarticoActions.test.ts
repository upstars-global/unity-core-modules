// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type Component,createApp, nextTick, ref } from "vue";

const mocks = vi.hoisted(() => ({ isServer: false, error: vi.fn() }));
vi.mock("../../src/helpers/ssrHelpers", () => ({ get isServer() { return mocks.isServer; } }));
vi.mock("../../src/controllers/Logger", () => ({ log: { error: mocks.error } }));

import {
    handleSmarticoIdentify,
    trackSmarticoAction,
    useSmartico,
    useSmarticoView,
} from "../../src/controllers/Smartico";

function mount(component: Component) {
    const host = document.createElement("div");
    const app = createApp({ ...component, render: () => null });
    const vm = app.mount(host);
    return { vm, unmount: () => app.unmount() };
}

describe("Smartico client actions", () => {
    const action = vi.fn();
    let wrapper: ReturnType<typeof mount> | undefined;

    beforeEach(() => {
        vi.clearAllMocks();
        mocks.isServer = false;
        useSmartico().updateSmarticoUser();
        vi.stubGlobal("_smartico", { action, changeLanguage: vi.fn() });
        useSmartico().updateSmarticoUser("123", "en");
    });
    afterEach(() => {
        wrapper?.unmount();
        wrapper = undefined;
        vi.unstubAllGlobals();
    });

    it("sends actions with payload only after successful identify", () => {
        trackSmarticoAction("GAME_ADDED_TO_FAVORITES", { game_id: 42 });
        handleSmarticoIdentify(1);
        expect(action).not.toHaveBeenCalled();
        handleSmarticoIdentify(0);
        expect(action).not.toHaveBeenCalled();
        trackSmarticoAction("GAME_ADDED_TO_FAVORITES", { game_id: 42 });
        expect(action).toHaveBeenCalledExactlyOnceWith("GAME_ADDED_TO_FAVORITES", { game_id: 42 });
        trackSmarticoAction("SLOTS_SECTION_OPENED");
        expect(action).toHaveBeenLastCalledWith("SLOTS_SECTION_OPENED", undefined);
    });

    it("does not send guest or server actions", () => {
        useSmartico().updateSmarticoUser();
        trackSmarticoAction("GUEST");
        handleSmarticoIdentify(0);
        mocks.isServer = true;
        trackSmarticoAction("SERVER");
        handleSmarticoIdentify(0);
        expect(action).not.toHaveBeenCalled();
    });

    it("requires identify again after logout or changing the SDK user", () => {
        handleSmarticoIdentify(0);
        useSmartico().updateSmarticoUser();
        trackSmarticoAction("LOGGED_OUT");
        useSmartico().updateSmarticoUser("456", "en");
        trackSmarticoAction("BEFORE_IDENTIFY");
        expect(action).not.toHaveBeenCalled();
        handleSmarticoIdentify(0);
        trackSmarticoAction("AFTER_IDENTIFY");
        expect(action).toHaveBeenCalledExactlyOnceWith("AFTER_IDENTIFY", undefined);
    });

    it("tracks only the latest active view once after late identify and supports reopening", async() => {
        const name = ref<string | undefined>("SLOTS_SECTION_OPENED");
        wrapper = mount({
            setup() {
                useSmarticoView(() => name.value ? { name: name.value } : undefined);
            },
            template: "<div />",
        });
        name.value = "SPORT_SECTION_OPENED";
        await nextTick();
        handleSmarticoIdentify(0);
        await nextTick();
        expect(action).toHaveBeenCalledExactlyOnceWith("SPORT_SECTION_OPENED", undefined);
        handleSmarticoIdentify(0);
        await wrapper.vm.$forceUpdate();
        await nextTick();
        expect(action).toHaveBeenCalledTimes(1);
        name.value = undefined;
        await nextTick();
        name.value = "SPORT_SECTION_OPENED";
        await nextTick();
        expect(action).toHaveBeenCalledTimes(2);
        wrapper.unmount();
        wrapper = undefined;
        name.value = "SLOTS_SECTION_OPENED";
        await nextTick();
        expect(action).toHaveBeenCalledTimes(2);
    });

    it("does not replay a view closed before identify", async() => {
        wrapper = mount({ setup() { useSmarticoView(() => ({ name: "CLOSED" })); }, template: "<div />" });
        wrapper.unmount();
        wrapper = undefined;
        handleSmarticoIdentify(0);
        await nextTick();
        expect(action).not.toHaveBeenCalled();
    });

    it("reports distinct pages in the same section without resending on identical state", async() => {
        const path = ref("/pokies/all");
        handleSmarticoIdentify(0);
        wrapper = mount({
            setup() {
                useSmarticoView(() => ({ name: "SLOTS_SECTION_OPENED" }), () => path.value);
            },
            template: "<div />",
        });
        expect(action).toHaveBeenCalledTimes(1);
        path.value = "/pokies/top";
        await nextTick();
        expect(action).toHaveBeenCalledTimes(2);
        path.value = "/pokies/top";
        await nextTick();
        expect(action).toHaveBeenCalledTimes(2);
    });

    it("waits for re-identification when an open view changes accounts", async() => {
        handleSmarticoIdentify(0);
        wrapper = mount({ setup() { useSmarticoView(() => ({ name: "PROFILE_SECTION_OPENED" })); }, template: "<div />" });
        expect(action).toHaveBeenCalledTimes(1);
        useSmartico().updateSmarticoUser("456", "en");
        await nextTick();
        expect(action).toHaveBeenCalledTimes(1);
        vi.stubGlobal("_smartico_user_id", "456");
        handleSmarticoIdentify(0);
        await nextTick();
        expect(action).toHaveBeenCalledTimes(2);
    });

    it("isolates SDK exceptions from the application", () => {
        handleSmarticoIdentify(0);
        const error = new Error("SDK unavailable");
        action.mockImplementationOnce(() => { throw error; });
        expect(() => trackSmarticoAction("SPORT_SECTION_OPENED")).not.toThrow();
        expect(mocks.error).toHaveBeenCalledWith("SMARTICO_CLIENT_ACTION_ERROR", error);
    });
});
