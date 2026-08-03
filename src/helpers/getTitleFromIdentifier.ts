export const getTitleFromIdentifier = (string: string) => {
    return string.split("-").map((item) => {
        return item[0].toUpperCase() + item.slice(1);
    }).join(" ");
};
