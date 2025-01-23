import { COUNTRIES } from "./constsLocales";


export const STATE_POSTS_CA_START: Record<string, string> = {
    A: "Newfoundland and Labrador",
    B: "Nova Scotia",
    C: "Prince Edward Island",
    E: "New Brunswick",
    G: "Quebec",
    H: "Quebec",
    J: "Quebec",
    K: "Ontario",
    L: "Ontario",
    M: "Ontario",
    N: "Ontario",
    P: "Ontario",
    R: "Manitoba",
    S: "Saskatchewan",
    T: "Alberta",
    V: "British Columbia",
    X: "Northwest Territories",
    Y: "Yukon Territory",
};

function getStateForCA(postCode: string) {
    const firstLetter = postCode[0].toUpperCase();

    return STATE_POSTS_CA_START[firstLetter];
}

const getStatesCollectionByCountry = {
    [COUNTRIES.CANADA]: getStateForCA,
};

export function getStateByCounty(countryUser: string, postCode: string) {
    if (!countryUser || !getStatesCollectionByCountry[countryUser]) {
        return null;
    }

    return getStatesCollectionByCountry[countryUser](postCode);
}
