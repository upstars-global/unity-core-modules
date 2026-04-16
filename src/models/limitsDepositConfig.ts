export type LimitsDepositMinDep = {
    minDep?: {
        day?: number;
        weekly?: number;
        monthly?: number;
    };
};

export type LimitsDepositConfigData = Record<string, LimitsDepositMinDep>;
