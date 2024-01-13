import dayjs from "dayjs";

export async function fetchEvents() {
    const colors = ["red", "purple", "yellow", "orange", "green", "blue"];
    const days: number[] = [];

    for (let index = dayjs().startOf("week").date(); index <= dayjs().endOf("week").date(); index++) {
        days.push(index);
    }

    return await new Promise((res, _rej) => {
        const result = Array.from({ length: Math.max(2, /* Math.floor(Math.random() * 5) */ 5) }, (_, index) => {
            const id = index + 1;
            const day = dayjs().set("date", days[Math.floor(Math.random() * 10) % 7]);
            const start = day.set("hour", index).set("minute", 0).set("second", 0);
            const end = day
                .set("hour", index + 1)
                .set("minute", 0)
                .set("second", 0);

            return {
                id: id.toString(),
                title: `Event ${id}`,
                start,
                end,
                group: [day.day().toString()],
                color: colors[Math.floor(Math.random() * 10) % 7],
            };
        });

        const tId = setTimeout(() => {
            res(result);
            clearTimeout(tId);
        }, 1000);
    });
}
