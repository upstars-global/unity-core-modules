function sortByOrder(first, second) {
    if (first.sortOrder < second.sortOrder) {
        return 1;
    }
    if (first.sortOrder > second.sortOrder) {
        return -1;
    }
    return 0;
}

function sortByDate(first, second) {
    if (Date.parse(first.end_at) > Date.parse(second.end_at)) {
        return 1;
    }
    if (Date.parse(first.end_at) < Date.parse(second.end_at)) {
        return -1;
    }
    return 0;
}

export function filterByStatus(arr, status) {
    return arr
        .filter((item) => {
            return item.status === status;
        })
        .sort(sortByDate)
        .sort(sortByOrder);
}

export function filterByRegex(arr: Array<{ frontend_identifier: string }>, regex: RegExp) {
    debugger;
    return arr
        .filter((item) => {
            return item.frontend_identifier.match(regex);
        })
        .sort(sortByDate)
        .sort(sortByOrder);
}
