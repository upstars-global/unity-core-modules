import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { useUserVerificationSumsub } from "../../src/store/user/userVerificationSumsub";

describe("useUserVerificationSumsub", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("initializes with empty accessToken", () => {
        const store = useUserVerificationSumsub();

        expect(store.accessToken).toBe("");
    });

    it("setAccessToken updates reactive value", () => {
        const store = useUserVerificationSumsub();
        const newToken = "new-token";

        store.setAccessToken(newToken);

        expect(store.accessToken).toBe(newToken);
    });
});
