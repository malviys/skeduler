import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

export function useTimer() {
    const [time, setTime] = useState(dayjs());

    useEffect(() => {
        const iId = setInterval(() => {
            const now = dayjs();

            if (now.second() === 0) {
                setTime(now);
            }
        }, 1000);

        return () => {
            clearInterval(iId);
        };
    }, []);

    return time;
}
