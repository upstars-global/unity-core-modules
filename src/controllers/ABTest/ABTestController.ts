import featureFlags from "@theme/configs/featureFlags";

import { useUserInfo } from "../../store/user/userInfo";
import { useUserStatuses } from "../../store/user/userStatuses";
import stagController from "../StagController";

type variantAType = 0;
type variantBType = 1;

const variantA: variantAType = 0;
const variantB: variantBType = 1;

export const groupForVariantA = 543;
export const groupForVariantB = 544;

const mapVariantToGroup: { [index: number]: number } = {
    [groupForVariantA]: variantA,
    [groupForVariantB]: variantB,
};

const mapGroupByVariant = {
    [variantA]: groupForVariantA,
    [variantB]: groupForVariantB,
};

enum ABResultType { variantAType, variantBType}

enum ABGroupsType { variantAType, variantBType}

class ABTestController {
    get variantByStag(): ABResultType | null {
        const stagInfo = stagController.getStagInfo();

        if (stagInfo?.stagId || stagInfo?.stagVisit) {
            return parseInt((stagInfo.stagVisit || stagInfo.stagId)?.slice(-1), 16) % 2;
        }

        return null;
    }

    get variantByUserId(): ABResultType {
        const { getUserInfo: { id } } = useUserInfo();
        return id % 2;
    }

    get groupByStag(): ABGroupsType {
        return this.variantByStag ? mapGroupByVariant[this.variantByStag] : groupForVariantA;
    }

    get groupById(): ABGroupsType {
        return mapGroupByVariant[this.variantByUserId];
    }

    get variantByUserGroup(): ABResultType | null {
        const userStatuses = useUserStatuses();
        const userIncludeInABTest = [ groupForVariantA, groupForVariantB ].find((abID) => {
            return userStatuses.getUserGroups.includes(abID);
        });
        return userIncludeInABTest ? mapVariantToGroup[userIncludeInABTest] : null;
    }

    get variant(): ABResultType | null {
        if (featureFlags.enableABReg) {
            return this.variantByUserGroup;
        }
        return null;
    }

    get isVariantA(): boolean {
        return this.variant === variantA;
    }

    get isVariantB(): boolean {
        return this.variant === variantB;
    }
}

export default new ABTestController();
