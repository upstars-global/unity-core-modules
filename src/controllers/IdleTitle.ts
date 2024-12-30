import config from "@theme/configs/config";

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

const titleRepeater = new IdleTitleClass(
    [],
    config.idlePageTitle.changeDelay,
    config.idlePageTitle.idleStartDelay,
);

function visibilityChangeHandler() {
    switch (document.visibilityState) {
        case "hidden":
            titleRepeater.start();
            break;
        case "visible":
        default:
            titleRepeater.stop();
            break;
    }
}

function init(titles: string[]) {
    if (config.idlePageTitle.enabled) {
        titleRepeater.titles = titles;
        document.addEventListener("visibilitychange", visibilityChangeHandler, false);
    }
}

export const IdleTitle = {
    init,
};
