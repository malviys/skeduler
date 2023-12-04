import { memo } from "react";

import { useSelector } from "../../../data/store/store";

import classes from "./time-indicator.module.scss";

type TimeIndicatorProps = {
    name: string;
    showTimer?: boolean;
    showLine?: boolean;
};

function TimeIndicator(props: TimeIndicatorProps) {
    const { name, showTimer = true, showLine = true } = props;

    // const time = useTimer();
    // const grid = useSelector((state) => state[name]?.grid || {});
    const isMounted = useSelector((state) => state[name]?.mounted || false);

    if (!isMounted) {
        return <></>;
    }

    return (
        <div
            className={classes.container}
            style={{
                height: showLine ? "1px" : "0px",
            }}
        >
            {<span className={classes.timer}>{showTimer && "10:AM"}</span>}
        </div>
    );
}

export default memo(TimeIndicator);
