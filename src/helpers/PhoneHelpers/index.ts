import countryCodes from "./countryCodes";

// @ts-expect-error -- TS7006: Parameter 'phone' implicitly has an 'any' type.
export function getCountryByPhone(phone) {
    if (!phone) {
        return null;
    }
    const phoneLength = phone.length;
    for (let i = phoneLength; i > 0; i--) {
        const phoneCode = phone.slice(0, i);
        // @ts-expect-error -- TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ "03": string; "06": string; "09": string; "7": string; "1": string; "20": string; "27": string; "30": string; "31": string; "32": s
        if (countryCodes[phoneCode]) {
            // @ts-expect-error -- TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ "03": string; "06": string; "09": string; "7": string; "1": string; "20": string; "27": string; "30": string; "31": string; "32": s
            return countryCodes[phoneCode];
        }
    }
    return null;
}

// @ts-expect-error -- TS7006: Parameter 'countryCode' implicitly has an 'any' type.
export function getPhoneCodeOfCountry(countryCode) {
    if (!countryCode) {
        return null;
    }
    return Object.entries(countryCodes).find(([ , codeCountry ]) => {
        return codeCountry === countryCode.toLowerCase();
    })?.[0];
}
