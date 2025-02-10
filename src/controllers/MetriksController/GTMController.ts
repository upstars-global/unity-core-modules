import { createGtm, type GtmSupport } from "@gtm-support/vue-gtm";
import featureFlags from "@theme/configs/featureFlags";
import { storeToRefs } from "pinia";
import { App } from "vue";
import { Router } from "vue-router";

import { useCommon } from "../../store/common";
import { useContextStore } from "../../store/context";
import { useMultilangStore } from "../../store/multilang";
import { useRootStore } from "../../store/root";
import { useUserInfo } from "../../store/user/userInfo";
import { ABTestController } from "../ABTest/ABTestController";
import { log } from "../Logger";
import { StagController } from "../StagController";
import { getUtmParamsFromCookies } from "../utmParams";
import {
    CASHBOX_EVENTS,
    COMMON_EVENT,
    COMMON_EVENTS,
    FORM_EVENTS,
    GAME_EVENTS,
    LOGIN_EVENTS,
    LOOTBOX_WHEEL,
    PERSONAL_INFO_POPUP,
    PLACES,
    REGISTRATION_EVENTS,
} from "./gtmConstants";

type ISubmitPageViewCb = (additional: Record<string, unknown>) => void;

const submitPageView = ($gtm: IGtm) => {
    const { getIsLogged } = storeToRefs(useUserInfo());
    const { getPlatform } = storeToRefs(useRootStore());
    return (additional: Record<string, unknown> = {}) => {
        if (getIsLogged.value) {
            const { getUserInfo: userInfo } = storeToRefs(useUserInfo());

            $gtm.customTrackEvent({
                event: "Pageviewrocketplay",
                userId: userInfo.value.user_id,
                Currency: userInfo.value.currency,
                currencyCode: userInfo.value.currency,
                // @ts-expect-error Property 'locale' does not exist on type 'UserInfo'.
                Country: userInfo.value.locale,
                userAuth: true,
                Affiliate: "not set",
                ...additional,
                Platform: getPlatform.value && getPlatform.value.userAgent,
            });
        } else {
            const { getUserLocale, getUserGeo } = storeToRefs(useMultilangStore());
            const { getDefaultCurrency } = useCommon();

            $gtm.customTrackEvent({
                event: "Pageviewrocketplay",
                userId: "not set",
                Currency: getDefaultCurrency,
                currencyCode: getUserGeo.value,
                Country: getUserLocale.value,
                Affiliate: "not set",
                userAuth: false,
                Platform: getPlatform.value && getPlatform.value.userAgent,
                ...additional,
            });
        }
    };
};

type IEcommerceSubmitPageViewData = {
    id: string;
    amount: number;
};

const eccomerceSubmitPageView = (submitPageViewCb: ISubmitPageViewCb) => ({
    id,
    amount,
}: IEcommerceSubmitPageViewData) => {
    const { isMobile } = storeToRefs(useRootStore());
    submitPageViewCb({
        ecommerce: {
            purchase: {
                actionField: {
                    action: "purchase",
                    affiliation: isMobile ? "mobile" : "desktop",
                    id,
                    revenue: amount,
                },
                products: [
                    {
                        brand: "not set",
                        category: "deposit",
                        id,
                        name: "deposit",
                        price: amount,
                        quantity: 1,
                    },
                ],
            },
        },
    });
};

interface IGtm extends GtmSupport {
  REGISTRATION_EVENTS: typeof REGISTRATION_EVENTS;
  CASHBOX_EVENTS: typeof CASHBOX_EVENTS;
  PLACES: typeof PLACES;
  LOGIN_EVENTS: typeof LOGIN_EVENTS;
  COMMON_EVENTS: typeof COMMON_EVENTS;
  LOOTBOX_WHEEL: typeof LOOTBOX_WHEEL;
  GAME_EVENTS: typeof GAME_EVENTS;
  PERSONAL_INFO_POPUP: typeof PERSONAL_INFO_POPUP;
  FORM_EVENTS: typeof FORM_EVENTS;
  customTrackEvent: (data: Record<string, unknown>, eventPlace?: string) => void;
  submitPageView: () => void;
  eccomerceSubmitPageView: (data: IEcommerceSubmitPageViewData) => void;
}

const gtmDummy = {
    customTrackEvent: (data: Record<string, unknown>, eventPlace?: string) => {
    },
    submitPageView: () => {
    },
    eccomerceSubmitPageView: (data: IEcommerceSubmitPageViewData) => {
    },
};

let $gtm = {
    ...gtmDummy,
    REGISTRATION_EVENTS,
    CASHBOX_EVENTS,
    PLACES,
    LOGIN_EVENTS,
    COMMON_EVENTS,
    LOOTBOX_WHEEL,
    PERSONAL_INFO_POPUP,
    GAME_EVENTS,
    FORM_EVENTS,
} as IGtm;

export function useGtm() {
    return $gtm as IGtm;
}

export const GTMController = {
    init(app: App, router: Router, gtmId: string) {
        const { isBotUA } = useContextStore();
        if (isBotUA) {
            app.config.globalProperties.$gtm = $gtm as IGtm;

            return $gtm;
        }

        app.use(createGtm({
            id: gtmId,
            defer: true,
            debug: DEV && FORCE_RUN_ANALYTICS,
            vueRouter: router,
            loadScript: !DEV || FORCE_RUN_ANALYTICS,
        }));

        $gtm = app.config.globalProperties.$gtm as IGtm;

        if ($gtm) {
            $gtm.REGISTRATION_EVENTS = REGISTRATION_EVENTS;
            $gtm.CASHBOX_EVENTS = CASHBOX_EVENTS;
            $gtm.PLACES = PLACES;
            $gtm.LOGIN_EVENTS = LOGIN_EVENTS;
            $gtm.COMMON_EVENTS = COMMON_EVENTS;
            $gtm.LOOTBOX_WHEEL = LOOTBOX_WHEEL;
            $gtm.GAME_EVENTS = GAME_EVENTS;
            $gtm.PERSONAL_INFO_POPUP = PERSONAL_INFO_POPUP;
            $gtm.FORM_EVENTS = FORM_EVENTS;
            $gtm.customTrackEvent = (data, eventPlace) => {
                try {
                    if (data?.event === COMMON_EVENT) { // rest lock sending `rocketplay` events
                        return;
                    }
                    const { getUserInfo: userInfo } = storeToRefs(useUserInfo());
                    $gtm.trackEvent({
                        eventPlace: eventPlace || router.currentRoute.value.meta?.gtmPlace || PLACES.DEFAULT,
                        utmParams: getUtmParamsFromCookies(),
                        partnerStag: StagController.getStag(),
                        userId: userInfo.value.id,
                        ...(featureFlags.enableABReg ? { experiment: `exp_8375 | ${ ABTestController.variant }` } : {}),
                        ...data,
                    });
                } catch (err) {
                    log.error("CUSTOM_TRACK_EVENT_ERROR", err);
                }
            };

            $gtm.submitPageView = submitPageView($gtm);
            $gtm.eccomerceSubmitPageView = eccomerceSubmitPageView($gtm.submitPageView);

            router.afterEach(() => {
                return $gtm.submitPageView();
            });
        }
    },
};

export default GTMController;
