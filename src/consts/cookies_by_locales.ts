import { LOCALES } from "./locales";

type IStringDictionary = {
    [key in LOCALES]: string;
};

export const COOKIE_BY_LOCALE: IStringDictionary = {
    [LOCALES.ENGLISH]: "ImVuIg==--cdf2295b990357560929af19e943a17b5e300f29",
    [LOCALES.GERMANY]: "ImRlIg==--e0cac7ed600e8e20136330bf90e2f6e073a92af5",
    [LOCALES.AUSTRALIAN_ENGLISH]: "ImVuLUFVIg==--fbd254fa568c10e641ca5c06ea17b19bfe67073c",
    [LOCALES.CANADIAN_ENGLISH]: "ImVuLUNBIg==--29d218f5f50d9be5f9eace2741de2f23166a8042",
    [LOCALES.CANADIAN_FRANCH]: "ImZyLUNBIg==--d8e86677e99dababc683627b504d0f1809a7d26f",
    [LOCALES.NEW_ZEALAND]: "ImVuLU5aIg==--db4ab3937ac2a25a3bde96826517feece7c2d2d3",
    [LOCALES.NORWEGIAN]: "Im5vIg==--23115d0eb47ba756c988d793797a7a11e5295d6d",
    [LOCALES.ITALIAN]: "Iml0Ig==--c25a46184c511929ff8a9d9e1d2ac1cbe4c674b1",
    [LOCALES.ESTONIAN]: "ImV0Ig==--6741c36ae03da7667902bfc28dae2b3f72a4cad8",
    // [LOCALES.IRELAND]: "ImVuLUlFIg==--3a15d0cea8cef7ae5655b5f7b1628d299ad50e4d",
    // [LOCALES.JAPAN]: "ImphIg==--415e361e5490129e3b4ced0e117175b2c1975335",
    // [LOCALES.BRAZILIAN_PORTUGUESE]: "InB0LUJSIg==--a80e1d55c81d204f67fa8e855240e179d9ef8606",
    [LOCALES.FAKE_AUSTRALIAN_ENGLISH]: "ImVuLUtXIg==--895517e9c964c5fb4fe658b84175ce7ca78f18d4",
};
