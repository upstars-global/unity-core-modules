function addCoveryScript() {
    if (typeof window === "object") {
        window.antifrodScriptsPath = "/svc/af/assets/js/";
    }
    const coveryScript = document.createElement("script");
    const antifrodScriptsPath = window.antifrodScriptsPath || "/svc/af/assets/js/";

    coveryScript.language = "javascript";
    coveryScript.type = "text/javascript";
    coveryScript.async = true;
    coveryScript.src = "".concat(antifrodScriptsPath, "c-dfp.js");

    if (typeof window === "object" && !DEV) {
        window.document.querySelector("head").append(coveryScript);
    }
}

function deviceFingerprint() {
    if (typeof window !== "object" || typeof window.dfpObj !== "object") {
        return "";
    }

    return window.dfpObj.getDFP() || "";
}

export default { addCoveryScript, deviceFingerprint };
