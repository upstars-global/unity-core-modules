export type ICookieOptions = {
    expires?: string | number | Date;
    path?: string;
    "path=/"?: boolean;
    domain?: string;
    secure?: boolean;
    sameSite?: string;
}

export const CookieController = {
    get: (name: string) => {
        if (typeof document === "undefined") {
            return;
        }

        const pattern = new RegExp(`(?:^|; )${name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1")}=([^;]*)`);
        const matches = document.cookie.match(pattern);
        return matches ? decodeURIComponent(matches[1]) : undefined;
    },
    set: (name: string, val: string, opts: ICookieOptions) => {
        if (typeof document === "undefined") {
            return;
        }

        const options = opts || {} satisfies ICookieOptions;

        let expires = options.expires;

        if (expires) {
            if (typeof expires == "number") {
                const date = new Date();
                date.setTime(date.getTime() + expires * 1000);
                expires = options.expires = date;
            }
            if (expires instanceof Date) {
                options.expires = expires.toUTCString();
            }
        }

        const value = encodeURIComponent(val);

        let updatedCookie = `${ name }=${ value }`;

        for (const propName in options) {
            if (propName) {
                updatedCookie = `${ updatedCookie }; ${ propName }`;
                const propValue = options[propName as keyof ICookieOptions];

                if (propValue !== true) {
                    updatedCookie = `${ updatedCookie }=${ propValue }`;
                }
            }
        }
        document.cookie = updatedCookie;
    },
};

