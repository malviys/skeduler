import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type {
    TReturnStateFunction,
    SchedulerEvent,
    SchedulerEventWithExtras,
    SchedulerGrid,
    SchedulerHeader,
    SchedulerHeaderWithExtras,
    SchedulerView,
} from "./types";
import { dayView, monthView, weekView } from "./utils";

const hours = Array.from({ length: 24 }).flatMap((_, index) => [
    new Date().setHours(index, 0, 0, 0),
    new Date().setHours(index, 15, 0, 0),
    new Date().setHours(index, 30, 0, 0),
    new Date().setHours(index, 45, 0, 0),
]);

export function initialize(
    name: string,
    data: { events: SchedulerEventWithExtras[]; headers: SchedulerHeaderWithExtras[] },
): TReturnStateFunction {
    return (state) => {
        const headers = parseHeaders(data.headers);
        const grid = buildGrid(headers.at(-1) || []);
        const events = data.events;

        return {
            ...state,
            [name]: {
                initialized: true,
                headers,
                grid,
                events,
            },
        };
    };
}

export function setEvents(name: string, events: SchedulerEventWithExtras[]): TReturnStateFunction {
    return (state) => {
        return {
            ...state,
            [name]: {
                ...state[name],
                events,
            },
        };
    };
}

export function setView(name: string, view: SchedulerView): TReturnStateFunction {
    return (state) => {
        const headers = parseHeaders({ day: dayView, week: weekView, month: monthView }[view]());
        const grid = buildGrid(headers.at(-1) || []);

        return {
            ...state,
            [name]: {
                ...state[name],
                view,
                headers,
                grid,
            },
        };
    };
}

export function setHeaders(name: string, headers: SchedulerHeaderWithExtras[]): TReturnStateFunction {
    return (state) => {
        const parsedHeaders = parseHeaders(headers);
        const grid = buildGrid(parsedHeaders.at(-1) || []);

        return {
            ...state,
            [name]: {
                ...state[name],
                headers: parsedHeaders,
                grid,
            },
        };
    };
}

export function clear(name: string): TReturnStateFunction {
    return (state) => {
        delete state[name];

        return { ...state };
    };
}

export function setMounted(name: string): TReturnStateFunction {
    return (state) => {
        return {
            ...state,
            [name]: {
                ...state[name],
                mounted: true,
            },
        };
    };
}

export function setGrid(
    name: string,
    grid: ((grid: SchedulerGrid) => SchedulerGrid) | SchedulerGrid,
): TReturnStateFunction {
    return (state) => {
        const pGrid = state[name].grid || {};
        const nGrid = typeof grid === "function" ? grid(pGrid || {}) : grid;

        return {
            ...state,
            [name]: {
                ...state[name],
                grid: {
                    ...pGrid,
                    ...nGrid,
                },
            },
        };
    };
}

export function setHours(name: string, start: Dayjs, end: Dayjs, duration?: number): TReturnStateFunction {
    const rowLabels = Array.from({ length: end.diff(start, "hour") }, (_, index) => {
        return dayjs().set("hours", index).set("minutes", 0).set("seconds", 0).toString();
    });

    return (state) => {
        return {
            ...state,
            [name]: {
                ...state[name],
                rowLabels,
            },
        };
    };
}

export function setIsLoading(name: string, isLoading: boolean): TReturnStateFunction {
    return (state) => {
        return {
            ...state,
            [name]: {
                ...state[name],
                isLoading,
            },
        };
    };
}

export function setDraggingEvent(name: string, event?: SchedulerEventWithExtras | null): TReturnStateFunction {
    return (state) => {
        return {
            ...state,
            [name]: {
                ...state[name],
                draggingEvent: event,
            },
        };
    };
}

export function setDroppedEvent(name: string, event?: SchedulerEventWithExtras | null): TReturnStateFunction {
    return (state) => {
        return {
            ...state,
            [name]: {
                ...state[name],
                droppedEvent: event,
            },
        };
    };
}

function parseHeaders(headers: SchedulerHeaderWithExtras[]): SchedulerHeaderWithExtras[][] {
    const parsedHeaders: SchedulerHeaderWithExtras[][] = [];

    function traverseHeader(header: SchedulerHeaderWithExtras, level = 0) {
        if (parsedHeaders.length !== level + 1) {
            parsedHeaders.push([]);
        }

        parsedHeaders.at(level)?.push(header);

        for (const child of header.children) {
            child.parent = header;
            header.span += traverseHeader(
                {
                    ...child,
                    _extras: {
                        date: dayjs().startOf("day"),
                    },
                },
                level + 1,
            );
        }

        return header.span;
    }

    for (const header of headers) {
        traverseHeader(header);
    }

    return parsedHeaders;
}

function buildGrid(headers: SchedulerHeader[]): SchedulerGrid {
    const grid: SchedulerGrid = {};

    for (const header of headers) {
        let currentHeader = header;
        let key = currentHeader.id;

        while (currentHeader.parent) {
            currentHeader = currentHeader.parent;
            key = `${key}-${currentHeader.id}`;
        }

        grid[key] = hours.map((hour) => {
            return {
                id: `hour_[${Intl.DateTimeFormat([], { hour12: false, timeStyle: "short" }).format(hour)}]`,
                events: [],
                start: dayjs(hour),
                end: dayjs(hour).add(15, "minute"),
            };
        });
    }

    return grid;
}
