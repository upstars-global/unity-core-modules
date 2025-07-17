const regex = /\d+/g;

const keypressHandler = (el): void => {
    const char = String.fromCharCode(el.keyCode);

    if (regex.test(char)) {
        el.preventDefault();
    }
};

const updateValue = (el): void => {
    const currentElement = el.value !== undefined ? el : el.querySelector("input, textarea");
    currentElement.value = currentElement.value.replace(regex, "");
};

export const filterExcludeNumbers = {
    beforeMount(el) {
        el.addEventListener("keypress", keypressHandler);
    },
    updated(el) {
        updateValue(el);
    },
    beforeUnmount(el) {
        el.removeEventListener("keypress", keypressHandler);
    },
};
