import { storeToRefs } from "pinia";

import { PromoType, STATUS_PROMO } from "../models/enums/tournaments";
import type { ITournament } from "../services/api/DTO/tournamentsDTO";
import { useBannerStore } from "../store/banners";
import { useUserStatuses } from "../store/user/userStatuses";

export function promoFilterAndSettings<T extends ITournament>(
    promoList: Array<T> = [],
    type = PromoType.TOURNAMENT,
): T[] | [] {
    const userStatuses = useUserStatuses();
    const {
        banners,
    } = storeToRefs(useBannerStore());

    if (!promoList.length) {
        return promoList;
    }

    return promoList
        .filter(({ group_ids: groupsId }) => {
            if (groupsId?.length) {
                return groupsId.some((groupId) => {
                    return userStatuses.getUserGroups.includes(groupId);
                });
            }
            return true;
        }).map((promo) => {
            const banner = banners.value.find((item) => item.frontend_identifier?.includes(promo.frontend_identifier)) || {};

            return {
                ...promo,
                status: statusForTournament<T>(promo),
                type,
                image: "image" in banner ? banner.image : undefined,
                file: banner,
            };
        });
}

export function statusForTournament<T extends ITournament>(tour: T) {
    const startDate = new Date(tour.start_at);
    if (startDate.getTime() - Date.now() > 0) {
        return STATUS_PROMO.FUTURE;
    }
    if (new Date(tour.end_at).getTime() - Date.now() > 0) {
        return STATUS_PROMO.ACTIVE;
    }
    return STATUS_PROMO.ARCHIVE;
}
