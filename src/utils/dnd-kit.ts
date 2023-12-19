import { Modifier } from "@dnd-kit/core";
import { getEventCoordinates } from "@dnd-kit/utilities";

export function snapToGridModifier(
    width: number,
    height: number,
    delta?: { x?: (() => number) | number; y?: (() => number) | number },
): Modifier {
    const deltaX = (typeof delta?.x === "function" ? delta?.x() : delta?.x) || 0;
    const deltaY = (typeof delta?.y === "function" ? delta?.y() : delta?.y) || 0;

    return (args) => {
        const {
            // offset traveled during dnd -ve if moved in left or bottom direction
            transform,

            // active element
            draggingNodeRect,

            // event of activation
            activatorEvent,
        } = args;

        if (draggingNodeRect && activatorEvent) {
            const activatorCoordinates = getEventCoordinates(activatorEvent);

            if (!activatorCoordinates) {
                return transform;
            }

            // calculate x & y offset
            // (distance between activation event and event left side) + (distance covered (x-dir) while dragging)
            // const offsetX = activatorCoordinates.x - draggingNodeRect.left + transform.x;

            // // (distance between activation event and event top side) + (distance covered (y-dir) while dragging)
            // const offsetY = /* activatorCoordinates.y - draggingNodeRect.top + */ transform.y;

            return {
                ...transform,

                // clamp x & y offset
                // x: Math.floor(offsetX / width) * (width + deltaX),
                // y: Math.floor(offsetY / height) * (height + deltaY),
            };
        }

        return transform;
    };
}
