import type { Component } from "vue";

import { log } from "./Logger";

export class StateType {
    constructor(public name: string, public component: Component) {
    }
}

export class StatesType {
    private _list: StateType[] = [];
    private _namespace: string;
    private _active: StateType | null | unknown = null;

    constructor(namespace: string, states: StateType[], active: StateType | null = null) {
        this._namespace = namespace;
        this.list = states;
        this.active = active || this.list[0];
    }

    get name() {
        return this._namespace;
    }

    get list() {
        return this._list;
    }

    set list(states: StateType[]) {
        if (!states || !Array.isArray(states)) {
            log.error("STATES_CREATE", new Error("List of states has be array"));
        }

        if (states.length === 0) {
            log.error("STATES_CREATE", new Error("List of states cannot be empty"));
        }
        this._list = states;
    }

    get active() {
        return this._active;
    }

    set active(state: StateType | null | unknown) {
        if (state && !(state instanceof StateType)) {
            log.error("STATES_ACTIVE_CHANGE", new Error("Active state has be instance of State class"));
        }
        this._active = state;
    }
}
