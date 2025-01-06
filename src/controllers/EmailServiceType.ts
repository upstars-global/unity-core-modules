export class EmailServiceType {
    private _image: string;
    private _link: string;
    private _domain: string | string[] = [];
    private _normalizeDomain: string | string[] = [];

    /**
     * Email service
     * @param {String | String[]} domain Value or list of service domains
     * @param {String} img Link for email service instruction image
     * @param {String} link Link to email service
     * */
    constructor(domain:string | string[], img: string, link: string) {
        this.domain = domain;
        this._image = img;
        this._link = link;
    }

    /**
     * Normalize domain by adding @ at beginning and . at end
     * @param {String} domain Domain for normalizing
     * @returns {String} Normalized domain
     * */
    normalizeDomain(domain: string) {
        let newDomain = domain;
        if (!newDomain.includes("@")) {
            newDomain = `@${ newDomain }`;
        }
        if (!newDomain.includes(".")) {
            newDomain = `${ newDomain }.`;
        }
        return newDomain;
    }

    set domain(value) {
        this._domain = value;
        if (typeof value === "string") {
            this._normalizeDomain = this.normalizeDomain(value);
        } else {
            this._normalizeDomain = value.map((domain) => {
                return this.normalizeDomain(domain);
            });
        }
    }

    get domain() {
        return this._domain;
    }

    get image() {
        return this._image;
    }

    get link() {
        return this._link;
    }

    /**
     * Handles the email address to check the domain for coincidence
     * @param {String} email Email for check
     * @returns {Boolean}
     * */
    match(email: string) {
        if (typeof this._normalizeDomain === "string") {
            return email.includes(this._normalizeDomain);
        }
        return this._normalizeDomain.some((domain) => {
            return email.includes(domain);
        });
    }
}
