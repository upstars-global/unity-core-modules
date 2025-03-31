import type { Pinia } from "pinia";
import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { log } from "../../controllers/Logger";
import { isAchievement } from "../../helpers/achievementHelpers";
import { parseJson } from "../../helpers/parseJson";
import { parseImageDescription, promoFilterAndSettings, statusForTournament } from "../../helpers/promoHelpers";
import { isQuest } from "../../helpers/questHelpers";
import { PromoType } from "../../models/enums/tournaments";
import type { ISnippetItemCMS } from "../../services/api/DTO/CMS";
import type { IPlayersList, ITournament, ITournamentsList } from "../../services/api/DTO/tournamentsDTO";
import {
    chooseTournamentReq,
    loadRecentTournamentsReq,
    loadTournamentByIdReq,
    loadTournamentsListReq,
    loadUserStatusesReq,
    loadUserTournamentsReq,
} from "../../services/api/requests/tournaments";
import { useBannerStore } from "../banners";
import { useCMS } from "../CMS";
import { useQuestStore } from "../quest/questStore";

export const useTournamentsStore = defineStore("tournamentsStore", () => {
    const questStore = useQuestStore();

    const currentTournament = ref<Partial<ITournament> | null>(null);
    const currentUserTournamentsStatuses = ref<IPlayersList>([]);
    const recentTournaments = ref<ITournamentsList>([]);
    const tournamentsList = ref<ITournamentsList>([]);
    const userTournaments = ref<ITournamentsList>([]);

    const getAllTournamentsOnlyUser = computed(() => {
        return promoFilterAndSettings(tournamentsList.value, PromoType.TOURNAMENT);
    });

    const getTournamentsList = computed(() => {
        const tournaments = tournamentsList.value.filter(({ frontend_identifier }) => {
            return !isQuest(frontend_identifier) && !isAchievement(frontend_identifier);
        });
        return promoFilterAndSettings(tournaments, PromoType.TOURNAMENT);
    });

    const { snippets } = useCMS();
    const getCustomTournamentsList = computed(() => {
        try {
            const tournaments = snippets
                .filter((snippet: ISnippetItemCMS) => {
                    return snippet.categories.includes("tournament");
                })
                .map(({ content }) => {
                    return parseJson(content, "PARSE_TOURNAMENT_ITEM_ERROR");
                });

            return tournaments.map((tour: ITournament) => {
                return {
                    ...tour,
                    custom: true,
                    status: statusForTournament(tour),
                    type: PromoType.TOURNAMENT,
                };
            });
        } catch (error) {
            log.error("GET_CUSTOM_TOURNAMENTS_LIST_ERROR", error);
            return [];
        }
    });

    const getActiveTournamentsList = computed(() => {
        return getTournamentsList.value.filter((item: ITournament) => {
            return item.in_progress;
        });
    });

    const { tournamentsFiles } = storeToRefs(useBannerStore());
    const getCurrentTournament = computed(() => {
        if (!currentTournament.value?.frontend_identifier) {
            return {};
        }

        const image = tournamentsFiles.value.find(({ id }) => {
            return currentTournament.value?.frontend_identifier && id.includes(currentTournament.value?.frontend_identifier);
        });
        const dataFile = parseImageDescription(image);

        return {
            ...currentTournament.value,
            // @ts-expect-error Property 'status' does not exist on type 'ITournament'.
            status: statusForTournament(currentTournament.value),
            type: PromoType.TOURNAMENT,
            file: {
                image: image?.url,
                ...image,
                ...dataFile,
            },
        };
    });

    function getTournamentBySlug(slug: number) {
        const list = [ ...getTournamentsList.value, ...getCustomTournamentsList.value ];
        return list.find((item: ITournament) => {
            return item.id === slug;
        }) || {};
    }

    const getTournamentById = (id: number) => {
        return getTournamentsList.value.find((item: ITournament) => {
            return item.id === id;
        });
    };

    const getUserTournamentById = computed(() => {
        return (idTour: number) => {
            return getTournamentsList.value.find(({ id }) => {
                return id === idTour;
            });
        };
    });
    const getStatusTournamentById = computed(() => {
        return (id: number) => {
            return currentUserTournamentsStatuses.value.find(({ tournament_id }) => {
                return tournament_id === id;
            });
        };
    });
    const getRecentTournaments = computed(() => {
        return recentTournaments.value.map((tour) => {
            const image = tournamentsFiles.value.filter(({ id }) => {
                return currentTournament.value?.frontend_identifier && id.includes(currentTournament.value?.frontend_identifier);
            });

            return {
                ...tour,
                status: statusForTournament(tour),
                type: PromoType.TOURNAMENT,
                // @ts-expect-error Property 'url' does not exist on typer .
                image: image?.url,
                file: image,
            };
        });
    });

    async function loadTournaments(): Promise<ITournamentsList> {
        const tournamentsResponse = await loadTournamentsListReq();
        tournamentsList.value = tournamentsResponse
            .filter(({ frontend_identifier }) => frontend_identifier !== "nonvisible");

        await questStore.loadQuestsData(tournamentsResponse);

        return tournamentsResponse;
    }

    async function loadTournamentBySlug(slug: number): Promise<Partial<ITournament>> {
        if (currentTournament.value?.id === slug) {
            return Promise.resolve(currentTournament.value);
        }

        currentTournament.value = {};
        if (Number(slug)) {
            currentTournament.value = await loadTournamentByIdReq(slug) ?? {};
        }

        return Promise.resolve(currentTournament.value);
    }

    function reloadTournaments(): void {
        currentTournament.value = null;
    }

    function sanitizeUserTourStatuses(newStatuses: IPlayersList): IPlayersList {
        return [
            ...currentUserTournamentsStatuses.value
                .filter(({ tournament_id }) => {
                    return !newStatuses.some(({ tournament_id: newID }) => {
                        return newID === tournament_id;
                    });
                }),
            ...newStatuses,
        ];
    }

    async function loadCurrentUserTourStatuses(): Promise<void> {
        const hasUserTourStatuses = Boolean(currentUserTournamentsStatuses.value.length);

        await questStore.loadQuestsData(tournamentsList.value);

        const statuses = await Promise.all(getAllTournamentsOnlyUser.value.map((tourItem: ITournament) => {
            return loadUserStatusesReq(tourItem.id);
        }));

        currentUserTournamentsStatuses.value = hasUserTourStatuses ? sanitizeUserTourStatuses(statuses) : statuses;
    }

    async function loadUserTournaments(): Promise<void> {
        userTournaments.value = await loadUserTournamentsReq();
        await loadCurrentUserTourStatuses();
    }

    async function chooseTournament(id: number): Promise<void> {
        await chooseTournamentReq(id);
        await loadUserTournaments();
    }

    function clearTournamentUserData(): void {
        currentUserTournamentsStatuses.value = [];
        userTournaments.value = [];
        tournamentsList.value = [];
    }

    async function loadRecentTournaments(): Promise<void> {
        recentTournaments.value = await loadRecentTournamentsReq();
    }

    async function updateUserTourStatuses(data: IPlayersList): Promise<void> {
        currentUserTournamentsStatuses.value = sanitizeUserTourStatuses(data);

        data.forEach((newStatus) => {
            const indexTourForUpdate = userTournaments.value.findIndex(({ id }) => {
                return id === newStatus.tournament_id;
            });

            const indexUserForUpdate = userTournaments.value[indexTourForUpdate]?.top_players?.findIndex((item) => {
                return item.award_place === newStatus.award_place && item.nickname === newStatus.nickname;
            });

            if (indexTourForUpdate >= 0 && indexUserForUpdate >= 0) {
                userTournaments.value[indexTourForUpdate].top_players[indexUserForUpdate] = newStatus;
            }
        });
    }

    return {
        currentTournament,
        currentUserTournamentsStatuses,
        recentTournaments,
        tournamentsList,
        userTournaments,

        getAllTournamentsOnlyUser,
        getTournamentsList,
        getCustomTournamentsList,
        getActiveTournamentsList,
        getCurrentTournament,
        getTournamentBySlug,
        getTournamentById,
        getUserTournamentById,
        getStatusTournamentById,
        getRecentTournaments,

        loadTournaments,
        loadTournamentBySlug,
        reloadTournaments,
        chooseTournament,
        loadUserTournaments,
        clearTournamentUserData,
        loadRecentTournaments,
        updateUserTourStatuses,
    };
});

export function useTournamentsFetchService(pinia?: Pinia) {
    const tournamentsStore = useTournamentsStore(pinia);

    function loadTournaments() {
        return tournamentsStore.loadTournaments();
    }

    return {
        loadTournaments,
    };
}
