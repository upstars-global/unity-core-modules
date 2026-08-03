import dayjs, { type ConfigType } from "dayjs";
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

export function formatDate(date: ConfigType, format = "YYYY/MM/DD HH:mm") {
    return dayjs(date).format(format);
}

export function formatDateL(date: ConfigType, format = "YYYY-MM-DD, HH:mm:ss") {
    return dayjs(date).format(format);
}

export function formatDateUS(date: ConfigType, format = "YYYY/MM/DD hh:mm A") {
    return dayjs(date).format(format);
}

export function dayMonthYear(date: ConfigType, format = "YYYY/MM/DD") {
    return dayjs(date).format(format);
}

export function timeUTC(date: ConfigType, t: (key: string) => string) {
    const dateOfWeek = t(`CALENDAR.WEEK_DAYS.${[ dayjs(date).utc().day() ]}`);
    return `${dateOfWeek}, ${dayjs(date).utc().format("MMM, D, HH:mm")}`;
}

export function timeFromNow(date: ConfigType) {
    return dayjs(date).fromNow();
}

export function getEventStatus(startAt: ConfigType, endAt: ConfigType) {
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
