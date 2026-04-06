import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { useReferral } from "../../src/store/referral";

describe("useReferral", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it("initializes with default state", () => {
        const store = useReferral();

        expect(store.referralCodes).toEqual([]);
        expect(store.referralStatistic).toEqual({
            total_invited: 0,
            total_claimed: 0,
        });
    });

    it("replaces referral codes list", () => {
        const store = useReferral();
        const codes = [
            {
                refcode: "abc",
                claimed_amount: 1,
                completed_users_count: 2,
                to_claim_amount: 3,
            },
        ];

        store.setReferralCodes(codes);

        expect(store.referralCodes).toEqual(codes);
    });

    it("updates aggregated statistics", () => {
        const store = useReferral();
        const stats = {
            total_invited: 10,
            total_claimed: 4,
        };

        store.setStatistics(stats);

        expect(store.referralStatistic).toEqual(stats);
    });

    it("appends a new referral code to existing list", () => {
        const store = useReferral();

        store.setReferralCodes([
            {
                refcode: "abc",
                claimed_amount: 1,
                completed_users_count: 2,
                to_claim_amount: 3,
            },
        ]);

        store.addReferralCode({
            refcode: "xyz",
            claimed_amount: 0,
            completed_users_count: 0,
            to_claim_amount: 5,
        });

        expect(store.referralCodes).toEqual([
            {
                refcode: "abc",
                claimed_amount: 1,
                completed_users_count: 2,
                to_claim_amount: 3,
            },
            {
                refcode: "xyz",
                claimed_amount: 0,
                completed_users_count: 0,
                to_claim_amount: 5,
            },
        ]);
    });
});
