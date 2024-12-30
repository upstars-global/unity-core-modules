export function isElementInViewport(element) {
    if (!element || element?.style?.display === "none") {
        return false;
    }

    const rect = element.getBoundingClientRect();
    const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
    const windowWidth = (window.innerWidth || document.documentElement.clientWidth);

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= windowHeight &&
        rect.right <= windowWidth
    );
}

export function isElementInViewportHorizontally(element) {
    if (!element || element?.style?.display === "none") {
        return false;
    }

    const rect = element.getBoundingClientRect();
    const windowWidth = (window.innerWidth || document.documentElement.clientWidth);

    return (
        rect.left >= 0 &&
        rect.right <= windowWidth
    );
}
