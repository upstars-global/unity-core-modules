// EventBus.js
import { TinyEmitter } from "tiny-emitter";

class EventBusWrapper {
    private emitter: TinyEmitter;
    
    constructor() {
        this.emitter = new TinyEmitter();
    }

    $on(event, callback) {
        this.emitter.on(event, callback);
    }

    $off(event, callback) {
        this.emitter.off(event, callback);
    }

    $emit(event, ...args) {
        this.emitter.emit(event, ...args);
    }

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
};

export const eventBusPlugin = {
    install(app) {
        app.config.globalProperties.$bus = EventBus;
    },
};
