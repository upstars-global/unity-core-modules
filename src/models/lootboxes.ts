import type { ILootboxItemConfig } from "../services/api/DTO/lootboxes";
import { Mode } from "./enums/lootboxes";

export interface ILootboxLevel {
    amount_cents: number;
    available_amount_cents: number;
    current_award_value: null;
    id: number;
    identifier: string;
    index: number;
    name: string;
    periods: [];
    state: string;
    total_amount_cents: number;
    working_days: [];
}

export const promocodes: Record<Mode, string> = {
    [Mode.Lite]: "LITE",
    [Mode.Pro]: "PRO",
    [Mode.Max]: "MAX",
};

export interface ModeLootbox {
    id: number;
    type: Mode;
    available: boolean;
    used: boolean;
    validUntil: string;
    label: string;
    createdAt: string;
    prize: ILootboxItemConfig;
    items: [];
}

export type LootboxMap = Record<Mode, ModeLootbox>;

type RocketItemSkin = {
    [key in Mode]: {
        rocket: string;
        light: string;
        lightSpin: string;
        porthole: string;
    };
}

type SkinImage = {
    default: string;
    retina: string;
}

export type RocketLootboxSkin = RocketItemSkin & {
    slot: SkinImage
    prizes: {
        [key in `prize${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`]: SkinImage
    };
}

export default {};
