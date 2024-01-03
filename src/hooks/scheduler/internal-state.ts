import dayjs, { Dayjs } from "dayjs";
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

    const {
        initialized = false,
        isLoading = false,
        mounted = false,
        events = [],
        headers = [],
        grid = {},
        draggingEvent,
        droppedEvent,
    } = useSelector((state) => state[name] || {});

    const init = React.useCallback(
        (params?: { events?: TSchedulerEventWithExtras[]; headers?: TSchedulerHeader[] }) => {
            const headers: TSchedulerHeaderWithExtras[] =
                params?.headers?.map((it) => {
                    return {
                        ...it,
                        _extras: {
                            date: dayjs().startOf("date"),
                        },
                    };
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
                        date: dayjs().startOf("day"),
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
        (start: Dayjs, end: Dayjs, duration: 15 | 30 | 60 = 15) => {
            dispatch(actions.setHours(name, start, end, duration));
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

    const setDraggingEvent = React.useCallback(
        (event?: TSchedulerEventWithExtras | null) => {
            dispatch(actions.setDraggingEvent(name, event));
        },
        [name, dispatch],
    );

    const setDroppedEvent = React.useCallback(
        (event?: TSchedulerEventWithExtras | null) => {
            dispatch(actions.setDroppedEvent(name, event));
        },
        [name, dispatch],
    );

    /** Clears scheduer state */
    const clear = React.useCallback(() => {
        dispatch(actions.clear(name));
    }, [name, dispatch]);

    return {
        initialized,
        isLoading,
        mounted,
        events,
        headers,
        grid,
        draggingEvent,
        droppedEvent,
        init,
        setHeaders,
        setEvents,
        setView,
        setMounted,
        setHours,
        setGrid,
        setIsLoading,
        setDraggingEvent,
        setDroppedEvent,
        clear,
    };
}
