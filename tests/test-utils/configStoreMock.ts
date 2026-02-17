import { reactive, ref } from "vue";

import { UnityConfig } from "../../types/configProjectTypes";

export type DefaultProjectConfigMock = UnityConfig & {
    featureFlags?: {
        enableAllProviders?: boolean;
        enableMysticJackpots?: boolean;
    }
};

export type DefaultConfigMock = {
    $defaultProjectConfig?: DefaultProjectConfigMock;
};

export function createConfigStoreMock(overrides: Partial<DefaultConfigMock> = {}) {
    const baseProjectConfig: DefaultProjectConfigMock = {
        featureFlags: {
            enableAllProviders: true,
            enableMysticJackpots: false,
            enableConpoints: true,
        },
    };

    const projectConfig: DefaultProjectConfigMock = {
        ...baseProjectConfig,
        ...overrides.$defaultProjectConfig,
        featureFlags: {
            ...baseProjectConfig.featureFlags,
            ...overrides.$defaultProjectConfig?.featureFlags,
        },
    };

    return {
        useConfigStore: () => reactive({
            $defaultProjectConfig: projectConfig,
        }),
    };
}
