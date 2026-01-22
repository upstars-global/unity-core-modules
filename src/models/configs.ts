import type { ResolvedReferrer } from "../../types/configProjectTypes";

export interface IStagByReferName {
    pages: {
        [referrer in ResolvedReferrer]: {
            [path: string]: string;
        }
    } | null;
    countries: {
        [country: string]: {
            [referrer in ResolvedReferrer]: string;
        };
    };
}

export type ISurveyConfig = {
    survey_id: string;
    survey_collector_id: string;
    is_enable_widget: boolean;
};

export type IBettingConfig = Record<string, unknown>;
