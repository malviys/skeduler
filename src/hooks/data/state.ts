import React from "react";

import * as actions from "../../data/store/action";
import { useDispatch, useSelector } from "../../data/store/store";
import type { TEventWithExtras, THeader } from "../../data/store/type";

export function useSchedulerInternalState(name: string) {
    const dispatch = useDispatch();

    const initialized = useSelector((state) => state[name]?.initialized || false);
    const mounted = useSelector((state) => state[name]?.mounted || false);
    const events = useSelector((state) => state[name]?.events || []);
    const headers = useSelector((state) => state[name]?.headers || []);

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
        [name],
    );

    const setEvents = React.useCallback(
        (events: TEventWithExtras[]) => {
            dispatch(actions.setEvents(name, events));
        },
        [name, dispatch],
    );

    /** Clears scheduer state */
    const clear = React.useCallback(() => {
        dispatch(actions.clear(name));
    }, [name]);

    return { initialized, mounted, events, headers, init, setHeaders, setEvents, clear };
}
