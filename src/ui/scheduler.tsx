import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import React from "react";
// import { css } from "@emotion/css";

import Cell from "./components/cell/cell";
import Event from "./components/event/event";
import TimeIndicator from "./components/time-indicator/time-indicator";

import { setMounted, setView } from "../data/store/action";
import { useDispatch } from "../data/store/store";
import type { TEvent, TEventWithExtras, THeader, TView } from "../data/store/type";

import { useSchedulerInternalState } from "../hooks/data";
import classes from "./scheduler.module.scss";

export type TSchedulerConfig = {
    cell: {
        width?: number;
        height?: number;
    };
};

const defaultSchedulerConfig: TSchedulerConfig = {
    cell: {
        height: 50,
        width: 100,
    },
};

export type TSchedulerProps<T> = {
    /** Name of scheduler to bind with */
    name: string;

    /**  */
    view: TView;

    /** */
    start?: Date;

    /** */
    end?: Date;

    config?: TSchedulerConfig;

    /** Render event in scheduler */
    renderEvent?: (event: TEvent, options: { dragHandler: SyntheticListenerMap }) => JSX.Element;

    /** Renders header */
    renderHeader?: (header: THeader) => JSX.Element;

    /** Called when events is getting dragged */
    onDrag?: (event: T) => void;

    /** Called when event is dropped successfully to cells */
    onDrop?: (event: T) => void;
};

function Scheduler<T extends TEvent>(props: TSchedulerProps<T>) {
    const { name, view, start, end, renderEvent, renderHeader, onDrag, onDrop } = props;

    const { initialized, mounted, headers, events, setEvents } = useSchedulerInternalState(name);
    const dispatch = useDispatch();

    const headerColumnRowsRef = React.useRef<HTMLDivElement | null>(null);
    const bodyColumnRowsRef = React.useRef<HTMLDivElement | null>(null);
    const bodyTimeColumnRef = React.useRef<HTMLDivElement | null>(null);

    const [elevateHeader, setElevateHeader] = React.useState(false);
    const [elevateTimeColumn, setElevateTimeColumn] = React.useState(false);

    React.useEffect(() => {
        if (initialized) {
            dispatch(setMounted(name));
            /* const actions = [setMounted(name)]; */

            // if (!headers.length) {
            if ((["day", "week", "month"] as TView[]).includes(view)) {
                dispatch(setView(name, view));
            }
            // }

            // dispatch(...actions);
        }
    }, [initialized /* headers */]);

    React.useEffect(() => {
        function schedulerBodyScrollListener(event: Event) {
            if (headerColumnRowsRef.current) {
                headerColumnRowsRef.current.scrollLeft = bodyColumnRowsRef.current?.scrollLeft || 0;
            }

            if (bodyTimeColumnRef.current) {
                bodyTimeColumnRef.current.scrollTop = bodyColumnRowsRef.current?.scrollTop || 0;
            }

            setElevateHeader(!!bodyColumnRowsRef.current?.scrollTop);
            setElevateTimeColumn(!!bodyColumnRowsRef.current?.scrollLeft);
        }

        if (initialized) {
            bodyColumnRowsRef.current?.addEventListener("scroll", schedulerBodyScrollListener);
        }

        return () => bodyColumnRowsRef.current?.removeEventListener("scroll", schedulerBodyScrollListener);
    }, [initialized]);

    const handleOnDragEnd = React.useCallback(
        (ev: DragEndEvent) => {
            const { active, delta } = ev;

            if (active.data.current?.event?.id) {
                const event = active.data.current.event as TEventWithExtras;
                const newEvents = events.filter((itrEvent) => itrEvent.id !== event.id);

                const coordinates = {
                    x: Math.floor((event.extras.coordinates.x + delta.x) / 163) * 164,
                    y: Math.floor((event.extras.coordinates.y + delta.y) / 50) * 51,
                };

                newEvents.push({
                    ...event,
                    extras: {
                        ...event.extras,
                        coordinates,
                    },
                });

                setEvents(newEvents);
            }
        },
        [events],
    );

    // Scheduler header rows
    const headerRows = React.useMemo(() => {
        console.log("rendering header rows");

        return (
            <div id="scheduler_header_rows" ref={headerColumnRowsRef} className={classes.header_columns_row}>
                {headers.map((columns, rowIndex) => {
                    const id = `scheduler_header_row_[${rowIndex}]`;
                    const key = id;

                    return (
                        <div key={key} id={id} className={classes.header_columns}>
                            {columns.map((cell, columnIndex) => {
                                const id = `scheduler_header_row_[${rowIndex}]_column_[${columnIndex}]_cell_[${cell.id}]`;
                                const key = id;

                                return (
                                    <div
                                        key={key}
                                        id={id}
                                        className={classes.header_cell}
                                        style={{ minWidth: cell.span * 100 }}
                                    >
                                        {cell.title}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        );
    }, [headers]);

    // Scheduler body time column row cells
    const bodyTimeColumnCells = React.useMemo(() => {
        console.log("rendering body time columns");

        return (
            <>
                {Array.from({ length: 24 }).map((_, index) => {
                    const id = `scheduler_body_time_column_cell_[${index}]`;
                    const key = id;

                    return (
                        <div key={key} id={id} className={classes.time_column_cell}>
                            <span>12:00 AM</span>
                        </div>
                    );
                })}
            </>
        );
    }, []);

    // Scheduler body time column
    const bodyTimeColumn = React.useMemo(() => {
        console.log("rendering body time column");

        return (
            <div
                id="scheduler_body_time_column"
                ref={bodyTimeColumnRef}
                className={classes.time_column}
                style={{
                    boxShadow: elevateTimeColumn ? "0px 3px 8px 5px #5e5e5e" : "",
                    overflowX: "scroll",
                }}
            >
                <TimeIndicator name={name} showLine={false} />
                {bodyTimeColumnCells}
            </div>
        );
    }, [elevateTimeColumn, bodyTimeColumnCells]);

    // Scheduler body rows
    const bodyRows = React.useMemo(() => {
        console.log("rendering body rows");

        return (
            <div id="scheduler_body_rows" className={classes.body_rows}>
                {<TimeIndicator name={name} showTimer={false} />}
                {Array.from({ length: 24 }).map((_, rowIndex) => {
                    const rowId = `scheduler_body_row_[${rowIndex}]`;

                    return (
                        <div id={rowId} key={rowId} className={classes.body_row_columns}>
                            {headers.at(-1)?.map((cell, columnIndex) => {
                                const id = `scheduler_body_row_[${rowIndex}]_column_[${columnIndex}]_cell_[${cell.id}]`;
                                const key = id;

                                return <Cell key={key} id={id} />;
                            })}
                        </div>
                    );
                })}
            </div>
        );
    }, [headers]);

    const renderingEvents = React.useMemo(() => {
        console.log("rendering events");

        if (!mounted) {
            return <></>;
        }

        return (
            <>
                {events.map((event) => (
                    <Event key={`scheduler_event_[${event.id}]`} event={event} renderEvent={renderEvent} />
                ))}
            </>
        );
    }, [events, mounted, renderEvent]);

    return (
        <DndContext onDragEnd={handleOnDragEnd}>
            <div className={classes.scheduler}>
                <div
                    id="scheduler_header"
                    className={classes.header}
                    style={{
                        boxShadow: elevateHeader ? "3px 0px 8px 5px #5e5e5e" : "",
                    }}
                >
                    <div
                        id="scheduler_header_time_column"
                        className={classes.time_column}
                        style={{
                            boxShadow: elevateTimeColumn ? "0px 3px 8px 5px #5e5e5e" : "",
                        }}
                    />
                    {headerRows}
                </div>
                <div id="scheduler_body" className={classes.body}>
                    {bodyTimeColumn}
                    <div
                        ref={bodyColumnRowsRef}
                        id="scheduler_body_rows_wrapper"
                        className={classes.body_rows_events_wrapper}
                    >
                        {/* <TimeIndicator name={name} showTimer={false} /> */}
                        {bodyRows}
                        {renderingEvents}
                    </div>
                </div>
            </div>
        </DndContext>
    );
}

export default Scheduler;
