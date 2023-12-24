import React from "react";

import type { TSchedulerEvent, TSchedulerEventWithExtras, TSchedulerHeader } from "../data/store/types";
import { useSchedulerInternalState } from "./data";

/** Binds with scheduler component */
export function useScheduler(name = "scheduler") {
    const {
        clear,
        init: initState,
        initialized,
        setEvents: setStateEvents,
        setHeaders,
        setIsLoading
    } = useSchedulerInternalState(name);

    /** Initialized scheduler state. Throws error if already initialized */
    const init = React.useCallback(
        (params?: { events?: TSchedulerEvent[]; headers?: TSchedulerHeader[] }) => {
            if (!initialized) {
                const headers = params?.headers || [];
                const events = (params?.events || []).map((itrEvent) => {
                    return {
                        ...itrEvent,
                    } as TSchedulerEventWithExtras;
                });

                initState({ headers, events });
            }
        },
        [name, initialized, initState],
    );

    /** Set events */
    const setEvents = React.useCallback(
        (events: TSchedulerEvent[]) => {
            const eventsWithExtras: TSchedulerEventWithExtras[] = (events || []).map((itrEvent) => {
                return {
                    ...itrEvent,
                    _extras: {
                        coordinates: null,
                        visibility: "visible",
                        collisions: new Set(),
                        dragging: false,
                    },
                };
            });

            setStateEvents(eventsWithExtras);
        },
        [setStateEvents],
    );

    return { initialized, init, setHeaders, setEvents, setIsLoading, clear };
}
