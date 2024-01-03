import type { DragCancelEvent, DragEndEvent, DragMoveEvent, DragStartEvent, Modifier } from "@dnd-kit/core";
import { DndContext, DragOverlay, useSensors } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import dayjs from "dayjs";
import React from "react";

import Cell from "./components/cell/cell";
import Event from "./components/event";
import { DraggableEvent } from "./components/event/event";
import Loader from "./components/loader/loader";
import TimeIndicator from "./components/time-indicator/time-indicator";

import { setHours, setMounted, setView } from "../data/store/actions";
import { useDispatch } from "../data/store/store";
import type { TSchedulerEvent, TSchedulerEventWithExtras, TSchedulerHeader, TSchedulerView } from "../data/store/types";

import { usePointerSensor } from "../hooks/dnd";
import { useSchedulerInternalState } from "../hooks/scheduler";
import { useDomSelector } from "../hooks/system/dom";

import {} from "../utils/dayjs";
import { snapToGridModifier } from "../utils/dnd-kit";
import { reduceFns } from "../utils/helpers";
import { getCssVariable, mergeClasses, parseCssVariable } from "../utils/styles";

import classes from "./scheduler.module.scss";

type TEventsProps = {
    name: string;
    cell: {
        height: number;
        width: number;
    };
    renderEvent?: (event: TSchedulerEventWithExtras, options: { dragHandler: SyntheticListenerMap }) => JSX.Element;
};

const Events = React.memo(function (props: TEventsProps) {
    const { name, cell, renderEvent } = props;
    const { width, height } = cell;

    const { mounted, isLoading, events } = useSchedulerInternalState(name);

    // calculate events coordinate
    const processCoordinates = React.useCallback(
        (event: TSchedulerEventWithExtras): TSchedulerEventWithExtras => {
            const { coordinates } = event._extras;

            if (coordinates) {
                return event;
            }

            const offsetX = parseInt(event.group.join("-"), 10) * (width + 1);
            const offsetY = (event.start.hour() * 4 + Math.floor(event.start.minute() / 15)) * height;

            return { ...event, _extras: { ...event._extras, coordinates: { x: offsetX, y: offsetY } } };
        },
        [width, height],
    );

    // process colliding events, always call after coordinates were processed
    // FIXME: move this process collision to drag end
    const processCollisions = React.useCallback((event: TSchedulerEventWithExtras): TSchedulerEventWithExtras => {
        const { id: eventId, start: eventStart, end: eventEnd, _extras } = event;
        const { coordinates: eventCoords = {}, collisions: eventCollision = new Set() } = _extras;

        const collidingEvents = events.filter((it) => {
            const { id: itId, start: itStart, end: itEnd, _extras: itExtras } = it;
            const { coordinates: itCoords = { x: 0, y: 0 } } = itExtras;

            if (itId === eventId) {
                return false;
            }

            // TODO: implement collision algo based on events coordinates
            const hasSameTime =
                dayjs(eventStart).isBetween(itStart, itEnd, null, "[)") || // [): itStart inclusive and itEnd exclusive
                dayjs(eventEnd).isBetween(itStart, itEnd, null, "(]"); // (]: itStart exclusive and itEnd inclusive

            return hasSameTime;
        });

        // remove old collisions
        eventCollision.clear();

        // add new collisions
        collidingEvents.forEach((it) => eventCollision.add(it.id));

        return { ...event };
    }, []);

    if (!mounted || isLoading) {
        return <></>;
    }

    return (
        <>
            {events.map((event) => (
                <DraggableEvent
                    key={`scheduler_event_[${event.id}]`}
                    event={reduceFns(event, processCoordinates, processCollisions)}
                    renderEvent={renderEvent}
                />
            ))}
        </>
    );
});

type TSchedulerHeaderProps = {
    name: string;
    elevateHeader: boolean;
    elevateTimeColumn: boolean;
};

const SchedulerHeader = React.memo(function (props: TSchedulerHeaderProps): JSX.Element {
    const { name, elevateHeader, elevateTimeColumn } = props;

    const { registerElement } = useDomSelector();
    const { headers } = useSchedulerInternalState(name);

    return (
        <div id="scheduler_header" className={mergeClasses(classes.header, elevateHeader && classes.box_shadow_bottom)}>
            <div
                id="scheduler_header_time_column"
                className={mergeClasses(classes.time_column, elevateTimeColumn && classes.box_shadow_right)}
            />
            <div id="scheduler_header_rows" ref={registerElement} className={classes.header_columns_row}>
                {headers.map((columns, rowIndex) => {
                    const id = `scheduler_header_row_[${rowIndex}]`;
                    const key = id;

                    return (
                        <div key={key} id={id} className={classes.header_columns}>
                            {columns.map((cell, columnIndex) => {
                                const id = `scheduler_header_row_[${rowIndex}]_column_[${columnIndex}]_cell_[${cell.id}]`;
                                const key = id;

                                return (
                                    <div key={key} id={id} className={classes.header_cell}>
                                        {cell.title}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

type TSchedulerBodyProps = {
    name: string;
    elevateTimeColumn: boolean;
    loader?: JSX.Element;
    renderEvent?: (event: TSchedulerEventWithExtras, options: { dragHandler: SyntheticListenerMap }) => JSX.Element;
};

const SchedulerBody = React.memo(function (props: TSchedulerBodyProps): JSX.Element {
    const { name, elevateTimeColumn, loader, renderEvent } = props;

    const { registerElement, getElement } = useDomSelector();
    const { isLoading, headers, draggingEvent } = useSchedulerInternalState(name);

    const headerRows = getElement("scheduler_header_rows");

    return (
        <div id="scheduler_body" className={classes.body}>
            <div
                id="scheduler_body_time_column"
                ref={registerElement}
                className={mergeClasses(
                    classes.time_column,
                    elevateTimeColumn && classes.box_shadow_right,
                    classes.overflow_x_scroll,
                )}
            >
                <TimeIndicator name={name} showLine={false} />
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
            </div>
            <div id="scheduler_body_rows_wrapper" ref={registerElement} className={classes.body_rows_events_wrapper}>
                <TimeIndicator name={name} showTimer={false} />
                <div id="scheduler_body_rows" ref={registerElement} className={classes.body_rows}>
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
                <Events
                    name={name}
                    cell={{
                        height: parseCssVariable(getCssVariable("--scheduler-cell-height")) / 4,
                        width: headerRows?.lastElementChild?.firstElementChild?.clientWidth || 0,
                    }}
                    renderEvent={renderEvent}
                />
                <DragOverlay dropAnimation={null}>
                    {draggingEvent ? <Event event={draggingEvent} dragging /> : null}
                </DragOverlay>
            </div>
            <Loader show={isLoading}>{loader}</Loader>
        </div>
    );
});

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
    view: TSchedulerView;

    /**
     * @property {number} duration -- A cell will be divided into multiple part.
     *
     * Each part can be of 15, 30 or 60 minutes.
     */
    duration?: 15 | 30 | 60;

    /**
     * @property {JSX.Element} loader -- Custom loader component rendered while scheduler events are loading
     */
    loader?: JSX.Element;

    /**
     * @function {Function} renderEvent -- Renders custom event in scheduler. It will override default event component.
     */
    renderEvent?: (event: TSchedulerEvent, options: { dragHandler: SyntheticListenerMap }) => JSX.Element;

    /**
     * @function {Function} renderHeader -- Renders custom header cell in scheduler. It will override default header cell component.
     */
    renderHeader?: (header: TSchedulerHeader) => JSX.Element;

    /**
     * @function {Function} onDrag -- Called when events is getting dragged.
     */
    onDrag?: (event: T) => void;

    /**
     * @function {Function} onDrop -- Called when event is dropped successfully.
     */
    onDrop?: (event: T) => void;
};

function Scheduler<T extends TSchedulerEvent>(props: TSchedulerProps<T>) {
    const { name, view, loader, duration = 15, renderEvent, renderHeader, onDrag, onDrop } = props;

    const dispatch = useDispatch();
    const sensors = useSensors(usePointerSensor());
    const { getElement } = useDomSelector();
    const { initialized, mounted, events, headers, setEvents, setDraggingEvent, setDroppedEvent, setGrid } =
        useSchedulerInternalState(name);

    const [elevateHeader, setElevateHeader] = React.useState(false);
    const [elevateTimeColumn, setElevateTimeColumn] = React.useState(false);
    const [modifiers, setModifiers] = React.useState<Modifier[]>([]);

    // mount
    React.useEffect(() => {
        if (initialized) {
            dispatch(setMounted(name));
            dispatch(setHours(name, dayjs().startOf("day"), dayjs().endOf("day")));

            if ((["day", "week", "month"] as TSchedulerView[]).includes(view)) {
                dispatch(setView(name, view));
            }
        }
    }, [initialized, setMounted]);

    // mount: attach scroll listeners
    React.useEffect(() => {
        const headerRows = getElement("scheduler_header_rows");
        const bodyRows = getElement("scheduler_body_rows_wrapper");
        const bodyTimeColumn = getElement("scheduler_body_time_column");

        function schedulerBodyScrollListener(_event: Event) {
            if (headerRows) {
                headerRows.scrollLeft = bodyRows?.scrollLeft || 0;
            }

            if (bodyTimeColumn) {
                bodyTimeColumn.scrollTop = bodyRows?.scrollTop || 0;
            }

            // add elevation if scheduler is scrolled from its initial position
            setElevateHeader(!!bodyRows?.scrollTop);
            setElevateTimeColumn(!!bodyRows?.scrollLeft);
        }

        if (mounted) {
            bodyRows?.addEventListener("scroll", schedulerBodyScrollListener);
        }

        return () => bodyRows?.removeEventListener("scroll", schedulerBodyScrollListener);
    }, [mounted, getElement]);

    // mount: add modifiers
    React.useEffect(() => {
        const modifiers: Modifier[] = [];

        if (mounted) {
            const headerRows = getElement("scheduler_header_rows");

            const cellWidth = headerRows?.lastElementChild?.firstElementChild?.clientWidth;
            const cellHeight = parseCssVariable(getCssVariable("--scheduler-cell-height")) / 4;

            if (cellWidth && cellHeight) {
                modifiers.push(
                    snapToGridModifier(cellWidth, cellHeight, {
                        dx: 1,
                        dy: (y) => {
                            return Math.floor(y / cellHeight) % 4 === 0 ? 1 : 0;
                        },
                    }),
                );
            }
        }

        setModifiers(modifiers);
    }, [mounted]);

    // triggers when event is first dragged
    const onDragStartHandler = React.useCallback(
        (ev: DragStartEvent) => {
            const event = ev.active.data.current?.event as TSchedulerEventWithExtras;

            if (event?.id) {
                const newEvents = events.map((it) => {
                    const mappedEvent = it;

                    // make dragging events faded while dragging
                    if (mappedEvent.id === event.id) {
                        mappedEvent._extras.visibility = "faded";
                    }

                    return { ...mappedEvent };
                });

                setEvents(newEvents);
                setDraggingEvent(event);
            }
        },
        [events, setDraggingEvent, setEvents],
    );

    // triggers when event is in dragging state
    const onDragMoveHandler = React.useCallback(
        (ev: DragMoveEvent) => {
            const { active, delta } = ev;
            const event = active.data.current?.event as TSchedulerEventWithExtras;

            const headerRows = getElement("scheduler_header_rows");
            const columns = Array.from(headerRows?.lastElementChild?.children || []) as HTMLElement[];
            const cellCount = 60 / duration;

            const cellWidth = headerRows?.lastElementChild?.firstElementChild?.clientWidth || 0;
            const cellHeight = parseCssVariable(getCssVariable("--scheduler-cell-height"));

            if (event?.id) {
                const { id, _extras } = event;
                const { coordinates = { x: 0, y: 0 } } = _extras;

                // calculate event current position/coordinates
                const nX = coordinates.x + delta.x;
                const nY = coordinates.y + delta.y;

                const startHour = Math.floor(nY / cellHeight);
                const startMinute = Math.floor((nY % cellHeight) / (cellHeight / cellCount)) * duration;

                const start = dayjs().set("hour", startHour).set("minute", startMinute);
                const end = start.add(event.end.diff(event.start, "minute"), "minute");

                setDraggingEvent({ ...event, start, end, _extras: { ...event._extras, visibility: "visible" } });
            }
        },
        [events, duration, setDraggingEvent],
    );

    // triggers when user release event and dragging is stopped
    const onDragEndHandler = React.useCallback(
        (ev: DragEndEvent) => {
            const { active, delta } = ev;
            const event = active.data.current?.event as TSchedulerEventWithExtras;

            const bodyRows = getElement("scheduler_body_rows");
            const cellHeight = parseCssVariable(getCssVariable("--scheduler-cell-height"));

            if (event?.id) {
                const { coordinates = { x: 0, y: 0 } } = event._extras;
                const nX = coordinates.x + delta.x;
                const nY = coordinates.y + delta.y;

                const targetRowIndex = Math.floor(nY / cellHeight);
                const targetColumnIndex = Math.floor(nX / 163);

                const targetRow = bodyRows?.children.item(targetRowIndex) as HTMLElement;
                const targetColumn = targetRow?.children.item(targetColumnIndex) as HTMLElement;

                if (targetRowIndex >= 0 && targetColumnIndex >= 0) {
                    event._extras.coordinates = {
                        x: targetColumn.offsetLeft,
                        y: targetRow.offsetTop + Math.floor((nY % 50) / 12.5) * 12.5,
                    };

                    setGrid((grid) => {
                        let current = dayjs(event.start);

                        while (!current.isAfter(event.end)) {
                            const cell =
                                grid[event.group.join("-")][current.hour() + Math.floor(current.minute() / 15)]; //TODO: Replace 15 with duration

                            if (cell) {
                                // update old grid cells with event ids
                                cell.events = cell.events.filter((itId) => itId !== event.id);
                            }

                            //TODO: Replace 15 with duration
                            current = current.add(15, "minute");
                        }

                        return { ...grid };
                    });

                    const date = headers.at(-1)?.[targetColumnIndex]?._extras.date || dayjs();
                    const hour = Math.floor(nY / cellHeight);
                    const minute = Math.floor((nY % cellHeight) / 12.5) * 15;
                    const start = event.start.set("hour", hour).set("minute", minute);
                    const end = start.add(event.end.diff(event.start, "minute"), "minute");

                    event.group = [date.day().toString()];
                    event.start = start;
                    event.end = end;

                    setGrid((grid) => {
                        let current = dayjs(event.start);

                        while (!current.isAfter(event.end)) {
                            const cell =
                                grid[event.group.join("-")][current.hour() + Math.floor(current.minute() / 15)];

                            if (cell) {
                                // update new grid cells with event ids
                                cell.events = cell.events.filter((itId) => itId !== event.id);
                                cell.events.push(event.id);
                            }

                            current = current.add(15, "minute");
                        }

                        return { ...grid };
                    });

                    const newEvents = events.map((itrEvent) => {
                        const mappedEvent = itrEvent.id === event.id ? event : itrEvent;

                        // make all events visible again from faded after event is dropped.
                        mappedEvent._extras = {
                            ...mappedEvent._extras,
                            visibility: "visible",
                        };

                        return { ...mappedEvent };
                    });

                    setEvents(newEvents);
                    setDroppedEvent({ ...event });
                    setDraggingEvent(null);
                }
            }
        },
        [events, setEvents, setDroppedEvent, setDraggingEvent, setGrid],
    );

    const onDragCancelHandler = React.useCallback(
        (ev: DragCancelEvent) => {
            setDraggingEvent(null);
            setDroppedEvent(null);
        },
        [setDraggingEvent, setDroppedEvent],
    );

    return (
        <DndContext
            modifiers={modifiers}
            sensors={sensors}
            onDragStart={onDragStartHandler}
            onDragMove={onDragMoveHandler}
            onDragEnd={onDragEndHandler}
            onDragCancel={onDragCancelHandler}
        >
            <div className={classes.scheduler}>
                <SchedulerHeader name={name} elevateHeader={elevateHeader} elevateTimeColumn={elevateTimeColumn} />
                <SchedulerBody
                    name={name}
                    elevateTimeColumn={elevateTimeColumn}
                    loader={loader}
                    renderEvent={
                        renderEvent &&
                        (({ start, end, ...rest }, options) =>
                            renderEvent({ start: start.toDate(), end: end.toDate(), ...rest }, options))
                    }
                />
            </div>
        </DndContext>
    );
}

export default React.memo(Scheduler);
