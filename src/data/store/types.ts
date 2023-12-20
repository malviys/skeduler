import { Dayjs } from "dayjs";

export type TReturnStateFunction = (state: TSchedulerState) => TSchedulerState;

/** 
 * A Event 
 */
export type TSchedulerEvent = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    group: TSchedulerEvent["id"][];
    color?: string;
};

/** TODO: add doc comment */
export type TSchedulerEventWithExtras = TSchedulerEvent & {
    extras: {
        coordinates: { x: number; y: number } | null;
        dragging: boolean;
        visibility: "visible" | "hidden" | "faded";
        collisions: string[];
    };
};

/** Header: represents the header of scheduler */
export type TSchedulerHeader = {
    id: string;
    title: string;
    span: number;
    children: TSchedulerHeader[];
    parent?: TSchedulerHeader;
};

/** Cell: represents the cell of scheduler */
export type TSchedulerCell = {
    id: string;
    events: string[];
};

/** Grid: represents whole scheduler grid*/
export type TSchedulerGrid = Record<string | number, TSchedulerCell[]>;

/** View: a view will represent how scheduler is structures. i.e weekly, monthly or a single day */
export type TSchedulerView = "day" | "week" | "month";

/** Store: A store can have multiple scheduler */
export type TSchedulerState = Record<
    string,
    {
        // views:
        view?: TSchedulerView;

        // headers:
        headers?: TSchedulerHeader[][];

        // events:
        events?: TSchedulerEventWithExtras[];

        // hours:
        hours?: Dayjs[];

        // grid:
        grid?: TSchedulerGrid;

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
        dragging?: TSchedulerEvent;

        // dropped:
        dropped?: TSchedulerEvent;
    }
>;
