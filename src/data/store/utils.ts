import dayjs from "dayjs";
import { SchedulerEvent, SchedulerEventWithExtras, SchedulerHeader, SchedulerHeaderWithExtras } from "./types";

export function dayView(): SchedulerHeaderWithExtras[] {
    const headers: SchedulerHeaderWithExtras[] = [];
    const day = dayjs();

    headers.push({
        id: day.day().toString(),
        title: day.format("ddd"),
        children: [],
        span: 1,
        _extras: {
            date: day,
        },
    });

    return headers;
}

export function weekView(): SchedulerHeaderWithExtras[] {
    const headers: SchedulerHeaderWithExtras[] = [];
    const day = dayjs().startOf("week");

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dayAtIndex = day.add(dayIndex, "day");

        headers.push({
            id: dayIndex.toString(),
            title: dayAtIndex.format("dddd"),
            span: 1,
            children: [],
            _extras: {
                date: dayAtIndex,
            },
        });
    }

    return headers;
}

export function monthView(): SchedulerHeaderWithExtras[] {
    const headers: SchedulerHeaderWithExtras[] = [];
    const day = dayjs().startOf("month");
    const daysInMonth = day.daysInMonth();

    for (let dayIndex = 0; dayIndex < daysInMonth; dayIndex++) {
        const dayAtIndex = day.add(dayIndex, "day");

        headers.push({
            id: dayIndex.toString(),
            title: dayAtIndex.format("D"),
            span: 1,
            children: [],
            _extras: {
                date: dayAtIndex,
            },
        });
    }

    return headers;
}

export function eventToEventWithExtras(
    event: SchedulerEvent,
    extras: SchedulerEventWithExtras["_extras"] | null,
): SchedulerEventWithExtras {
    const {
        visibility = "visible",
        coordinates = {
            x: extras?.coordinates?.x || 0,
            y: extras?.coordinates?.y || 0,
        },
        dragging = false,
        collisions = new Set<string>(),
    } = extras || {};

    return {
        ...event,
        end: dayjs(event.end),
        start: dayjs(event.start),
        _extras: {
            dragging,
            coordinates,
            visibility,
            collisions,
        },
    };
}

export function eventWithExtrasToEvent(event: SchedulerEventWithExtras): SchedulerEvent {
    const { _extras, end, start, ...restEvent } = event;

    return { ...restEvent, start: start.toDate(), end: end.toDate() };
}
