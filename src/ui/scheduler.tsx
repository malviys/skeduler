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
import type { SchedulerEvent, SchedulerEventWithExtras, SchedulerHeader, SchedulerView } from "../data/store/types";

import { usePointerSensor } from "../hooks/dnd";
import { useSchedulerInternalState } from "../hooks/scheduler";
import { useDomSelector } from "../hooks/system/dom";

import {} from "../utils/dayjs";
import { snapToGridModifier } from "../utils/dnd-kit";
import { reduceFns } from "../utils/helpers";
import { getCssVariable, mergeClasses, parseCssVariable } from "../utils/styles";

import classes from "./scheduler.module.scss";

type EventsProps = {
    name: string;
    cell: {
        height: number;
        width: number;
    };
    renderEvent?:
        | ((event: SchedulerEventWithExtras, options: { dragHandler: SyntheticListenerMap }) => JSX.Element)
        | null;
};

const Events = React.memo(function (props: EventsProps) {
    const { name, cell, renderEvent } = props;
    const { width, height } = cell;

    const { mounted, isLoading, events } = useSchedulerInternalState(name);

    const processCoordinates = React.useCallback(
        (event: SchedulerEventWithExtras): SchedulerEventWithExtras => {
            const { coordinates } = event._extras;

            if (coordinates) {
                return event;
            }

            const x = parseInt(event.group.join("-"), 10) * (width + 1);
            const y =
                event.start.hour() + 1 + (event.start.hour() * 4 + Math.floor(event.start.minute() / 15)) * height;

            return { ...event, _extras: { ...event._extras, coordinates: { x, y } } };
        },
        [width, height],
    );

    if (!mounted || isLoading) {
        return <></>;
    }

    return (
        <>
            {events.map((event) => (
                <DraggableEvent
                    key={`scheduler_event_[${event.id}]`}
                    event={reduceFns(event, processCoordinates /* processCollisions */)}
                    renderEvent={renderEvent}
                />
            ))}
        </>
    );
});

type HeaderProps = {
    name: string;
    elevateHeader: boolean;
    elevateTimeColumn: boolean;
};

const Header = React.memo(function (props: HeaderProps): JSX.Element {
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

type BodyProps = {
    name: string;
    elevateTimeColumn: boolean;
    loader?: JSX.Element;
    renderEvent?:
        | ((event: SchedulerEventWithExtras, options: { dragHandler: SyntheticListenerMap }) => JSX.Element)
        | null;
};

const Body = React.memo(function (props: BodyProps): JSX.Element {
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
                <DragOverlay dropAnimation={null} className={classes.scheduler_drag_overlay}>
                    {draggingEvent ? <Event event={draggingEvent} dragging /> : null}
                </DragOverlay>
            </div>
            <Loader show={isLoading}>{loader}</Loader>
        </div>
    );
});

export type SchedulerProps<T> = {
    name: string;
    view: SchedulerView;
    duration?: 15 | 30 | 60;
    loader?: JSX.Element;
    renderEvent?: (event: SchedulerEvent, options: { dragHandler: SyntheticListenerMap }) => JSX.Element;
    renderHeader?: (header: HeaderProps) => JSX.Element;
    onDrag?: (event: SchedulerEvent) => void;
    onDrop?: (event: SchedulerEvent) => void;
};

function processCollisions<T extends SchedulerEventWithExtras>(event: T, events: T[]): T {
    const { id, start, end, _extras } = event;
    const { collisions = new Set() } = _extras;

    const collidingEvents = events.filter((itEvent) => {
        const { id: itId, start: itStart, end: itEnd } = itEvent;

        if (itId === id) {
            return false;
        }

        // TODO: implement collision algo based on events coordinates
        const hasSameTime =
            dayjs(start).isBetween(itStart, itEnd, null, "[)") || dayjs(end).isBetween(itStart, itEnd, null, "(]");

        return hasSameTime;
    });

    collisions.clear();
    collidingEvents.forEach(({ id }) => collisions.add(id));

    return { ...event, _extras: { ...event._extras, collisions: collisions } };
}

function Scheduler<T extends SchedulerEvent>(props: SchedulerProps<T>) {
    const { name, view, loader, duration = 15, renderEvent: _renderEvent, renderHeader, onDrag, onDrop } = props;

    const dispatch = useDispatch();
    const sensors = useSensors(usePointerSensor());
    const { getElement } = useDomSelector();
    const { initialized, mounted, events, headers, setEvents, setDraggingEvent, setDroppedEvent, setGrid } =
        useSchedulerInternalState(name);

    const [elevateHeader, setElevateHeader] = React.useState(false);
    const [elevateTimeColumn, setElevateTimeColumn] = React.useState(false);
    const [modifiers, setModifiers] = React.useState<Modifier[]>([]);

    const headerRows = getElement("scheduler_header_rows");
    const bodyRows = getElement("scheduler_body_rows");
    const cellWidth = headerRows?.lastElementChild?.firstElementChild?.clientWidth || 1;
    const cellHeight = parseCssVariable(getCssVariable("--scheduler-cell-height"));

    // console.log(events);

    React.useEffect(() => {
        if (initialized) {
            dispatch(setMounted(name));
            dispatch(setHours(name, dayjs().startOf("day"), dayjs().endOf("day")));

            if ((["day", "week", "month"] as SchedulerView[]).includes(view)) {
                dispatch(setView(name, view));
            }
        }
    }, [initialized, setMounted]);

    React.useEffect(() => {
        const headerRows = getElement("scheduler_header_rows");
        const bodyRows = getElement("scheduler_body_rows_wrapper");
        const bodyTimeColumn = getElement("scheduler_body_time_column");

        function schedulerBodyScrollListener(_ev: Event) {
            if (headerRows) {
                headerRows.scrollLeft = bodyRows?.scrollLeft || 0;
            }

            if (bodyTimeColumn) {
                bodyTimeColumn.scrollTop = bodyRows?.scrollTop || 0;
            }

            setElevateHeader(!!bodyRows?.scrollTop);
            setElevateTimeColumn(!!bodyRows?.scrollLeft);
        }

        if (mounted) {
            bodyRows?.addEventListener("scroll", schedulerBodyScrollListener);
        }

        return () => bodyRows?.removeEventListener("scroll", schedulerBodyScrollListener);
    }, [mounted, getElement]);

    const getCellDetails = React.useCallback(
        (x: number, y: number) => {
            const r = Math.floor((y - Math.floor(y / cellHeight)) / cellHeight);
            const c = Math.floor(x / cellWidth);
            const cf = cellHeight / (60 / duration);

            const row = bodyRows?.children.item(r) as HTMLElement | null;
            const cell = row?.children.item(c) as HTMLElement | null;

            const top = row?.offsetTop || 0;
            const left = cell?.offsetLeft || 0;

            return {
                r,
                c,
                rf: Math.floor(Math.max(0, y - top) / cf),
                cf: 0,
                x: left,
                y: top,
                xf: 0,
                yf: Math.floor(Math.max(0, y - top) / cf) * cf,
                el: cell,
            };
        },
        [bodyRows, cellHeight, cellWidth, duration, getElement],
    );

    const onDragStartHandler = React.useCallback(
        (ev: DragStartEvent) => {
            const event = ev.active.data.current?.event as SchedulerEventWithExtras;

            if (event?.id) {
                const mappedEvents = events.map((itEvent) => {
                    const mappedEvent = /* { ...it } */ itEvent;

                    if (mappedEvent.id === event.id) {
                        mappedEvent._extras = {
                            ...mappedEvent._extras,
                            visibility: "faded",
                        };
                    }

                    return mappedEvent;
                });

                setEvents(mappedEvents);
                setDraggingEvent({ ...event });
            }
        },
        [events, setDraggingEvent, setEvents],
    );

    const onDragMoveHandler = React.useCallback(
        (ev: DragMoveEvent) => {
            const { active, delta } = ev;
            let event = active.data.current?.event as SchedulerEventWithExtras;

            if (event?.id) {
                const { r, x, y, xf, yf, rf, el } = getCellDetails(
                    delta.x + (event._extras.coordinates?.x || 0),
                    delta.y + (event._extras.coordinates?.y || 0),
                );

                const start = dayjs()
                    .set("hour", r)
                    .set("minute", rf * duration);
                const end = start.add(event.end.diff(event.start, "minute"), "minute");

                if (x >= 0 && y >= 0) {
                    event = {
                        ...event,
                        start,
                        end,
                        _extras: {
                            ...event._extras,
                            visibility: "visible",
                            coordinates: {
                                x: x + xf,
                                y: y + yf,
                            },
                        },
                    };
                }
            }

            setDraggingEvent(event);
        },
        [events, duration, cellHeight, cellWidth, getCellDetails, setDraggingEvent],
    );

    const onDragEndHandler = React.useCallback(
        (ev: DragEndEvent) => {
            const { active, delta } = ev;

            let event = (active.data.current?.event as SchedulerEventWithExtras) || {};
            
            if (event?.id) {
                const { r, c, x, y, xf, yf, rf } = getCellDetails(
                    delta.x + (event._extras.coordinates?.x || 0),
                    delta.y + (event._extras.coordinates?.y || 0),
                );

                if (r >= 0 && c >= 0) {
                    const date = headers.at(-1)?.[c]?._extras.date || dayjs();

                    event._extras = {
                        ...event._extras,
                        coordinates: {
                            x: x + xf,
                            y: y + yf,
                        },
                    };

                    setGrid((grid) => {
                        let current = dayjs(event.start);

                        while (!current.isAfter(event.end)) {
                            const cell =
                                grid[event.group.join("-")][current.hour() + Math.floor(current.minute() / 15)]; //TODO: Replace 15 with duration

                            if (cell) {
                                cell.events = cell.events.filter((itId) => itId !== event.id);
                            }

                            current = current.add(duration, "minute");
                        }

                        event._extras.index = 0;

                        return { ...grid };
                    });

                    const start = date.set("hour", r).set("minute", rf * duration);
                    const end = start.add(event.end.diff(event.start, "minute"), "minute");
                    const group = [date.day().toString()];

                    event = {
                        ...event,
                        start,
                        end,
                        group,
                    };

                    setGrid((grid) => {
                        let current = dayjs(event.start);

                        while (!current.isAfter(event.end)) {
                            const cell =
                                grid[event.group.join("-")][current.hour() + Math.floor(current.minute() / 15)];

                            if (cell) {
                                // update new grid cells with event ids
                                cell.events = cell.events.filter((itId) => itId !== event.id);
                                cell.events.push(event.id);
                                event._extras.index = Math.max(event._extras.index || 0, cell.events.length - 1);
                            }

                            current = current.add(15, "minute");
                        }

                        return { ...grid };
                    });

                    setDroppedEvent({ ...event });
                }
            }

            let mappedEvents = events.map((itEvent) => {
                const mappedEvent = itEvent.id === event.id ? event : itEvent;

                mappedEvent._extras = {
                    ...mappedEvent._extras,
                    visibility: "visible",
                };

                return { ...mappedEvent };
            });

            mappedEvents = mappedEvents.map((event) => processCollisions(event, mappedEvents));

            setDraggingEvent(null);
            setEvents(mappedEvents);

            const { _extras, start, end, ...restEvent } = event;

            onDrop?.({
                ...restEvent,
                start: start.toDate(),
                end: end.toDate(),
            });
        },
        [events, cellWidth, cellHeight, getCellDetails, onDrop, setEvents, setDroppedEvent, setDraggingEvent, setGrid],
    );

    const onDragCancelHandler = React.useCallback(
        (_: DragCancelEvent) => {
            const mappedEvents = events.map((itEvent) => {
                itEvent._extras.visibility = "visible";

                return { ...itEvent };
            });

            setDraggingEvent(null);
            setDroppedEvent(null);
            setEvents(mappedEvents);
        },
        [setEvents, setDraggingEvent, setDroppedEvent],
    );

    const renderEvent = React.useMemo<BodyProps["renderEvent"]>(() => {
        if (!_renderEvent) {
            return null;
        }

        return ({ start, end, ...rest }, options) => {
            return _renderEvent({ start: start.toDate(), end: end.toDate(), ...rest }, options);
        };
    }, [_renderEvent]);

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
                <Header name={name} elevateHeader={elevateHeader} elevateTimeColumn={elevateTimeColumn} />
                <Body name={name} elevateTimeColumn={elevateTimeColumn} loader={loader} renderEvent={renderEvent} />
            </div>
        </DndContext>
    );
}

export default React.memo(Scheduler);
