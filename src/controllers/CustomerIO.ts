// @ts-expect-error -- TS2307: Cannot find module '@config/customerIO' or its corresponding type declarations.
import { ORGANIZATION_ID, PRODUCT_ID, YOUR_SITE_ID } from "@config/customerIO";

import type { IUserInfo } from "../models/user";

/* eslint-disable*/
function init() {
    if (typeof window !== "undefined") {
        window._cio = (window._cio || []) as CustomerIOQueue;
        (function() {
            let a, b, c;
            a = function(f: string) {
                return function() {
                    _cio.push([ f ]
                        .concat(Array.prototype.slice.call(arguments, 0)));
                };
            };
            b = [ "load", "identify", "sidentify", "track", "page", "on", "off" ];
            for (c = 0; c < b.length; c++) {
                _cio[b[c]] = a(b[c]);
            }
            let t = document.createElement("script");

            t.async = true;
            t.id = "cio-tracker";
            t.setAttribute("data-site-id", YOUR_SITE_ID);
            t.setAttribute("data-use-array-params", "true");
            t.setAttribute("data-in-app-org-id", ORGANIZATION_ID);
            t.setAttribute("data-use-in-app", "true");
            t.src = "https://assets.customer.io/assets/track.js";

            setTimeout(() => {
                let s = document.getElementsByTagName("script")[0];
                s!.parentNode!.insertBefore(t, s!);
            }, 60000);
        }());
    }
}

function cioIdentify({ id: idUser, email, created_at: createdProfile, ...data }: IUserInfo) {
    const created_at = new Date(createdProfile).getTime() / 1000;

    _cio.identify({
        id: `${ PRODUCT_ID }:${ idUser }`,
        email,
        created_at,
        ...data,
    });
}

export function cioIdentifyUser(userInfo: IUserInfo) {
    if (typeof window === "undefined") {
        return;
    }

    if (!window._cio) {
        init();
    }

    cioIdentify(userInfo);
}
