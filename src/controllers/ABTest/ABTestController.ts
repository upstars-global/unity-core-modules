import { ID_GROUP_FOR_PAIRED_ID, ID_GROUP_FOR_UNPAIRED_ID } from "@config/groupAB";
import featureFlags from "@theme/configs/featureFlags";

import { useUserInfo } from "../../store/user/userInfo";
import { useUserStatuses } from "../../store/user/userStatuses";
import { StagController } from "../StagController";

type variantAType = 0;
type variantBType = 1;

const variantA: variantAType = 0;
const variantB: variantBType = 1;

export const groupForVariantA = ID_GROUP_FOR_PAIRED_ID;
export const groupForVariantB = ID_GROUP_FOR_UNPAIRED_ID;

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

export class ABTestController {
    static get variantByStag(): ABResultType | null {
        const stagInfo = StagController.getStagInfo();

        if (stagInfo?.stagId || stagInfo?.stagVisit) {
            return parseInt((stagInfo.stagVisit || stagInfo.stagId)?.slice(-1), 16) % 2;
        }

        return null;
    }

    static get variantByUserId(): ABResultType {
        const { getUserInfo: { id } } = useUserInfo();
        return id % 2;
    }

    static get groupByStag(): ABGroupsType {
        return ABTestController.variantByStag ? mapGroupByVariant[ABTestController.variantByStag] : groupForVariantA;
    }

    static get groupById(): ABGroupsType {
        return mapGroupByVariant[ABTestController.variantByUserId];
    }

    static get variantByUserGroup(): ABResultType | null {
        const userStatuses = useUserStatuses();
        const userIncludeInABTest = [ groupForVariantA, groupForVariantB ].find((abID) => {
            return userStatuses.getUserGroups.includes(abID);
        });
        return userIncludeInABTest ? mapVariantToGroup[userIncludeInABTest] : null;
    }

    static get variant(): ABResultType | null {
        if (featureFlags.enableABReg) {
            return ABTestController.variantByUserGroup;
        }
        return null;
    }

    static get isVariantA(): boolean {
        return ABTestController.variant === variantA;
    }

    static get isVariantB(): boolean {
        return ABTestController.variant === variantB;
    }
}

export default new ABTestController();
