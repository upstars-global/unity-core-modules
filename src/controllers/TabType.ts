import { log } from "./Logger";

export class TabType {
    private title: string;

    constructor(public name = "", title = "") {
        this.title = title || this.name;
    }
}

export class TabsType {
    private _active: TabType | unknown;

    constructor(public name: string, public list: TabType[], active: TabType | unknown) {
        if (!list || !Array.isArray(list)) {
            log.error("TABS_CREATE", new Error("List of tabs has be array"));
        }

        if (active && !(active instanceof TabType)) {
            log.error("TABS_CREATE", new Error("Active tab has be instance of Tab class"));
        }

        if (active) {
            this._active = active;
        } else {
            [ this._active ] = this.list;
        }
    }

    get active() {
        return this._active;
    }

    set active(tab: TabType | unknown) {
        this._active = tab;
    }
}
