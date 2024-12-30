/* eslint-disable n/no-unsupported-features/node-builtins */
function promocodeObjGenerate(name) {
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

const depositPromocodeStorage = promocodeObjGenerate("depositPromocode");
const depositPromocodeShowedStorage = promocodeObjGenerate("depositPromocodeShowed");
const giftPromocodeStorage = promocodeObjGenerate("giftPromocode");

function clearAllDepositePromocodeStorage() {
    depositPromocodeStorage.remove();
    depositPromocodeShowedStorage.remove();
}

export {
    clearAllDepositePromocodeStorage,
    depositPromocodeShowedStorage,
    depositPromocodeStorage,
    giftPromocodeStorage,
};
