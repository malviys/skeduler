import { useDroppable } from "@dnd-kit/core";
import React, { memo } from "react";

import classes from "./droppable.module.scss";

type DroppableProps = {
    id: string;
    children: JSX.Element;
};

function Droppable(props: DroppableProps) {
    const { children, id } = props;

    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    const style: React.CSSProperties = {
        backgroundColor: isOver ? "green" : "",
    };

    // console.log(isOver, id)

    return (
        <div ref={setNodeRef} style={style} className={classes.container}>
            {children}
        </div>
    );
}

export default memo(Droppable);
