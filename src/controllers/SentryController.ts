import * as Sentry from "@sentry/vue";
import type { App } from "vue";
import type { Router } from "vue-router";

import { useEnvironments } from "../store/environments";

export function initSentry(app: App, router: Router) {
    const { environment, version } = useEnvironments();
    Sentry.init({
        app,
        dsn: "https://6fd0f1e968b43c058122dce7f0a6748b@o1057380.ingest.sentry.io/4505742595325952",
        environment,
        release: `fe-alpa@${ version }`,
        integrations: [
            Sentry.browserTracingIntegration({ router }),
            Sentry.captureConsoleIntegration({
                levels: [ "warn", "error" ],
            }),
        ],
        tracePropagationTargets: [
            "localhost",
            "^https:\/\/.*rocketplay[0-9]*\.com\/api",
        ],
        tracesSampleRate: 1.0,
        // replaysSessionSampleRate: 0.1,
        // replaysOnErrorSampleRate: 1.0,
    });
}
