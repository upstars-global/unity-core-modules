// @vitest-environment happy-dom

import { beforeEach, describe, expect, test, vi } from "vitest";

import { useSmartico } from "../../src/controllers/Smartico";
import type { SmarticoGlobal } from "../../src/models/smarticoInbox";

describe("useSmartico", () => {
    beforeEach(() => {
        delete window._smartico;
        window._smartico_user_id = null;
        window._smartico_language = null;
    });

    test("updates and clears the Smartico user", () => {
        const changeLanguage = vi.fn();
        const { updateSmarticoUser } = useSmartico();

        window._smartico = { changeLanguage } as unknown as SmarticoGlobal;

        updateSmarticoUser("123", "en");

        expect(window._smartico_user_id).toBe("123");
        expect(window._smartico_language).toBe("en");
        expect(changeLanguage).toHaveBeenCalledWith("en");

        updateSmarticoUser();

        expect(window._smartico_user_id).toBeNull();
        expect(window._smartico_language).toBeNull();
    });

    test("keeps popups suspended while at least one source is active", () => {
        const suspendPopups = vi.fn();
        const { setSmarticoPopupsSuspendedBy } = useSmartico();

        window._smartico_user_id = "123";
        window._smartico = { suspendPopups } as unknown as SmarticoGlobal;

        setSmarticoPopupsSuspendedBy("game", true);
        setSmarticoPopupsSuspendedBy("cashbox", true);
        setSmarticoPopupsSuspendedBy("cashbox", false);
        setSmarticoPopupsSuspendedBy("game", false);

        expect(suspendPopups).toHaveBeenNthCalledWith(1, true);
        expect(suspendPopups).toHaveBeenNthCalledWith(2, true);
        expect(suspendPopups).toHaveBeenNthCalledWith(3, true);
        expect(suspendPopups).toHaveBeenNthCalledWith(4, false);
    });

    test("suspends the native Smartico Inbox", () => {
        const suspendInbox = vi.fn();
        const { suspendSmarticoInbox } = useSmartico();

       window._smartico = { suspendInbox } as unknown as SmarticoGlobal;
       suspendSmarticoInbox(true);

        expect(suspendInbox).toHaveBeenCalledWith(true);
    });

    test("executes a Smartico action", () => {
        const dp = vi.fn();
        const { executeSmarticoAction } = useSmartico();

        window._smartico = { dp } as unknown as SmarticoGlobal;

        executeSmarticoAction("");
        executeSmarticoAction("dp:deposit");

        expect(dp).toHaveBeenCalledOnce();
        expect(dp).toHaveBeenCalledWith("dp:deposit");
    });

    test("adds and removes identify listeners through the loaded SDK", () => {
        const on = vi.fn();
        const off = vi.fn();
        const callback = vi.fn();
        const smartico = Object.assign(vi.fn(), { on, off });
        const { addSmarticoIdentifyListener, removeSmarticoIdentifyListener } = useSmartico();

        window._smartico = smartico as unknown as SmarticoGlobal;

        addSmarticoIdentifyListener(callback);
        removeSmarticoIdentifyListener(callback);

        expect(on).toHaveBeenCalledWith("identify", callback);
        expect(off).toHaveBeenCalledWith("identify", callback);
        expect(smartico).not.toHaveBeenCalled();
    });

    test("queues identify listeners before the SDK is loaded", () => {
        const queue = vi.fn();
        const callback = vi.fn();
        const { addSmarticoIdentifyListener, removeSmarticoIdentifyListener } = useSmartico();

        window._smartico = queue as unknown as SmarticoGlobal;

        addSmarticoIdentifyListener(callback);
        removeSmarticoIdentifyListener(callback);

        expect(queue).toHaveBeenNthCalledWith(1, "on", "identify", callback);
        expect(queue).toHaveBeenNthCalledWith(2, "off", "identify", callback);
    });
});
