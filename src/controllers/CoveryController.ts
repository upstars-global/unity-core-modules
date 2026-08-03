function addCoveryScript() {
    if (typeof window === "object") {
        // @ts-expect-error -- TS2339: Property 'antifrodScriptsPath' does not exist on type 'Window & typeof globalThis'.
        window.antifrodScriptsPath = "/svc/af/assets/js/";
    }
    const coveryScript = document.createElement("script");
    // @ts-expect-error -- TS2339: Property 'antifrodScriptsPath' does not exist on type 'Window & typeof globalThis'.
    const antifrodScriptsPath = window.antifrodScriptsPath || "/svc/af/assets/js/";

    // @ts-expect-error -- TS2339: Property 'language' does not exist on type 'HTMLScriptElement'.
    coveryScript.language = "javascript";
    coveryScript.type = "text/javascript";
    coveryScript.async = true;
    coveryScript.src = "".concat(antifrodScriptsPath, "c-dfp.js");

    if (typeof window === "object" && !DEV) {
        // @ts-expect-error -- TS2531: Object is possibly 'null'.
        window.document.querySelector("head").append(coveryScript);
    }
}

function deviceFingerprint() {
    // @ts-expect-error -- TS2339: Property 'dfpObj' does not exist on type 'Window & typeof globalThis'.
    if (typeof window !== "object" || typeof window.dfpObj !== "object") {
        return "";
    }

    // @ts-expect-error -- TS2339: Property 'dfpObj' does not exist on type 'Window & typeof globalThis'.
    return window.dfpObj.getDFP() || "";
}

export default { addCoveryScript, deviceFingerprint };
