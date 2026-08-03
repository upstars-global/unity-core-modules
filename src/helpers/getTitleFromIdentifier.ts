// @ts-expect-error -- TS7006: Parameter 'string' implicitly has an 'any' type.
export const getTitleFromIdentifier = (string) => {
    // @ts-expect-error -- TS7006: Parameter 'item' implicitly has an 'any' type.
    return string.split("-").map((item) => {
        return item[0].toUpperCase() + item.slice(1);
    }).join(" ");
};
