import { MouseSensor, PointerSensor, useSensor } from "@dnd-kit/core";

export function useMouseSensor() {
    return useSensor(MouseSensor, {
        activationConstraint: {
            delay: 125,
            tolerance: 5,
        },
    });
}

export function usePointerSensor() {
    return useSensor(PointerSensor, {
        activationConstraint: {
            delay: 125,
            tolerance: 5,
        },
    });
}
