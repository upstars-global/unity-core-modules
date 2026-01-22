import { useConfigStore } from "../../store/configStore";
import { useUserInfo } from "../../store/user/userInfo";
import { useUserStatuses } from "../../store/user/userStatuses";
import { StagController } from "../StagController";

type variantAType = 0;
type variantBType = 1;

const variantA: variantAType = 0;
const variantB: variantBType = 1;

function getABGroups() {
    const { $defaultProjectConfig } = useConfigStore();
    const { ID_GROUP_FOR_PAIRED_ID, ID_GROUP_FOR_UNPAIRED_ID } = $defaultProjectConfig;
    return {
        groupForVariantA: ID_GROUP_FOR_PAIRED_ID,
        groupForVariantB: ID_GROUP_FOR_UNPAIRED_ID,
    };
}

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
        const { groupForVariantA, groupForVariantB } = getABGroups();
        const mapGroupByVariant = {
            [variantA]: groupForVariantA,
            [variantB]: groupForVariantB,
        };
        return ABTestController.variantByStag ? mapGroupByVariant[ABTestController.variantByStag] : groupForVariantA;
    }

    static get groupById(): ABGroupsType {
        const { groupForVariantA, groupForVariantB } = getABGroups();
        const mapGroupByVariant = {
            [variantA]: groupForVariantA,
            [variantB]: groupForVariantB,
        };
        return mapGroupByVariant[ABTestController.variantByUserId];
    }

    static get variantByUserGroup(): ABResultType | null {
        const { groupForVariantA, groupForVariantB } = getABGroups();
        const mapVariantToGroup: { [index: number]: number } = {
            [groupForVariantA]: variantA,
            [groupForVariantB]: variantB,
        };
        const userStatuses = useUserStatuses();
        const userIncludeInABTest = [ groupForVariantA, groupForVariantB ].find((abID) => {
            return userStatuses.getUserGroups.includes(abID);
        });
        return userIncludeInABTest ? mapVariantToGroup[userIncludeInABTest] : null;
    }

    static get variant(): ABResultType | null {
        const { $defaultProjectConfig } = useConfigStore();
        if ($defaultProjectConfig.featureFlags.enableABReg) {
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
