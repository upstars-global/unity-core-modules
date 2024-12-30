import { typePromotionsFiles } from "@config/tournaments";
import { useUserStatuses } from "@store/user/userStatuses";
import { toRefs } from "vue";

import { PromoType, STATUS_PROMO } from "../models/enums/tournaments";
import type { ITournament } from "../services/api/DTO/tournamentsDTO";
import { useBannerStore } from "../store/banners";

export const labelToString = (labels: [ { title: string } ]) => labels?.map(({ title }) => title).join(" | ");

export function parseImageDescription(file) {
    try {
        return JSON.parse(file.description);
    } catch (err) {
        return {};
    }
}

export function promoFilterAndSettings<T extends { group_ids: number[]; frontend_identifier: string }>(
    promoList: Array<T> = [],
    type = PromoType.TOURNAMENT,
): T[] | [] {
    const userStatuses = useUserStatuses();
    const {
        tournamentsFiles,
        lotteriesFiles,
        questFiles,
    } = toRefs(useBannerStore());

    if (!promoList.length) {
        return promoList;
    }

    let imagesByTypeCollection = tournamentsFiles.value;
    if (type === typePromotionsFiles.lottery) {
        imagesByTypeCollection = lotteriesFiles.value;
    }
    if (type === typePromotionsFiles.quest) {
        imagesByTypeCollection = questFiles.value;
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
            const image = imagesByTypeCollection.find(({ id }) => id.includes(promo.frontend_identifier));

            return {
                ...promo,
                status: statusForTournament<T>(promo),
                type,
                image: image?.url,
                file: parseImageDescription(image),
            };
        });
}

export function statusForTournament<T extends ITournament>(tour: T) {
    const startDate = new Date(tour.start_at);
    if (startDate - Date.now() > 0) {
        return STATUS_PROMO.FUTURE;
    }
    if (new Date(tour.end_at) - Date.now() > 0) {
        return STATUS_PROMO.ACTIVE;
    }
    return STATUS_PROMO.ARCHIVE;
}
