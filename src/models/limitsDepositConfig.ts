export type LimitsDepositMinDep = {
    minDep?: {
        daily?: number;
        weekly?: number;
        monthly?: number;
    };
};

export type LimitsDepositConfigData = Record<string, LimitsDepositMinDep>;
