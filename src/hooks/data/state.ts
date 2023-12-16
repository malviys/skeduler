import dayjs from "dayjs";
import React from "react";

import * as actions from "../../data/store/action";
import { useDispatch, useSelector } from "../../data/store/store";
import type { TEventWithExtras, TGrid, THeader, TView } from "../../data/store/type";

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

    const setHours = React.useCallback(
        (start: Date, end: Date) => {
            dispatch(actions.setHours(name, dayjs(start), dayjs(end)));
        },
        [name, dispatch],
    );

    const setGrid = React.useCallback(
        (grid: ((grid: TGrid) => TGrid) | TGrid) => {
            dispatch(actions.setGrid(name, grid));
        },
        [name, dispatch],
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
        setHours,
        setGrid,
        clear,
    };
}
