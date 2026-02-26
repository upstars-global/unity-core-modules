import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { log } from "../../controllers/Logger";
import { isAchievement } from "../../helpers/achievementHelpers";
import { parseJson } from "../../helpers/parseJson";
import { promoFilterAndSettings, statusForTournament } from "../../helpers/promoHelpers";
import { isQuest } from "../../helpers/questHelpers";
import { PromoType } from "../../models/enums/tournaments";
import type { ISnippetItemCMS } from "../../services/api/DTO/CMS";
import type { IPlayersList, ITournament, ITournamentsList } from "../../services/api/DTO/tournamentsDTO";
import { useBannerStore } from "../banners";
import { useCMS } from "../CMS";

export const useTournamentsStore = defineStore("tournamentsStore", () => {
    const currentTournament = ref<Partial<ITournament> | null>(null);
    const currentUserTournamentsStatuses = ref<IPlayersList>([]);
    const recentTournaments = ref<ITournamentsList>([]);
    const tournamentsList = ref<ITournamentsList>([]);
    const userTournaments = ref<ITournamentsList>([]);
    const { snippets } = storeToRefs(useCMS());
    const { banners } = storeToRefs(useBannerStore());

    const getAllTournamentsOnlyUser = computed(() => {
        return promoFilterAndSettings(tournamentsList.value, PromoType.TOURNAMENT);
    });

    const getTournamentsList = computed(() => {
        const tournaments = tournamentsList.value.filter(({ frontend_identifier }) => {
            return !isQuest(frontend_identifier) && !isAchievement(frontend_identifier);
        });
        return promoFilterAndSettings(tournaments, PromoType.TOURNAMENT);
    });

    const getCustomTournamentsList = computed(() => {
        try {
            const tournaments = snippets.value
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

    const getCurrentTournament = computed(() => {
        if (!currentTournament.value?.frontend_identifier) {
            return {};
        }

        const banner = banners.value.find(({ frontend_identifier }) => {
            return currentTournament.value?.frontend_identifier &&
                frontend_identifier?.includes(currentTournament.value?.frontend_identifier);
        });

        return {
            ...currentTournament.value,
            // @ts-expect-error Property 'status' does not exist on type 'ITournament'.
            status: statusForTournament(currentTournament.value),
            type: PromoType.TOURNAMENT,
            file: {
                ...banner,
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
            const image = tournamentsList.value.filter(({ id }) => {
                return currentTournament.value?.frontend_identifier &&
                    String(id).includes(currentTournament.value?.frontend_identifier);
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

    function reloadTournaments(): void {
        currentTournament.value = null;
    }

    function clearTournamentUserData(): void {
        currentUserTournamentsStatuses.value = [];
        userTournaments.value = [];
        tournamentsList.value = [];
    }

    function setRecentTournaments(newList: ITournamentsList): void {
        recentTournaments.value = newList;
    }

    function setTournamentsList(newList: ITournamentsList): void {
        tournamentsList.value = newList;
    }

    function setCurrentTournament(tournament: Partial<ITournament> | null): void {
        currentTournament.value = tournament;
    }

    function setCurrentUserTournamentsStatuses(statuses: IPlayersList): void {
        currentUserTournamentsStatuses.value = statuses;
    }

    function setUserTournaments(tournaments: ITournamentsList): void {
        userTournaments.value = tournaments;
    }

    function updateUserTournament(indexTourForUpdate: number, indexUserForUpdate: number, newStatus: IPlayersList[number]): void {
        userTournaments.value[indexTourForUpdate].top_players[indexUserForUpdate] = newStatus;
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

        setTournamentsList,
        setCurrentTournament,
        setCurrentUserTournamentsStatuses,
        reloadTournaments,
        setUserTournaments,
        setRecentTournaments,
        clearTournamentUserData,
        updateUserTournament,
    };
});
