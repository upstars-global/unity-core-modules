import type { Currencies } from "../../../models/enums/currencies";

enum LootboxUserGroups {
    _635 = 635,
    _1058 = 1058,
}

interface IBonus {
    title: string;
    type: "freespins" | "bonus";
    attributes: IAttribute[];
    result_bonus: IResultBonus[];
}

interface IAttribute {
    field: string;
    value: number | Array<{ currency: Currencies; amount_cents: number }>;
}

interface IResultBonus {
    field: string;
    value: number | Array<{ currency: string; amount_cents: number }>;
}

export interface ILootboxItemConfig {
    weight: number;
    bonuses: IBonus[];
    id: number;
    prize: boolean;
}

export interface ILootbox {
    created_at: string;
    currency: string;
    display: number;
    group_key: string;
    id: number;
    items: ILootboxItemConfig[];
    stage: string;
    strategy: string;
    title: string;
    valid_until: string;
}

export type ILootboxesFileConfig = ILootboxItemConfig[];
