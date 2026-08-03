// @ts-expect-error -- TS2307: Cannot find module '@config/customerIO' or its corresponding type declarations.
import { ORGANIZATION_ID, PRODUCT_ID, YOUR_SITE_ID } from "@config/customerIO";

declare global {
  interface Window {
      _cio: unknown;
  }
}

/* eslint-disable*/
function init() {
    if (typeof window !== "undefined") {
        window._cio = window._cio || [];
        (function() {
            let a, b, c;
            // @ts-expect-error -- TS7006: Parameter 'f' implicitly has an 'any' type.
            a = function(f) {
                return function() {
                    // @ts-expect-error -- TS2304: Cannot find name '_cio'.
                    _cio.push([ f ]
                        .concat(Array.prototype.slice.call(arguments, 0)));
                };
            };
            b = [ "load", "identify", "sidentify", "track", "page", "on", "off" ];
            for (c = 0; c < b.length; c++) {
                // @ts-expect-error -- TS2304: Cannot find name '_cio'.
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
                // @ts-expect-error -- TS18047: 's.parentNode' is possibly 'null'.
                s.parentNode.insertBefore(t, s);
            }, 60000);
        }());
    }
}

// @ts-expect-error -- TS7031: Binding element 'idUser' implicitly has an 'any' type.; TS7031: Binding element 'email' implicitly has an 'any' type.; TS7031: Binding element 'createdProfile' implicitly has an 'any' type.
function cioIdentify({ id: idUser, email, created_at: createdProfile, ...data }) {
    const created_at = new Date(createdProfile).getTime() / 1000;

    // @ts-expect-error -- TS2304: Cannot find name '_cio'.
    _cio.identify({
        id: `${ PRODUCT_ID }:${ idUser }`,
        email,
        created_at,
        ...data,
    });
}

// @ts-expect-error -- TS7006: Parameter 'userInfo' implicitly has an 'any' type.
export function cioIdentifyUser(userInfo) {
    if (typeof window === "undefined") {
        return;
    }

    if (!window._cio) {
        init();
    }

    cioIdentify(userInfo);
}

