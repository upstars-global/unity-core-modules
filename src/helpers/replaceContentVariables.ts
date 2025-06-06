import { useI18n } from "vue-i18n";

import type { Currencies } from "../models/enums/currencies";
import { useUserBalance } from "../store/user/userBalance";

export function useContentParser() {
    const { rt } = useI18n();
    const { userCurrency } = useUserBalance();

    function replaceContentVariables(content: string, variables: Record<string, Record<Currencies, string>>) {
        const resolvedVariables = Object.entries(variables).reduce((acc: Record<string, string>, [ key, value ]) => {
            acc[key] = value[userCurrency as Currencies] || value.EUR;
            return acc;
        }, {});

        return rt(content, resolvedVariables);
    }

    function formatText(text: string, variables: Record<string, Record<Currencies, string>>) {
        if (!text) {
            return "";
        }

        return variables
            ? replaceContentVariables(text, variables)
            : text;
    }

    return {
        replaceContentVariables,
        formatText,
    };
}
