import { Dayjs } from "dayjs";

export type TReturnStateFunction = (state: TSchedulerState) => TSchedulerState;

/**
 * A Event
 */
export type TSchedulerEvent = {
    /**
     * An unique identifier
     */
    id: string;

    /**
     * Title of event visible to user
     */
    title: string;

    /**
     * Start date and time of event
     */
    start: Date;

    /**
     * End date and time of event
     */
    end: Date;

    /**
     * List of header and their parent header ids
     */
    group: TSchedulerEvent["id"][];

    /**
     * Background color of event
     */
    color?: string;
};

/** TODO: add doc comment */
export type TSchedulerEventWithExtras = TSchedulerEvent & {
    _extras: {
        /**
         * Location of event in scheduler
         */
        coordinates: { x: number; y: number } | null;

        /**
         * Dragging state of event when user start or stop dragging
         */
        dragging: boolean;

        /**
         * Where event is fully, partial or not visible to user
         */
        visibility: "visible" | "hidden" | "faded";

        /**
         * Ids of other events with which current event is colliding.
         */
        collisions: Set<string>;
    };
};

/** Schedulers grid header */
export type TSchedulerHeader = {
    /**
     * An unique identifier
     */
    id: string;

    /**
     * Title/Label of header visible to user
     */
    title: string;

    /**
     * Horizontal space required by header
     */
    span: number;

    /**
     * List of all child nodes
     */
    children: TSchedulerHeader[];

    /**
     * Points to parent header
     */
    parent?: TSchedulerHeader;
};

export type TSchedulerHeaderWithExtras = TSchedulerHeader & {
    _extras: {
        date: Date;
    };
};

/** Cell: represents the cell of scheduler */
export type TSchedulerCell = {
    /**
     * An unique identifier
     */
    id: string;

    /**
     * List of all event ids placed over current cell
     */
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
        // Scheduler view
        view?: TSchedulerView;

        // Scheduler headers
        headers?: TSchedulerHeaderWithExtras[][];

        // Scheduler events
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
