import { useDraggable } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";

import { TEventWithExtras } from "../../../data/store/type";
import { mergeClasses } from "../../../utils/styles";

import classes from "./draggable.module.scss";

export type DraggableProps = {
    id: string;
    children: ((listeners: SyntheticListenerMap) => JSX.Element) | JSX.Element;
    data: TEventWithExtras;
};

function Draggable(props: DraggableProps) {
    const { children, data, id } = props;

    const { setNodeRef, transform, attributes, listeners, isDragging } = useDraggable({
        id: id,
        data: {
            type: "event",
            event: data,
        },
    });

    const style = {
        left: data.extras.coordinates.x,
        top: data.extras.coordinates.y,
        transform: CSS.Translate.toString(transform),
    } as React.CSSProperties;

    const renderChildren = useMemo(() => {
        if (typeof children === "function") {
            return children(listeners || {});
        }

        return children;
    }, [children, listeners]);

    return (
        <div
            ref={setNodeRef}
            className={mergeClasses(classes.container)}
            style={style}
            {...(typeof children === "function" ? {} : listeners)}
            {...attributes}
        >
            {renderChildren}
        </div>
    );
}

export default Draggable;
