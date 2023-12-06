import dayjs from "dayjs";
import type { TEventWithExtras, TGrid, THeader, TReturnStateFunction, TView } from "./type";
import { dayView, monthView, weekView } from "./utils";

const hours = Array.from({ length: 24 }).flatMap((_, index) => [
    new Date().setHours(index, 0, 0, 0),
    new Date().setHours(index, 15, 0, 0),
    new Date().setHours(index, 30, 0, 0),
    new Date().setHours(index, 45, 0, 0),
]);

export function initialize(
    name: string,
    data: { events: TEventWithExtras[]; headers: THeader[] },
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

export function setEvents(name: string, events: TEventWithExtras[]): TReturnStateFunction {
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

export function setView(name: string, view: TView): TReturnStateFunction {
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

export function setHeaders(name: string, headers: THeader[]): TReturnStateFunction {
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

export function setDuration(name: string, start: Date, end: Date) {}

export function setGrid(name: string, grid: TGrid): TReturnStateFunction {
    return (state) => {
        return {
            ...state,
            [name]: {
                ...state[name],
                grid,
            },
        };
    };
}

function parseHeaders(headers: THeader[]): THeader[][] {
    const parsedHeaders: THeader[][] = [];

    function traverseHeader(header: THeader, level = 0) {
        if (parsedHeaders.length !== level + 1) {
            parsedHeaders.push([]);
        }

        parsedHeaders.at(level)?.push(header);

        for (const child of header.children) {
            child.parent = header;
            header.span += traverseHeader(child, level + 1);
        }

        return header.span;
    }

    for (const header of headers) {
        traverseHeader(header);
    }

    return parsedHeaders;
}

function buildGrid(headers: THeader[]): TGrid {
    const grid: TGrid = {};

    for (const header of headers) {
        let currentHeader = header;
        let key = currentHeader.id;

        while (currentHeader.parent) {
            currentHeader = currentHeader.parent;
            key = `${key}-${currentHeader.id}`;
        }

        grid[key] = {
            events: [],
            height: 0,
            id: key,
            width: 0,
            x: 0,
            y: 0,
        };
    }

    return grid;
}
