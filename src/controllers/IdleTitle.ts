import { useConfigStore } from "../store/configStore";

class IdleTitleClass {
    private savedTitle: string | null = null;
    private currentTitleIndex: number = 0;
    private repeatTimer: number | null = null;

    constructor(public titles: string[] = [], private changeDelay = 1000, private startDelay = 0) {
    }

    get idleTitle() {
        const title = this.titles[this.idleTitleIndex];
        this.idleTitleIndex = this.idleTitleIndex + 1;
        return title;
    }

    set idleTitleIndex(value) {
        this.currentTitleIndex = value;
        if (this.currentTitleIndex > this.titles.length - 1) {
            this.currentTitleIndex = 0;
        }
    }

    get idleTitleIndex() {
        return this.currentTitleIndex;
    }

    saveTitle() {
        this.savedTitle = document.title;
    }

    restoreTitle() {
        document.title = this.savedTitle ?? "";
    }

    setIdleTitle() {
        document.title = this.idleTitle;
    }

    start() {
        this.saveTitle();
        setTimeout(() => {
            this.setIdleTitle();
            this.repeatTimer = setInterval(() => {
                this.setIdleTitle();
            }, this.changeDelay);
        }, this.startDelay);
    }

    stop() {
        if (this.repeatTimer) {
            clearInterval(this.repeatTimer);
        }

        this.restoreTitle();
        this.currentTitleIndex = 0;
    }
}

let titleRepeater: IdleTitleClass | null = null;

function getTitleRepeater(): IdleTitleClass {
    if (!titleRepeater) {
        const { $defaultProjectConfig } = useConfigStore();
        const { idlePageTitle } = $defaultProjectConfig;
        titleRepeater = new IdleTitleClass(
            [],
            idlePageTitle.changeDelay,
            idlePageTitle.idleStartDelay,
        );
    }

    return titleRepeater;
}

function visibilityChangeHandler() {
    const repeater = getTitleRepeater();
    switch (document.visibilityState) {
        case "hidden":
            repeater.start();
            break;
        case "visible":
        default:
            repeater.stop();
            break;
    }
}

function init(titles: string[]) {
    const { $defaultProjectConfig } = useConfigStore();
    const { idlePageTitle } = $defaultProjectConfig;

    if (idlePageTitle.enabled) {
        const repeater = getTitleRepeater();
        repeater.titles = titles;
        document.addEventListener("visibilitychange", visibilityChangeHandler, false);
    }
}

export const IdleTitle = {
    init,
};
