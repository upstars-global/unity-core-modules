interface PromoItem {
    end_at?: string;
    sortOrder?: number;
    status?: unknown;
}

function sortByOrder(first: PromoItem, second: PromoItem) {
    if (first.sortOrder! < second.sortOrder!) {
        return 1;
    }
    if (first.sortOrder! > second.sortOrder!) {
        return -1;
    }
    return 0;
}

function sortByDate(first: PromoItem, second: PromoItem) {
    if (Date.parse(first.end_at!) > Date.parse(second.end_at!)) {
        return 1;
    }
    if (Date.parse(first.end_at!) < Date.parse(second.end_at!)) {
        return -1;
    }
    return 0;
}
export function filterByStatus<T extends PromoItem>(arr: T[], status: unknown): T[] {
    return arr
        .filter((item) => {
            return item.status === status;
        })
        .sort(sortByDate)
        .sort(sortByOrder);
}
