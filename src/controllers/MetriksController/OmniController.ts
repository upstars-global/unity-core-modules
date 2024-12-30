import { CookieController } from "../CookieController";


class Omni {
    init({ url, disabled, refCode, events = {} } = {}) {
        this.url = url;
        this.enabled = !disabled;
        this.refCode = refCode;
        this.events = events;
    }

    get baseUrl() {
        return `${ this.url }?`;
    }

    getUrl({ src }) {
        let url = this.baseUrl;
        if (src) {
            url = `${ url }src=${ src }`;
        }

        return url;
    }

    tickImage(url) {
        const img = document.createElement("img");
        img.src = url;
        return true;
    }

    get cookieRefCode() {
        return CookieController.get("qs") || "";
    }

    isRefCodeMatch() {
        return this.cookieRefCode.includes(this.refCode);
    }

    baseEmit({ src }) {
        if (this.enabled) {
            return this.tickImage(this.getUrl({ src }));
        }
        return false;
    }

    emit(src) {
        return this.baseEmit({ src });
    }

    emitHit() {
        return this.emit(this.events && this.events.hit);
    }

    emitRegistration() {
        return this.emit(this.events && this.events.registration);
    }
}

export default {
    install: (app, options) => {
        // inject a globally available $translate() method
        const omni = new Omni();
        omni.init(options);
        app.config.globalProperties.$omni = omni;
    },
};
