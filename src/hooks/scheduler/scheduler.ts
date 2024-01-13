import React from "react";

import type { SchedulerEvent, SchedulerEventWithExtras, SchedulerHeader } from "../../data/store/types";
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
        (params?: { events?: SchedulerEvent[]; headers?: SchedulerHeader[] }) => {
            if (!initialized) {
                const headers = params?.headers || [];
                const events: SchedulerEventWithExtras[] = (params?.events || []).map((it) => {
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
        (events: SchedulerEvent[]) => {
            const eventsWithExtras: SchedulerEventWithExtras[] = (events || []).map((it) => {
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
