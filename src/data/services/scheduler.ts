export async function fetchSchedulerState() {
    return await new Promise<{ name: string; view: string; headers?: {}[] }>((res, _rej) => {
        const tId = setTimeout(() => {
            res({
                name: "scheduler",
                view: "week",
                headers: [],
            });
        }, 1000);
    });
}
