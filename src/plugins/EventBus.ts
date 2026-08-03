// EventBus.js
import { TinyEmitter } from "tiny-emitter";

class EventBusWrapper {
    private emitter: TinyEmitter;

    constructor() {
        this.emitter = new TinyEmitter();
    }

    // @ts-expect-error -- TS7006: Parameter 'event' implicitly has an 'any' type.; TS7006: Parameter 'callback' implicitly has an 'any' type.
    $on(event, callback) {
        this.emitter.on(event, callback);
    }

    // @ts-expect-error -- TS7006: Parameter 'event' implicitly has an 'any' type.; TS7006: Parameter 'callback' implicitly has an 'any' type.
    $off(event, callback) {
        this.emitter.off(event, callback);
    }

    // @ts-expect-error -- TS7006: Parameter 'event' implicitly has an 'any' type.; TS7019: Rest parameter 'args' implicitly has an 'any[]' type.
    $emit(event, ...args) {
        this.emitter.emit(event, ...args);
    }

    // @ts-expect-error -- TS7006: Parameter 'event' implicitly has an 'any' type.; TS7006: Parameter 'callback' implicitly has an 'any' type.
    $once(event, callback) {
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
    // @ts-expect-error -- TS7006: Parameter 'app' implicitly has an 'any' type.
    install(app) {
        app.config.globalProperties.$bus = EventBus;
    },
};
