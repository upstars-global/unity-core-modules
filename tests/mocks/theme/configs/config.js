const featureFlags = {};
const pus18 = "18plus.svg";
const gamblingTherapypus = "gambling-therapy.svg";
const GDPR = "GDPR.svg";
const PSIDSS = "PSIDSS.svg";
const SSL = "SSL.svg";
const TLS = "TLS.svg";

export default {
    featureFlags,
    currencyDefault: "EUR",
    tagManagerId: "GTM-111",
    hotjar_id: "",
    licence: false,
    licenseImg: "",
    licenceId: "",
    licenceScriptId: "",
    licenceScriptSrc: "",
    surveyMonkeyId: "",
    liveChat: {
        license: "",
    },
    freshChat: {
        token: "111",
        widgetUuid: "222",
    },
    DMCA: {
        id: "",
    },
    fullStoryId: "o-111-na1",
    mapIdWidgetId: "",
    mainDomaine: "example.com",
    payments: [
        "visa_mastercard", "coins_paid",
        "bitcoin_cash", "bitcoin", "dogecoin",
        "pay_by_voucher", "litecoin", "tether",
        "etherum", "kluwp", "inpay", "bank_transfer",
        "zimpler", "neosurf", "mifinity", "skrill",
        "neteller", "venuspoint", "paysafecard",
        "idebit", "instadebit", "online_bank_transfer",
        "cardpay", "cashtocode", "eco_payz", "muchbetter",
        "combined", "flexepin", "volt", "directbankingeu",
        "rapidtransfer", "bankintl",
    ],
    paymentsEE: [
        "visa_mastercard", "skrill", "neteller",
        "interac_finteqhub", "mifinity", "muchbetter",
        "paysafecard", "inpay",
    ],
    PROMO_TOOLTIP_TIMER_MINUTES: 10,
    socials: [

    ],
    awardsNominations: [

    ],
    trust: [

        {
            icon: SSL,
            alt: "SSL",

        },

        {
            icon: GDPR,
            alt: "GDPR",

        },

        {
            icon: PSIDSS,
            alt: "PSI DSS",

        },

        {
            icon: TLS,
            alt: "TLS",

        },
    ],
    licenses: [
        {
            icon: pus18,
        },
        {
            icon: gamblingTherapypus,
            alt: "Gambling Therapy",
            to: "https://www.gamblingtherapy.org/",
            blank: true,
        },

    ],
    contacts: {
        phone: "",
        email: "support@example.com",
    },
    defaultAcceptTerms: false,
    idlePageTitle: {
        enabled: true,
        texts: "idlePageTitle",
        idleStartDelay: 0,
        changeDelay: 2000,
    },
    depositFistAmount: 50,
    theme: "theme-light",
    showEmpCard: false,
};
