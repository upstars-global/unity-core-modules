const keypressHandler = (el): void => {
    const char = String.fromCharCode(el.keyCode);

    if ((/\d+/g).test(char)) {
        el.preventDefault();
    }
};

export const filterNumbers = {
    beforeMount(el) {
        el.addEventListener("keypress", keypressHandler);
    },
    beforeUnmount(el) {
        el.removeEventListener("keypress", keypressHandler);
    },
};
