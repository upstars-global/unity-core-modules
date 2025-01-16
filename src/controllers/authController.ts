import { routeNames } from "@router/routeNames";
import { storeToRefs } from "pinia";

import { BUS_EVENTS, EventBus as bus } from "../plugins/EventBus";
import { useAuth } from "../store/auth/auth";
import { useUserInfo } from "../store/user/userInfo";

let $router = {};

function resetAuthData(redirect) {
    if (redirect) {
        $router.push({ name: redirect });
    }
    const { resetAuthData: resetAuthDataAction } = useAuth();
    resetAuthDataAction(null);
    bus.$emit("user.logout");
}

function init(router) {
    $router = router;
    bus.$on(BUS_EVENTS.AUTH_ERROR, () => resetAuthData(routeNames.login));

    if (router && router.beforeEach) {
        router.beforeEach((to, from, next) => {
            const { getIsLogged } = storeToRefs(useUserInfo());

            const userLoggedIn = getIsLogged.value;

            const requiresAuth = to.matched.some((record) => {
                return record.meta.requiresAuth;
            });

            if (requiresAuth) {
                if (!userLoggedIn) {
                    return next({
                        name: routeNames.registration,
                        query: { redirect: to.fullPath },
                    });
                }
                return next();
            }

            const requiresGuest = to.matched.some((record) => {
                return record.meta.requiresGuest;
            });
            if (requiresGuest) {
                if (userLoggedIn) {
                    return next({ name: routeNames.main });
                }
                return next();
            }

            return next();
        });
    }
}

export default {
    resetAuthData,
    init,
};
