import { Modifier } from "@dnd-kit/core";
import { getEventCoordinates } from "@dnd-kit/utilities";

export function snapToGridModifier(
    width: number,
    height: number,
    delta?: { dx?: ((x: number) => number) | number; dy?: ((y: number) => number) | number },
): Modifier {
    return (args) => {
        const {
            // offset traveled while dragging, -ve if moved in left or bottom direction & +ve if move in either top or right direction
            transform,

            active,

            // currently dragged node
            draggingNodeRect,

            // event of activation
            activatorEvent,

            // droppable container
            containerNodeRect,
        } = args;
        console.log(active);
        if (containerNodeRect && draggingNodeRect && activatorEvent) {
            // get coordinates for activation event
            const activatorCoords = getEventCoordinates(activatorEvent);

            if (!activatorCoords) {
                return transform;
            }

            // dragging node offsets, will be constant and won't change
            const dragNodeOffsetX = Math.floor(draggingNodeRect.left / width);

            // current offset, offsets generated at runtime while dragging.
            const offsetX = Math.floor((activatorCoords.x - containerNodeRect.left + transform.x) / width);
            const offsetY = Math.floor(transform.y / height);

            return {
                ...transform,
                x: (offsetX - dragNodeOffsetX) * (width + 1),
                y: offsetY * height,
            };
        }

        return transform;
    };
}
