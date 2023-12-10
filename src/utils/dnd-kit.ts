import { Modifier } from "@dnd-kit/core";

export function snapToGridModifier(): Modifier {
    return (args) => {
        const {
            // offset travelled during dnd -ve if moved in left or bottom direction
            transform,

            // dragging element
            draggingNodeRect,
        } = args;

        if (draggingNodeRect && transform.x && transform.y) {
            // calculate x & y offset
            const offsetX = transform.x + draggingNodeRect.left;
            const offsetY = transform.y + draggingNodeRect.top;

            return {
                ...transform,

                // TODO: Implement coordinates clamp
                // clamp x & y offset
                // x: Math.floor(xOffset / 163) * 163,
                // y: Math.floor(offsetY / 16) * 16,
            };
        }

        return transform;
    };
}
