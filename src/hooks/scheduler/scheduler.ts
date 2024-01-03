import React from "react";

import type { TSchedulerEvent, TSchedulerEventWithExtras, TSchedulerHeader } from "../../data/store/types";
import { useSchedulerInternalState } from "./internal-state";
import { ReplaceWith } from "../../utils/type";
import dayjs from "dayjs";

/** Binds with scheduler component */
export function useScheduler(name = "scheduler") {
    const {
        clear,
        init: initState,
        initialized,
        setEvents: setStateEvents,
        setHeaders,
        setIsLoading,
    } = useSchedulerInternalState(name);

    /** Initialized scheduler state. Throws error if already initialized */
    const init = React.useCallback(
        (params?: { events?: TSchedulerEvent[]; headers?: TSchedulerHeader[] }) => {
            if (!initialized) {
                const headers = params?.headers || [];
                const events: TSchedulerEventWithExtras[] = (params?.events || []).map((it) => {
                    return {
                        ...it,
                        start: dayjs(it.start),
                        end: dayjs(it.end),
                        _extras: {},
                    };
                });

                initState({ headers, events });
            }
        },
        [name, initialized, initState],
    );

    /** Set events */
    const setEvents = React.useCallback(
        (events: TSchedulerEvent[]) => {
            const eventsWithExtras: TSchedulerEventWithExtras[] = (events || []).map((it) => {
                return {
                    ...it,
                    start: dayjs(it.start),
                    end: dayjs(it.end),
                    _extras: {},
                };
            });

            setStateEvents(eventsWithExtras);
        },
        [setStateEvents],
    );

    return { initialized, init, setHeaders, setEvents, setIsLoading, clear };
}
