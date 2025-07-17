const updateValue = (el): void => {
    el.value = el.value.replace(/[0-9]/g, "");
};


let currentElement = {};

export const filterExcludeNumbers = {
    beforeMount(el) {
        currentElement = el.value !== undefined ? el : el.querySelector("input, textarea");
        updateValue(currentElement);
    },
    updated() {
        updateValue(currentElement);
    },
};
