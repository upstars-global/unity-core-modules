import type { TranslateResult } from "vue-i18n";

import type { Currencies } from "./enums/currencies";

export enum WSNotificationName {
    PERSONAL_NOTIFICATIONS = "personal_notifications",
    TOURNAMENT_NOTIFICATIONS = "tournament_notifications",
    PAYMENTS_CHANGES = "payments_changes",
    BONUSES_CHANGES = "bonuses_changes",
    FREESPINS_CHANGES = "freespins_changes",
}

export enum WSBettingNotificationName {
    BONUS_ISSUED = "bonus_issued"
}

export enum EventsNotice {
    TOURNAMENT_STARTED = "tournament_started",
    PLAYER_JOINED_LEADERBOARD = "player_joined_leaderboard",
    PLAYER_KICKED_FROM_LEADERBOARD = "player_kicked_from_leaderboard",
    TOURNAMENT_STARTS_SOON = "tournament_starts_soon",
}

export interface IConfigNotice {
    id: string;
    message: TranslateResult;
    closeBtn: boolean;
    icon?: boolean;
    link: {
        text: TranslateResult;
        fn: unknown;
    };
}

export interface INotificationContent {
    title?: string;
    button?: {
        title: string;
        toName?: string;
        path?: string
    };
    link?: string;
    icon?: string;
}

export interface INotification {
    id: string | number;
    type: WSNotificationName;
    identifier?: number;
    title?: TranslateResult | string | undefined;
    text?: TranslateResult | string | undefined;
    content?: INotificationContent;
}

export interface INoticeTournamentStarted {
    event: EventsNotice.TOURNAMENT_STARTED;
    id: number;
    title: string;
    start_at: string;
    end_at: string;
    type: WSNotificationName;
}

export interface INoticePlayerJoinedLeaderboard {
    event: EventsNotice.PLAYER_JOINED_LEADERBOARD;
    id: number;
    title: string;
    award_place: number;
    start_at: string;
    end_at: string;
    type: WSNotificationName;
}

export interface INoticePlayerKickedFromLeaderboard {
    event: EventsNotice.PLAYER_KICKED_FROM_LEADERBOARD;
    id: number;
    title: string;
    start_at: string;
    end_at: string;
    type: WSNotificationName;
    award_place?: number;
    previous_place?: number;
}

export interface INoticePersonalNotifications {
    id: string;
    text: string;
    title: string;
    type: WSNotificationName;
}

export interface INoticePaymentsChanges {
    id: number;
    amount_cents: number;
    currency: Currencies;
    action: string;
    payment_system: string;
    recallable: boolean;
    finished_at: string;
    created_at: string;
    success: boolean;
    type: WSNotificationName;
}

export type TournamentNotice = INoticePlayerKickedFromLeaderboard |
    INoticePlayerJoinedLeaderboard |
    INoticeTournamentStarted;
