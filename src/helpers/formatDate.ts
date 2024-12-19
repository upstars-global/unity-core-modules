import { STATUS_PROMO } from "@store/tournaments/constants";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import relativeTime from "dayjs/plugin/relativeTime";
import utcPlugin from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";

dayjs.extend(utcPlugin);
dayjs.extend(weekday);
dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);
dayjs.extend(quarterOfYear);

export function formatDate(date, format = "YYYY/MM/DD HH:mm") {
    return dayjs(date).format(format);
}

export function formatDateL(date, format = "YYYY-MM-DD, HH:mm:ss") {
    return dayjs(date).format(format);
}

export function formatDateUS(date, format = "YYYY/MM/DD hh:mm A") {
    return dayjs(date).format(format);
}

export function dayMonthYear(date, format = "YYYY/MM/DD") {
    return dayjs(date).format(format);
}

export function timeUTC(date, t) {
    const dateOfWeek = t(`CALENDAR.WEEK_DAYS.${[ dayjs(date).utc().day() ]}`);
    return `${dateOfWeek}, ${dayjs(date).utc().format("MMM, D, HH:mm")}`;
}

export function timeFromNow(date) {
    return dayjs(date).fromNow();
}

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


export function formatExpiryDateCard(date) {
    if (!date || typeof date !== "string") {
        return date;
    }
    const [ mm, yy ] = date.split("/");
    const year = `20${ yy }`;

    return dayjs()
        .set("year", parseInt(year, 10))
        .set("month", parseInt(mm, 10) - 1)
        .set("date", 1)
        .startOf("day")
        .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
}
