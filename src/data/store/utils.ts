import dayjs from "dayjs";
import { TSchedulerEvent, TSchedulerEventWithExtras, TSchedulerHeader, TSchedulerHeaderWithExtras } from "./types";

export function dayView(): TSchedulerHeaderWithExtras[] {
    const headers: TSchedulerHeaderWithExtras[] = [];
    const day = dayjs();

    headers.push({
        id: day.day().toString(),
        title: day.format("ddd"),
        children: [],
        span: 1,
        _extras: {
            date: day.toDate(),
        },
    });

    return headers;
}

export function weekView(): TSchedulerHeaderWithExtras[] {
    const headers: TSchedulerHeaderWithExtras[] = [];
    const day = dayjs().startOf("week");

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dayAtIndex = day.add(dayIndex, "day");

        headers.push({
            id: dayIndex.toString(),
            title: dayAtIndex.format("dddd"),
            span: 1,
            children: [],
            _extras: {
                date: dayAtIndex.toDate(),
            },
        });
    }

    return headers;
}

export function monthView(): TSchedulerHeaderWithExtras[] {
    const headers: TSchedulerHeaderWithExtras[] = [];
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
                date: dayAtIndex.toDate(),
            },
        });
    }

    return headers;
}

export function eventToEventWithExtras(
    event: TSchedulerEvent,
    extras: TSchedulerEventWithExtras["_extras"] | null,
): TSchedulerEventWithExtras {
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
        _extras: {
            dragging,
            coordinates,
            visibility,
            collisions,
        },
    };
}

export function eventWithExtrasToEvent(event: TSchedulerEventWithExtras): TSchedulerEvent {
    const { _extras, ...restEvent } = event;

    return restEvent;
}

// export function parseHeaders(headers: THeader[]): THeader[][] {
// 	const parsedHeaders: THeader[][] = [];

// 	function traverseHeader(header: THeader, level = 0) {
// 		if (parsedHeaders.length !== level + 1) {
// 			parsedHeaders.push([]);
// 		}

// 		parsedHeaders.at(level)?.push(header);

// 		for (const child of header.children) {
// 			child.parent = header;
// 			header.span += traverseHeader(child, level + 1);
// 		}

// 		return header.span;
// 	}

// 	for (const header of headers) {
// 		traverseHeader(header);
// 	}

// 	return parsedHeaders;
// }
