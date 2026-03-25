/* eslint-disable n/no-unsupported-features/node-builtins */
function storageObjGenerate(name) {
    return {
        set(value) {
            sessionStorage.setItem(name, value);
        },
        get() {
            return sessionStorage.getItem(name);
        },
        remove() {
            sessionStorage.removeItem(name);
        },
    };
}

const depositPromocodeStorage = storageObjGenerate("depositPromocode");
const depositPromocodeShowedStorage = storageObjGenerate("depositPromocodeShowed");
const depositMinValueStorage = storageObjGenerate("depositMinValue");
const giftPromocodeStorage = storageObjGenerate("giftPromocode");

function clearAllDepositePromocodeStorage() {
    depositPromocodeStorage.remove();
    depositPromocodeShowedStorage.remove();
    depositMinValueStorage.remove();
}

export {
    clearAllDepositePromocodeStorage,
    depositMinValueStorage,
    depositPromocodeShowedStorage,
    depositPromocodeStorage,
    giftPromocodeStorage,
};
