/* eslint-disable @stylistic/js/max-len */
import { REFERRER_COOKIE_NAME } from "@theme/configs/constsCookies";

import { CookieController } from "../controllers/CookieController";
import { isServer } from "../helpers/ssrHelpers";

export const getDocumentReferrer = (): string | undefined => {
    if (isServer) {
        return;
    }

    return document.referrer || CookieController.get(REFERRER_COOKIE_NAME);
};

export const getAIReferrer = (queryParams: URLSearchParams): string | undefined => {
    const regexUTM: RegExp = /^(chatgpt|openai|gemini|bard|perplexity|claude|copilot|mistral|llama|ai21|grok|deepseek|qwen)(\.com)?(_ai)?$/;
    const regexRef: RegExp = /chat\.openai\.com|chatgpt\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com|chat\.mistral\.ai|x\.ai/;

    const utmSourceQuery = queryParams?.get("utm_source");
    const referrer = getDocumentReferrer();

    return utmSourceQuery?.match(regexUTM)?.[0] || referrer?.match(regexRef)?.[0];
};
