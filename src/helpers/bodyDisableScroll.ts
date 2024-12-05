export default (visible: boolean) => {
    if (typeof document === "undefined") {
        return;
    }

    const body = document.body;

    if (visible) {
        body.style.top = `-${window.scrollY}px`;
        body.classList.add("block-scroll");
    } else {
        const scrollY = body.style.top;
        body.style.top = "";
        body.classList.remove("block-scroll");
        window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
    }
};
