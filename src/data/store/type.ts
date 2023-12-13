import { Dayjs } from "dayjs";

export type TReturnStateFunction = (state: TState) => TState;

/** Event: represents the events schedule in scheduler */
export type TEvent = {
    id: string | number;
    title: string;
    start: Date;
    end: Date;
    group: TEvent["id"][];
    color?: string;
};

/** TODO: add doc comment */
export type TEventWithExtras = TEvent & {
    extras: {
        coordinates: { x: number; y: number };
        dragging?: boolean;
        visibility?: "visible" | "hidden" | "faded";
    };
};

/** Header: represents the header of scheduler */
export type THeader = {
    id: string | number;
    title: string;
    span: number;
    children: THeader[];
    parent?: THeader;
};

/** Cell: represents the cell of scheduler */
export type TCell = {
    id: string | number;
    events: (string | number)[];
};

/** Grid: represents whole scheduler grid*/
export type TGrid = Record<string | number, TCell[]>;

/** View: a view will represent how scheduler is structures. i.e weekly, monthly or a single day */
export type TView = "day" | "week" | "month";

/** Store: A store can have multiple scheduler */
export type TState = Record<
    string,
    {
        // views:
        view?: TView;

        // headers:
        headers?: THeader[][];

        // events:
        events?: TEventWithExtras[];

        // hours:
        hours?: Dayjs[];

        // grid:
        grid?: TGrid;

        // start:
        start?: Date;

        // end:
        end?: Date;

        // duration:
        duration?: number;

        // initialize:
        initialized: boolean;

        // mounted:
        mounted?: boolean;

        // isLoading:
        isLoading?: boolean;

        // isFetching:
        isFetching?: boolean;

        // dragging:
        dragging?: TEvent;

        // dropped:
        dropped?: TEvent;
    }
>;
