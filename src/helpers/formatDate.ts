import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isToday from "dayjs/plugin/isToday";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import relativeTime from "dayjs/plugin/relativeTime";
import utcPlugin from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";

import { STATUS_PROMO } from "../models/enums/tournaments";

dayjs.extend(utcPlugin);
dayjs.extend(weekday);
dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(quarterOfYear);
dayjs.extend(isToday);

// @ts-expect-error -- TS7006: Parameter 'date' implicitly has an 'any' type.
export function formatDate(date, format = "YYYY/MM/DD HH:mm") {
    return dayjs(date).format(format);
}

// @ts-expect-error -- TS7006: Parameter 'date' implicitly has an 'any' type.
export function formatDateL(date, format = "YYYY-MM-DD, HH:mm:ss") {
    return dayjs(date).format(format);
}

// @ts-expect-error -- TS7006: Parameter 'date' implicitly has an 'any' type.
export function formatDateUS(date, format = "YYYY/MM/DD hh:mm A") {
    return dayjs(date).format(format);
}

// @ts-expect-error -- TS7006: Parameter 'date' implicitly has an 'any' type.
export function dayMonthYear(date, format = "YYYY/MM/DD") {
    return dayjs(date).format(format);
}

// @ts-expect-error -- TS7006: Parameter 'date' implicitly has an 'any' type.; TS7006: Parameter 't' implicitly has an 'any' type.
export function timeUTC(date, t) {
    const dateOfWeek = t(`CALENDAR.WEEK_DAYS.${[ dayjs(date).utc().day() ]}`);
    return `${dateOfWeek}, ${dayjs(date).utc().format("MMM, D, HH:mm")}`;
}

// @ts-expect-error -- TS7006: Parameter 'date' implicitly has an 'any' type.
export function timeFromNow(date) {
    return dayjs(date).fromNow();
}

// @ts-expect-error -- TS7006: Parameter 'startAt' implicitly has an 'any' type.; TS7006: Parameter 'endAt' implicitly has an 'any' type.
export function getEventStatus(startAt, endAt) {
    const formattedStart = dayjs(startAt, "DD/MM/YYYY");
    const formattedEnd = dayjs(endAt, "DD/MM/YYYY");

    if (!formattedStart.isValid() || !formattedEnd.isValid()) {
        return STATUS_PROMO.FUTURE;
    }

    const now = dayjs();

    if (now.isAfter(formattedEnd)) {
        return STATUS_PROMO.ARCHIVE;
    }
    if (now.isBefore(formattedStart)) {
        return STATUS_PROMO.FUTURE;
    }
    return STATUS_PROMO.ACTIVE;
}
