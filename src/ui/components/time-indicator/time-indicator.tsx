import dayjs from "dayjs";
import { memo } from "react";

import { useSelector } from "../../../data/store/store";
import { useTimer } from "../../../hooks/system";
import { getCssVariable, parseCssVariable } from "../../../utils/styles";

import classes from "./time-indicator.module.scss";

type TimeIndicatorProps = {
    name: string;
    showTimer?: boolean;
    showLine?: boolean;
};

function TimeIndicator(props: TimeIndicatorProps) {
    const { name, showTimer = true, showLine = true } = props;

    const time = useTimer();
    const isMounted = useSelector((state) => state[name]?.mounted || false);
    const cellHeight = parseCssVariable(getCssVariable("--scheduler-cell-height"));

    if (!isMounted) {
        return <></>;
    }

    const style = {
        transform: `translate(0, ${(time.hour() + time.minute() / 60) * cellHeight + time.hour()}px)`,
        height: showLine ? "1px" : "0px",
    } as React.CSSProperties;

    return (
        <div className={classes.container} style={style}>
            {
                <span className={classes.timer}>
                    {showTimer && time.format('HH:mm')}
                </span>
            }
        </div>
    );
}

export default memo(TimeIndicator);
