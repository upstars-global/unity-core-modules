import * as Sentry from "@sentry/vue";
import config from "@theme/configs/config";
import type { App } from "vue";
import type { Router } from "vue-router";

import { useContextStore } from "../../store/context";
import { useSettings } from "../../store/settings";
import { FullStory } from "./FullStory";
import { GTMController } from "./GTMController";
import { HotJar } from "./HotJar";
import { ValdemoroController } from "./ValdemoroController";

export const MetriksController = {
    init(app: App, {
        user,
        router,
    }: {
        user: Record<string, unknown>;
        router: Router;
    }) {
        const { isBotUA: isBot } = useContextStore();
        const { valdemoroSrc } = useSettings();

        if (config.tagManagerId) {
            GTMController.init(app, router, config.tagManagerId);
        }

        if (!isBot && (!DEV || FORCE_RUN_ANALYTICS)) {
            if (config.fullStoryId) {
                FullStory.init(config.fullStoryId, user);

                FullStory.getCurrentSessionURL((url: string) => Sentry.setTag("fullstory_session_url", url));
            }

            if (config.hotjar_id) {
                HotJar.init(config.hotjar_id, 6);
            }

            if (valdemoroSrc) {
                ValdemoroController.init({ src: valdemoroSrc });
            }
        }
    },
};
