import React from "react";

import type { TEvent, TEventWithExtras, THeader } from "../data/store/type";
import { useSchedulerInternalState } from "./data";

/** Binds with scheduler component */
export function useScheduler(name = "scheduler") {
    const {
        clear,
        init: initState,
        initialized,
        setEvents: setStateEvents,
        setHeaders,
    } = useSchedulerInternalState(name);

    /** Initialized scheduler state. Throws error if already initialized */
    const init = React.useCallback(
        (params?: { events?: TEvent[]; headers?: THeader[] }) => {
            if (initialized) {
                throw new Error(
                    `Scheduler: ${name} has been already initialized.\nTo reinitialized first clear the store`,
                );
            }

            const headers = params?.headers || [];
            const events = (params?.events || []).map((itrEvent) => {
                return {
                    ...itrEvent,
                    extras: { coordinates: { x: 0, y: 0 } },
                } as TEventWithExtras;
            });

            initState({ headers, events });
        },
        [name, initState],
    );

    /** Set events */
    const setEvents = React.useCallback(
        (events: TEvent[]) => {
            const eventsWithExtras = (events || []).map((itrEvent) => {
                return {
                    ...itrEvent,
                    extras: { coordinates: { x: 0, y: 0 } },
                } as TEventWithExtras;
            });

            setStateEvents(eventsWithExtras);
        },
        [name, setStateEvents],
    );

    return { initialized, init, setHeaders, setEvents, clear };
}
