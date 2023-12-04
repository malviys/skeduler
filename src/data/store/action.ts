import type { TEvent, TEventWithExtras, TGrid, THeader, TReturnStateFunction, TView } from "./type";
import { dayView, monthView, weekView } from "./utils";

export function initialize(name: string, data: { events: TEventWithExtras[]; headers: THeader[] }): TReturnStateFunction {
  // debugger;
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

// export type TInitialize = typeof initialize;

export function setEvents(name: string, events: TEventWithExtras[]): TReturnStateFunction {
  // debugger;
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

// export type TSetEvents = typeof setEvents;

export function setView(name: string, view: TView): TReturnStateFunction {
  // debugger;
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
  // debugger;
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

// export type TSetHeaders = typeof setHeaders;

export function clear(name: string): TReturnStateFunction {
  // debugger;
  return (state) => {
    delete state[name];

    return { ...state };
  };
}

export function setMounted(name: string): TReturnStateFunction {
  // debugger;
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
