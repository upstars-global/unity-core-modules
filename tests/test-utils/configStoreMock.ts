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

export async function createConfigStoreMock(
    overrides: Partial<DefaultConfigMock> = {},
) {
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

    const { useConfigStore: actualUseConfigStore } = await import("../../src/store/configStore");

    return {
        useConfigStore: () => {
            const actual = actualUseConfigStore();

            actual.$defaultProjectConfig = projectConfig;

            return actual;
        },
    };
}
