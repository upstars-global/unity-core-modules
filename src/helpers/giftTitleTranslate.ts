import i18n from "@i18n";

import { parseGiftAdventureTitle } from "../store/user/vipAdventures";

export function giftTitleTranslate(key) {
    const { giftTitle } = parseGiftAdventureTitle(key);
    const useKey = giftTitle || key;
    const pathTraTranslate = `GIFT.TITLES.${ key }`;
    return i18n.instance.te(pathTraTranslate, "en") ? i18n.instance.t(pathTraTranslate) : useKey;
}
