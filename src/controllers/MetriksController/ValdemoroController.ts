const SCRIPT_RELOAD_INTER = 60 * 60 * 1000;
const LOCALSTORAGE_KEY = "valdemoro_timeout";

interface IValdemoroConfig {
    enabled?: boolean;
    src: string;
}

function pingValdemoro(config: IValdemoroConfig) {
    if (!config.enabled) {
        return;
    }
    const script = document.createElement("script");
    script.async = true;
    script.type = "text/javascript";
    script.src = config.src;
    document.head.appendChild(script);
    localStorage.setItem(LOCALSTORAGE_KEY, String(Number(new Date())));

    setTimeout(() => {
        document.head.removeChild(script);
        pingValdemoro(config);
    }, SCRIPT_RELOAD_INTER);
}

function init(config: IValdemoroConfig) {
    const localTimeout = localStorage.getItem(LOCALSTORAGE_KEY);
    if (localTimeout) {
        setTimeout(() => {
            pingValdemoro(config);
        }, Number(localTimeout) - Number(new Date()) + SCRIPT_RELOAD_INTER);
    } else {
        pingValdemoro(config);
    }
}

export const ValdemoroController = {
    init,
};
