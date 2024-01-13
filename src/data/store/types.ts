import { Dayjs } from "dayjs";
import { ReplaceWith } from "../../utils/type";

export type TReturnStateFunction = (state: SchedulerState) => SchedulerState;

export type SchedulerEventWithExtras = {
    id: string;
    title: string;
    start: Dayjs;
    end: Dayjs;
    group: string[];
    color?: string;
    _extras: {
        coordinates?: { x: number; y: number };
        dragging?: boolean;
        visibility?: "visible" | "hidden" | "faded";
        collisions?: Set<string>;
        index?: number;
    };
};

export type SchedulerEvent = Omit<ReplaceWith<SchedulerEventWithExtras, { start: Date; end: Date }>, "_extras">;

export type SchedulerHeader = {
    id: string;
    title: string;
    span: number;
    children: SchedulerHeader[];
    parent?: SchedulerHeader;
};

export type SchedulerHeaderWithExtras = SchedulerHeader & {
    _extras: {
        date: Dayjs;
    };
};

export type SchedulerCell = {
    id: string;
    events: string[];
    start: Dayjs;
    end: Dayjs;
};

export type SchedulerGrid = Record<string | number, SchedulerCell[]>;

export type SchedulerView = "day" | "week" | "month";

/** Store can have multiple scheduler sub-stores */
export type SchedulerState = Record<
    string,
    {
        view?: SchedulerView;
        headers?: SchedulerHeaderWithExtras[][];
        events?: SchedulerEventWithExtras[];
        hours?: Dayjs[];
        rowLabels?: string[];
        grid?: SchedulerGrid;
        start?: Dayjs;
        end?: Dayjs;
        duration?: number;
        initialized: boolean;
        mounted?: boolean;
        isLoading?: boolean;
        isFetching?: boolean;
        draggingEvent?: SchedulerEventWithExtras | null;
        droppedEvent?: SchedulerEventWithExtras | null;
    }
>;
