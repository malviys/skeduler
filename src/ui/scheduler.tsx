import { DndContext, DragEndEvent, DragMoveEvent, DragStartEvent, Modifier, useSensors } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import dayjs from "dayjs";
import React from "react";

import Cell from "./components/cell/cell";
import Event from "./components/event/event";
import TimeIndicator from "./components/time-indicator/time-indicator";

import { setMounted, setView } from "../data/store/action";
import { useDispatch } from "../data/store/store";
import type { TEvent, TEventWithExtras, THeader, TView } from "../data/store/type";

import { useSchedulerInternalState } from "../hooks/data";
import { usePointerSensor } from "../hooks/dndkit";

import { snapToGridModifier } from "../utils/dnd-kit";
import { getCssVariable, parseCssVariable } from "../utils/styles";

import classes from "./scheduler.module.scss";

export type TSchedulerProps<T> = {
    /**
     * @property {string} name --- Name will bind scheduler component to useScheduler(name) hook.
     *
     * Example:
     * ```js
     * import Scheduler, {useScheduler} from "@malviys/skeduler";
     *
     * function ComponentOne(){
     *      const scheduler = useScheduler('scheduler');
     *
     *      return <ComponentTwo/>;
     * }
     *
     * function ComponentTwo(){
     *      const scheduler = useScheduler('scheduler');
     *
     *      return <Scheduler name="scheduler"/>;
     * }
     * ```
     *
     * The scheduler in component one and component two can update the state of <Scheduler/> component.\n
     * Also, single page can have multiple scheduler components with different name and their respective hooks.
     */
    name: string;

    /**
     * @property {TView} view -- A view defines the structure of scheduler.
     *
     * A view can be of day, week or month.
     *
     * @warning - setting headers from <strong>useScheduler()</strong> will override default view.
     */
    view: TView;

    /**
     * Renders custom event in scheduler. It will override default event component.
     */
    renderEvent?: (event: TEvent, options: { dragHandler: SyntheticListenerMap }) => JSX.Element;

    /**
     * Renders custom header cell in scheduler. It will override default header cell component.
     */
    renderHeader?: (header: THeader) => JSX.Element;

    /**
     * Called when events is getting dragged.
     */
    onDrag?: (event: T) => void;

    /**
     * Called when event is dropped successfully.
     */
    onDrop?: (event: T) => void;
};

function Scheduler<T extends TEvent>(props: TSchedulerProps<T>) {
    // props
    const { name, view, renderEvent, renderHeader, onDrag, onDrop } = props;

    // external state
    const { initialized, mounted, headers, events, grid, setEvents } = useSchedulerInternalState(name);
    const dispatch = useDispatch();
    const sensors = useSensors(usePointerSensor());

    // component State
    const headerRowsRef = React.useRef<HTMLDivElement | null>(null);
    const bodyRowsRef = React.useRef<HTMLDivElement | null>(null);
    const bodyTimeColumnRef = React.useRef<HTMLDivElement | null>(null);

    const [elevateHeader, setElevateHeader] = React.useState(false);
    const [elevateTimeColumn, setElevateTimeColumn] = React.useState(false);
    const [modifiers, setModifiers] = React.useState<Modifier[]>([]);

    // mount: set views after store is initialized
    React.useEffect(() => {
        if (initialized) {
            dispatch(setMounted(name));

            if ((["day", "week", "month"] as TView[]).includes(view)) {
                dispatch(setView(name, view));
            }
        }
    }, [initialized]);

    // mount: attach scroll listeners
    React.useEffect(() => {
        function schedulerBodyScrollListener(event: Event) {
            if (headerRowsRef.current) {
                headerRowsRef.current.scrollLeft = bodyRowsRef.current?.scrollLeft || 0;
            }

            if (bodyTimeColumnRef.current) {
                bodyTimeColumnRef.current.scrollTop = bodyRowsRef.current?.scrollTop || 0;
            }

            // add elevation if scheduler is scrolled from its initial position
            setElevateHeader(!!bodyRowsRef.current?.scrollTop);
            setElevateTimeColumn(!!bodyRowsRef.current?.scrollLeft);
        }

        if (mounted) {
            bodyRowsRef.current?.addEventListener("scroll", schedulerBodyScrollListener);
        }

        return () => bodyRowsRef.current?.removeEventListener("scroll", schedulerBodyScrollListener);
    }, [mounted]);

    // mount: add modifiers
    React.useEffect(() => {
        const snapToGrid = snapToGridModifier();

        setModifiers([snapToGrid]);
    }, []);

    // triggers when event is first dragged
    const handleOnDragStart = React.useCallback(
        (ev: DragStartEvent) => {
            const {
                active: { data: { current } },
            } = ev;

            if (current?.event?.id) {
                const event = current.event as TEventWithExtras;

                const newEvents = events.map((itrEvent) => {
                    const mappedEvent = itrEvent;

                    // make events faded while dragging
                    mappedEvent.extras = {
                        ...mappedEvent.extras,
                        visibility: "faded",
                    };

                    return { ...mappedEvent };
                });

                setEvents(newEvents);
            }
        },
        [events, setEvents],
    );

    // triggers when event is in dragging state
    const handleOnDragMove = React.useCallback(
        (ev: DragMoveEvent) => {
            const { active, delta } = ev;

            if (active.data.current?.event?.id) {
                const event = active.data.current.event as TEventWithExtras;
                const newEvents = events.filter((itrEvent) => itrEvent.id !== event.id);

                // calculate event current position/coordinates
                const offsetX = event.extras.coordinates.x + delta.x;
                const offsetY = event.extras.coordinates.y + delta.y;

                const targetColumn = Array.from(headerRowsRef.current?.lastElementChild?.children || []).find(
                    (column) => {
                        const { left, right } = column.getClientRects()[0] || {};

                        if (offsetX >= left && offsetX <= right) {
                            return true;
                        }

                        return false;
                    },
                );

                if (targetColumn) {
                    const coordinates = {
                        x: Math.floor(offsetX / targetColumn.clientWidth) * targetColumn.clientWidth,
                        y: Math.floor(offsetY / 16) * 16,
                    };

                    newEvents.push({
                        ...event,
                        extras: {
                            ...event.extras,
                            coordinates,
                        },
                    });
                }

                // setEvents(newEvents);
            }
        },
        [events, setEvents],
    );

    // triggers when user release event and dragging is stopped
    const handleOnDragEnd = React.useCallback(
        (ev: DragEndEvent) => {
            const { active, delta } = ev;

            if (active.data.current?.event?.id) {
                const event = active.data.current.event as TEventWithExtras;

                // header column elements, headers will provide dropping position x-offset
                const columns = Array.from(headerRowsRef.current?.lastElementChild?.children || []) as HTMLElement[];

                // calculate event dropping position/coordinates
                const offsetX = event.extras.coordinates.x + delta.x;
                const offsetY = event.extras.coordinates.y + delta.y;

                // find dropping column
                const targetColumn = columns.find((column) => {
                    const { offsetWidth, offsetLeft } = column;
                    const { offsetLeft: left } = columns[0];

                    // add first column offset to event x-offset to align it with columns horizontal position
                    if (offsetX + left >= offsetLeft && offsetX + left <= offsetLeft + offsetWidth) {
                        return true;
                    }

                    return false;
                });

                if (targetColumn) {
                    const cellHeight = parseCssVariable(getCssVariable("--scheduler-cell-height"));
                    const cellWidth = targetColumn.clientWidth;

                    // final coordinates after clamping x-offset & y-offset w.r.t target cell
                    const coordinates = {
                        x: Math.floor(offsetX / cellWidth) * (cellWidth + 1),
                        y: Math.floor(offsetY / cellHeight) * (cellHeight + 1),
                    };

                    event.extras = {
                        ...event.extras,
                        coordinates,
                    };
                }

                const newEvents = events.map((itrEvent) => {
                    const mappedEvent = itrEvent.id === event.id ? event : itrEvent;

                    // make all events visible again from faded after event is dropped.
                    mappedEvent.extras = {
                        ...mappedEvent.extras,
                        visibility: "visible",
                    };

                    return { ...mappedEvent };
                });

                setEvents(newEvents);
            }
        },
        [events, headers, grid, setEvents],
    );

    // Scheduler header rows
    const headerRows = React.useMemo(() => {
        return (
            <div id="scheduler_header_rows" ref={headerRowsRef} className={classes.header_columns_row}>
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
                                        // style={{ minWidth: `var(--scheduler-cell-min-width) * 100` }}
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
        return (
            <>
                {/* FIXME: replace inline rows calculation with precalculated rows*/}
                {Array.from({ length: 24 }).map((_, index) => {
                    const id = `scheduler_body_time_column_cell_[${index}]`;
                    const key = id;

                    return (
                        <div key={key} id={id} className={classes.time_column_cell}>
                            <span>{dayjs(new Date().setHours(index, 0)).format("HH:mm")}</span>
                        </div>
                    );
                })}
            </>
        );
    }, []);

    // Scheduler body time column
    const bodyTimeColumn = React.useMemo(() => {
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
    }, [name, elevateTimeColumn, bodyTimeColumnCells]);

    // Scheduler body rows
    const bodyRows = React.useMemo(() => {
        return (
            <div id="scheduler_body_rows" className={classes.body_rows}>
                {/* FIXME: replace inline rows calculation with precalculated rows*/}
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

    // render events
    const renderingEvents = React.useMemo(() => {
        if (!mounted) {
            return <></>;
        }

        // calculate events coordinate
        function processCoordinates(event: TEventWithExtras): TEventWithExtras {
            const {
                extras: { coordinates },
            } = event;

            // FIXME: 1. causing event to place at their initial position after event is dropped at x:0, y:0 position
            if (coordinates.x || coordinates.y) {
                return event;
            }

            const targetCell = grid[event.group.join("-")]?.at(
                event.start.getHours() * 4 + (event.start.getMinutes() % 15),
            );

            // FIXME: 2. causing event to place at their initial position after event is dropped at x:0, y:0 position
            coordinates.x = parseInt(event.group.join("-"), 10) * 163;
            coordinates.y = (event.start.getHours() * 4 + (event.start.getMinutes() % 15)) * 16;

            return event;
        }

        return (
            <>
                {events.map((event) => (
                    <Event
                        key={`scheduler_event_[${event.id}]`}
                        event={processCoordinates(event)}
                        renderEvent={renderEvent}
                    />
                ))}
            </>
        );
    }, [events, mounted, grid, renderEvent]);

    return (
        <DndContext
            modifiers={modifiers}
            sensors={sensors}
            onDragStart={handleOnDragStart}
            // onDragMove={handleOnDragMove}
            onDragEnd={handleOnDragEnd}
            onDragCancel={console.log}
        >
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
                        ref={bodyRowsRef}
                        id="scheduler_body_rows_wrapper"
                        className={classes.body_rows_events_wrapper}
                    >
                        <TimeIndicator name={name} showTimer={false} />
                        {bodyRows}
                        {renderingEvents}
                    </div>
                </div>
            </div>
        </DndContext>
    );
}

export default Scheduler;
