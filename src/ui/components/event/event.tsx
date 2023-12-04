import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { memo, useMemo } from "react";

import { TEvent, TEventWithExtras } from "../../../data/store/type";
import Draggable from "../draggable/draggable";

const classes = {
    container: "container",
};

type EventProps = {
    event: TEventWithExtras;
    renderEvent?: (event: TEventWithExtras, options: { dragHandler: SyntheticListenerMap }) => JSX.Element;
};

function Event(props: EventProps) {
    const { event, renderEvent } = props;

    const placeholderEvent = useMemo(() => {
        const { color, title } = event;
        return (
            <div
                style={{
                    display: "flex",
                    width: "100%",
                    height: "100%",
                    borderRadius: "8px",
                    backgroundColor: color,
                    textTransform: "capitalize",
                }}
            >
                <span
                    style={{
                        width: "6px",
                        borderRadius: "3px",
                        margin: "6px 6px",
                        backgroundColor: "white",
                    }}
                />
                <div style={{verticalAlign: 'center'}}>
                    <text>{title}</text>
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
