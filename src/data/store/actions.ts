import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type {
    TReturnStateFunction,
    TSchedulerEventWithExtras,
    TSchedulerGrid,
    TSchedulerHeader,
    TSchedulerHeaderWithExtras,
    TSchedulerView,
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
    data: { events: TSchedulerEventWithExtras[]; headers: TSchedulerHeaderWithExtras[] },
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

export function setEvents(name: string, events: TSchedulerEventWithExtras[]): TReturnStateFunction {
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

export function setView(name: string, view: TSchedulerView): TReturnStateFunction {
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

export function setHeaders(name: string, headers: TSchedulerHeaderWithExtras[]): TReturnStateFunction {
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
    grid: ((grid: TSchedulerGrid) => TSchedulerGrid) | TSchedulerGrid,
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

export function setHours(name: string, start: Dayjs, end: Dayjs): TReturnStateFunction {
    const hours = Array.from({ length: end.diff(start, "hour") }, (_, index) => {
        return dayjs().set("hours", index).set("minutes", 0).set("seconds", 0);
    });

    return (state) => {
        return {
            ...state,
            [name]: {
                ...state[name],
                hours,
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

function parseHeaders(headers: TSchedulerHeaderWithExtras[]): TSchedulerHeaderWithExtras[][] {
    const parsedHeaders: TSchedulerHeaderWithExtras[][] = [];

    function traverseHeader(header: TSchedulerHeaderWithExtras, level = 0) {
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
                        date: dayjs().startOf("day").toDate(),
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

function buildGrid(headers: TSchedulerHeader[]): TSchedulerGrid {
    const grid: TSchedulerGrid = {};

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
            };
        });
    }

    return grid;
}
