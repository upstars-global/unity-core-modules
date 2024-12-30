import countryCodes from "./countryCodes";

export function getCountryByPhone(phone) {
    if (!phone) {
        return null;
    }
    const phoneLength = phone.length;
    for (let i = phoneLength; i > 0; i--) {
        const phoneCode = phone.slice(0, i);
        if (countryCodes[phoneCode]) {
            return countryCodes[phoneCode];
        }
    }
    return null;
}

export function getPhoneCodeOfCountry(countryCode) {
    if (!countryCode) {
        return null;
    }
    return Object.entries(countryCodes).find(([ , codeCountry ]) => {
        return codeCountry === countryCode.toLowerCase();
    })?.[0];
}
