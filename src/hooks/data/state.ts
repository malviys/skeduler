import React from "react";

import * as actions from "../../data/store/action";
import { useDispatch, useSelector } from "../../data/store/store";
import type { TCell, TEventWithExtras, TGrid, THeader, TView } from "../../data/store/type";

export function useSchedulerInternalState(name: string) {
    const dispatch = useDispatch();

    const initialized = useSelector((state) => state[name]?.initialized || false);
    const mounted = useSelector((state) => state[name]?.mounted || false);
    const events = useSelector((state) => state[name]?.events || []);
    const headers = useSelector((state) => state[name]?.headers || []);
    const grid = useSelector((state) => state[name]?.grid || {});

    const init = React.useCallback(
        (params?: { events?: TEventWithExtras[]; headers?: THeader[] }) => {
            const headers = params?.headers || [];
            const events = params?.events || [];

            dispatch(actions.initialize(name, { events, headers }));
        },
        [name, dispatch],
    );

    /** Set headers */
    const setHeaders = React.useCallback(
        (headers: THeader[]) => {
            dispatch(actions.setHeaders(name, headers));
        },
        [name, dispatch],
    );

    const setEvents = React.useCallback(
        (events: TEventWithExtras[]) => {
            dispatch(actions.setEvents(name, events));
        },
        [name, dispatch],
    );

    const setView = React.useCallback(
        (view: TView) => {
            dispatch(actions.setView(name, view));
        },
        [name, dispatch],
    );

    const setMounted = React.useCallback(() => {
        dispatch(actions.setMounted(name));
    }, [name, dispatch]);

    const updateGridCellByIndex = React.useCallback(
        (index: number, headerId: string | number, data: ((data: TCell) => Partial<TCell>) | Partial<TCell>) => {
            grid[headerId][index] = {
                ...grid[headerId][index],
                ...(typeof data === "function" ? data(grid[headerId][index]) : data),
            };

            dispatch(actions.setGrid(name, { ...grid }));
        },
        [name, grid, dispatch],
    );

    const updateGridCellById = React.useCallback(
        (id: string, headerId: string | number, data: Partial<TCell>) => {
            const cellIndex = grid[headerId].findIndex((cell) => cell.id === id);

            if (cellIndex >= 0) {
                grid[headerId][cellIndex] = {
                    ...grid[headerId][cellIndex],
                    ...data,
                };
            }

            dispatch(actions.setGrid(name, { ...grid }));
        },
        [name, grid, dispatch],
    );

    /** Clears scheduer state */
    const clear = React.useCallback(() => {
        dispatch(actions.clear(name));
    }, [name, dispatch]);

    return {
        initialized,
        mounted,
        events,
        headers,
        grid,
        init,
        setHeaders,
        setEvents,
        setView,
        setMounted,
        updateGridCellByIndex,
        clear,
    };
}
