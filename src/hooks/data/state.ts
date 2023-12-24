import dayjs from "dayjs";
import React from "react";

import * as actions from "../../data/store/actions";
import { useDispatch, useSelector } from "../../data/store/store";
import type {
    TSchedulerEventWithExtras,
    TSchedulerGrid,
    TSchedulerHeader,
    TSchedulerHeaderWithExtras,
    TSchedulerView,
} from "../../data/store/types";

export function useSchedulerInternalState(name: string) {
    const dispatch = useDispatch();

    const initialized = useSelector((state) => state[name]?.initialized || false);
    const mounted = useSelector((state) => state[name]?.mounted || false);
    const events = useSelector((state) => state[name]?.events || []);
    const headers = useSelector((state) => state[name]?.headers || []);
    const grid = useSelector((state) => state[name]?.grid || {});

    const init = React.useCallback(
        (params?: { events?: TSchedulerEventWithExtras[]; headers?: TSchedulerHeader[] }) => {
            const headers: TSchedulerHeaderWithExtras[] =
                params?.headers?.map((it) => {
                    return { ...it, _extras: { date: dayjs().startOf("date").toDate() } };
                }) || [];
            const events = params?.events || [];

            dispatch(actions.initialize(name, { events, headers }));
        },
        [name, dispatch],
    );

    /** Set headers */
    const setHeaders = React.useCallback(
        (headers: TSchedulerHeader[]) => {
            const headersWithExtras: TSchedulerHeaderWithExtras[] = headers.map((it) => {
                return {
                    ...it,
                    _extras: {
                        date: dayjs().startOf("day").toDate(),
                    },
                };
            });

            dispatch(actions.setHeaders(name, headersWithExtras));
        },
        [name, dispatch],
    );

    const setEvents = React.useCallback(
        (events: TSchedulerEventWithExtras[]) => {
            dispatch(actions.setEvents(name, events));
        },
        [name, dispatch],
    );

    const setView = React.useCallback(
        (view: TSchedulerView) => {
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
        (grid: ((grid: TSchedulerGrid) => TSchedulerGrid) | TSchedulerGrid) => {
            dispatch(actions.setGrid(name, grid));
        },
        [name, dispatch],
    );

    const setIsLoading = React.useCallback(
        (isLoading: boolean) => {
            dispatch(actions.setIsLoading(name, isLoading));
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
        setIsLoading,
        clear,
    };
}
