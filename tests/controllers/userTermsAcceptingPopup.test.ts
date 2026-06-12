import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUserTermsAcceptingPopup } from "../../src/controllers/userTermsAcceptingPopup";
import { updateAuthDetailsProviders } from "../../src/services/user";
import { useMultilangStore } from "../../src/store/multilang";
import { useUIStore } from "../../src/store/ui";
import { useUserInfo } from "../../src/store/user/userInfo";

vi.mock("../../src/services/user", () => ({
    updateAuthDetailsProviders: vi.fn(),
}));

describe("useUserTermsAcceptingPopup", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("detects missed terms acceptance field", () => {
        const userInfoStore = useUserInfo();

        userInfoStore.updateUserInfo({ auth_fields_missed: [ "terms_acceptance" ] });

        const { isUserTermsAccepted, isUserTermsNotAccepted } = useUserTermsAcceptingPopup();

        expect(isUserTermsAccepted.value).toBe(true);
        expect(isUserTermsNotAccepted.value).toBe(true);

        userInfoStore.updateUserInfo({ auth_fields_missed: [] });

        expect(isUserTermsAccepted.value).toBe(false);
        expect(isUserTermsNotAccepted.value).toBe(false);
    });

    it("does nothing when terms acceptance is not missed", () => {
        const uiStore = useUIStore();
        const setShowModalSpy = vi.spyOn(uiStore, "setShowModal");
        const { runShowingTermsPopup } = useUserTermsAcceptingPopup();

        runShowingTermsPopup();
        runShowingTermsPopup(true);

        expect(setShowModalSpy).not.toHaveBeenCalled();
        expect(updateAuthDetailsProviders).not.toHaveBeenCalled();
    });

    it("auto accepts terms without showing popup", () => {
        const userInfoStore = useUserInfo();
        const multilangStore = useMultilangStore();
        const uiStore = useUIStore();
        const setShowModalSpy = vi.spyOn(uiStore, "setShowModal");

        userInfoStore.updateUserInfo({ auth_fields_missed: [ "terms_acceptance", "country" ] });
        multilangStore.geo = "CA";

        const { runShowingTermsPopup } = useUserTermsAcceptingPopup();

        runShowingTermsPopup(true);

        expect(updateAuthDetailsProviders).toHaveBeenCalledWith({
            user: {
                terms_acceptance: true,
                country: "CA",
            },
        });
        expect(setShowModalSpy).not.toHaveBeenCalled();
    });

    it("shows accept terms popup with accept handler", () => {
        const userInfoStore = useUserInfo();
        const uiStore = useUIStore();
        const setShowModalSpy = vi.spyOn(uiStore, "setShowModal");

        userInfoStore.updateUserInfo({ auth_fields_missed: [ "terms_acceptance" ] });

        const { runShowingTermsPopup, acceptTerms } = useUserTermsAcceptingPopup();

        runShowingTermsPopup();

        expect(setShowModalSpy).toHaveBeenCalledWith({
            name: "modal-support",
            component: expect.any(Object),
            mobileFriendly: true,
            blockCloseOverlay: true,
            fullScreenMobile: true,
            props: {
                acceptHandler: acceptTerms,
            },
        });
    });

    it("accepts terms with extra fields and country only when country is missed", () => {
        const userInfoStore = useUserInfo();
        const multilangStore = useMultilangStore();

        userInfoStore.updateUserInfo({ auth_fields_missed: [ "terms_acceptance" ] });
        multilangStore.geo = "CA";

        const { acceptTerms } = useUserTermsAcceptingPopup({
            getAcceptTermsExtraFields: () => ({
                first_name: "John",
                country: "US",
            }),
        });

        acceptTerms();

        expect(updateAuthDetailsProviders).toHaveBeenCalledWith({
            user: {
                terms_acceptance: true,
                first_name: "John",
                country: "US",
            },
        });
    });
});
