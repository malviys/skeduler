import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import Color from "color";
import React from "react";

import { TSchedulerEventWithExtras } from "../../../data/store/types";
import { mergeClasses } from "../../../utils/styles";

import classes from "./event.module.scss";
import Draggable from "../draggable/draggable";

type EventProps = {
    event: TSchedulerEventWithExtras;
    renderEvent?: (event: TSchedulerEventWithExtras, options: { dragHandler: SyntheticListenerMap }) => JSX.Element;
};

export const DraggableEvent = React.memo(function (props: EventProps) {
    const { event, renderEvent } = props;

    const renderingEvent = React.useMemo(() => {
        function Wrapper(props: { children: React.ReactNode }) {
            const { children } = props;

            return (
                <div style={{ width: "150px", height: "98px", padding: "0.125em", cursor: "grab" }}>
                    {children}
                </div>
            );
        }

        if (!renderEvent) {
            return (
                <Wrapper>
                    <Event event={event} />
                </Wrapper>
            );
        }

        return (listeners: SyntheticListenerMap) => <Wrapper>{renderEvent(event, { dragHandler: listeners })}</Wrapper>;
    }, [event, renderEvent]);

    return (
        <Draggable
            key={`draggable_scheduler_event_${event.id}`}
            id={`draggable_scheduler_event_${event.id}`}
            data={event}
        >
            {renderingEvent}
        </Draggable>
    );
});

function Event(props: Omit<EventProps, "renderEvent"> & { dragging?: boolean }) {
    const {
        event: { title, color, start, end, _extras: { visibility } },
        dragging,
    } = props;

    const eventBgColor = Color(color).lighten(0.6).toString();
    const handleColor = Color(color).darken(0.6).toString();
    const fontColor = Color(color).isLight() ? "#000000" : "#FFFFFF";
    const filter = `${visibility === "faded" ? "brightness(0.8)" : "none"}`;

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: eventBgColor,
                color: fontColor,
                filter,
                cursor: dragging ? "grabbing" : undefined,
            }}
            className={mergeClasses(classes.container)}
        >
            <span
                style={{
                    width: "0.125em",
                    borderRadius: "0.25em",
                    backgroundColor: handleColor,
                    margin: "0.125em",
                }}
            />
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "0.25em",
                    padding: "0.25em 0",
                }}
            >
                <span style={{ display: "block", fontSize: "12pt" }}>{title}</span>
                <span style={{ display: "block", fontSize: "8pt" }}>
                    {start.format("HH:mm")}&nbsp;-&nbsp;{end.format("HH:mm")}
                </span>
            </div>
        </div>
    );
}

export default React.memo(Event);
