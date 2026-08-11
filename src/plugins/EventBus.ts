// EventBus.js
import { TinyEmitter } from "tiny-emitter";
import type { App } from "vue";

type EventCallback = (...args: never[]) => unknown;

class EventBusWrapper {
    private emitter: TinyEmitter;

    constructor() {
        this.emitter = new TinyEmitter();
    }

    $on(event: string, callback: EventCallback) {
        this.emitter.on(event, callback);
    }

    $off(event: string, callback: EventCallback) {
        this.emitter.off(event, callback);
    }

    $emit(event: string, ...args: unknown[]) {
        this.emitter.emit(event, ...args);
    }

    $once(event: string, callback: EventCallback) {
        this.emitter.once(event, callback);
    }
}

export const EventBus = new EventBusWrapper();

export const BUS_EVENTS = {
    GAME_FRAME_LOADED: "game.frame.loaded",
    ADVENTURE_CALENDAR_SET_INDEX: "adventure.calendar.set.index",
    CHAT_SUPPORT_TOGGLE: "chat.toggle",
    AUTH_ERROR: "auth-error",
    MAINTENANCE_MODE: "maintenance-mode",
    CF_CHALLENGE_REQUIRED: "cf-challenge-required",
};

export const eventBusPlugin = {
    install(app: App) {
        app.config.globalProperties.$bus = EventBus;
    },
};
