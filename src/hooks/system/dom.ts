import dayjs from "dayjs";
import React from "react";

const _domState = {
    lastModified: dayjs(),
    elementsMap: new Map<string, HTMLElement>(),
};

export function useDomSelector() {
    const registerElement = React.useCallback(<T extends HTMLElement>(instance: T | null) => {
        if (instance?.id) {
            _domState.elementsMap.set(instance.id, instance);
            _domState.lastModified = dayjs();
        }
    }, []);

    const getElement = React.useCallback((id: string) => {
        const element = _domState.elementsMap.get(id);

        if (!element) {
            const element = document.getElementById(id);
            registerElement(element);

            return element;
        }

        return element;
    }, []);

    return {
        registerElement,
        getElement,
    };
}
