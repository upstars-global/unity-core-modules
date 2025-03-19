import type { Currencies } from "./enums/currencies";

export type ICoinspaidAddresses = Record<Currencies, string>;

export type CurrencyCode = "NZD" | "BRL" | "NOK" | "JPY" | "BTC" | "LTC" | "ETH" | "BCH" | "DOGE" | "USDT";

export type Step = {
  min: number;
  max: number | "Infinity";
  step: number;
};

export type CurrencyConfig = {
  defaultAmount: number;
  rounding: number;
  steps: Step[];
};

export type CurrencyData = Record<CurrencyCode, CurrencyConfig>;
