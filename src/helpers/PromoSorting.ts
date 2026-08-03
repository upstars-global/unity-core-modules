// @ts-expect-error -- TS7006: Parameter 'first' implicitly has an 'any' type.; TS7006: Parameter 'second' implicitly has an 'any' type.
function sortByOrder(first, second) {
    if (first.sortOrder < second.sortOrder) {
        return 1;
    }
    if (first.sortOrder > second.sortOrder) {
        return -1;
    }
    return 0;
}

// @ts-expect-error -- TS7006: Parameter 'first' implicitly has an 'any' type.; TS7006: Parameter 'second' implicitly has an 'any' type.
function sortByDate(first, second) {
    if (Date.parse(first.end_at) > Date.parse(second.end_at)) {
        return 1;
    }
    if (Date.parse(first.end_at) < Date.parse(second.end_at)) {
        return -1;
    }
    return 0;
}
// @ts-expect-error -- TS7006: Parameter 'arr' implicitly has an 'any' type.; TS7006: Parameter 'status' implicitly has an 'any' type.
export function filterByStatus(arr, status) {
    return arr
        // @ts-expect-error -- TS7006: Parameter 'item' implicitly has an 'any' type.
        .filter((item) => {
            return item.status === status;
        })
        .sort(sortByDate)
        .sort(sortByOrder);
}
