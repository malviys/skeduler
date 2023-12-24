import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { memo, useMemo } from "react";

import { TSchedulerEvent, TSchedulerEventWithExtras } from "../../../data/store/types";
import Draggable from "../draggable/draggable";
import { mergeClasses } from "../../../utils/styles";

import classes from "./event.module.scss";

type EventProps = {
    event: TSchedulerEventWithExtras;
    renderEvent?: (event: TSchedulerEventWithExtras, options: { dragHandler: SyntheticListenerMap }) => JSX.Element;
};

function Event(props: EventProps) {
    const { event, renderEvent } = props;

    const placeholderEvent = useMemo(() => {
        const {
            color,
            title,
            _extras: { visibility, collisions },
        } = event;

        return (
            <div
                style={{
                    width: `calc((163.27px - 2 * var(--scheduler-event-padding)) / ${collisions.size + 1})`,
                    height: "calc(100px - 2 * var(--scheduler-event-padding))",
                    backgroundColor: color,
                    filter: visibility === "faded" ? "brightness(0.8)" : 'none',
                }}
                className={mergeClasses(classes.container)}
            >
                <span
                    style={{
                        width: "6px",
                        borderRadius: "3px",
                        backgroundColor: "white",
                    }}
                />
                <div style={{ verticalAlign: "center" }}>
                    <span>{title}</span>
                </div>
            </div>
        );
    }, [event]);

    return (
        <Draggable
            key={`draggable_scheduler_event_${event.id}`}
            id={`draggable_scheduler_event_${event.id}`}
            data={event}
        >
            {renderEvent ? (listeners) => renderEvent(event, { dragHandler: listeners }) : <>{placeholderEvent}</>}
        </Draggable>
    );
}

export default memo(Event);
