import { Dayjs } from "dayjs";
import { ReplaceWith } from "../../utils/type";

export type TReturnStateFunction = (state: TSchedulerState) => TSchedulerState;

/**
 * A Event with managed extra properties.
 */
export type TSchedulerEventWithExtras = {
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
    start: Dayjs;

    /**
     * End date and time of event
     */
    end: Dayjs;

    /**
     * List of header and their parent header ids
     */
    group: string[];

    /**
     * Background color of event
     */
    color?: string;

    /**
     * Extra properties that were internally managed by the scheduler
     */
    _extras: {
        /**
         * Location of event in scheduler
         */
        coordinates?: { x: number; y: number };

        /**
         * Dragging state of event when user start or stop dragging
         */
        dragging?: boolean;

        /**
         * Where event is fully, partial or not visible to user
         */
        visibility?: "visible" | "hidden" | "faded";

        /**
         * Ids of other events with which current event is colliding.
         */
        collisions?: Set<string>;

        /**
         * Position of current event with respect to other colliding events.
         */
        index?: number;
    };
};

/**
 * Event
 */
export type TSchedulerEvent = Omit<ReplaceWith<TSchedulerEventWithExtras, { start: Date; end: Date }>, "_extras">;

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
        date: Dayjs;
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
        /**
         *
         */
        view?: TSchedulerView;

        /**
         * List of headers
         */
        headers?: TSchedulerHeaderWithExtras[][];

        /**
         * List of events that were scheduled in Scheduler.
         */
        events?: TSchedulerEventWithExtras[];

        // hours:
        hours?: Dayjs[];

        /**
         * Provides reference points for each row of grid. Represents the rows of the first column of the grid.
         */
        rowLabels?: string[];

        /**
         * Represents the whole scheduler
         */
        grid?: TSchedulerGrid;

        /**
         * Start time of scheduler. Default 12 AM
         */
        start?: Dayjs;

        /**
         * End time of scheduler. Default 11 PM
         */
        end?: Dayjs;

        /**
         * Duration of each row/cell. Used to divide an hour into multiple parts, default 15 minutes.
         */
        duration?: number;

        /**
         * If true store is initialized and scheduler can be rendered.
         */
        initialized: boolean;

        /**
         * If true scheduler is rendered and mounted into the dom.
         */
        mounted?: boolean;

        /**
         * If true all user interactions are blocked.
         */
        isLoading?: boolean;

        /**
         *
         */
        isFetching?: boolean;

        /**
         * Event that is in dragging state.
         */
        draggingEvent?: TSchedulerEventWithExtras | null;

        /**
         * Event that is recently dropped/scheduled.
         */
        droppedEvent?: TSchedulerEventWithExtras | null;
    }
>;
