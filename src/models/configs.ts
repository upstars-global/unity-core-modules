import type { REFERRER } from "@theme/configs/stagConsts";

export interface IStagByReferName {
    pages: {
        [referrer in REFERRER]: {
            [path: string]: string;
        }
    } | null;
    countries: {
        [country: string]: {
            [referrer in REFERRER]: string;
        };
    };
}
export type ISurveyConfig = {
    survey_id: string;
    survey_collector_id: string;
    is_enable_widget: boolean;
};

export type IBettingConfig = Record<string, unknown>;
