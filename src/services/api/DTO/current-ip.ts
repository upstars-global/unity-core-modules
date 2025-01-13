import { Currencies } from "../../../models/enums/currencies";

export type ICurrentIP = {
  ip: string;
  country_code: string;
  region_code: null,
  default_currency: Currencies

};
