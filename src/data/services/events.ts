export async function fetchEvents() {
    return await new Promise((res, _rej) => {
        const curr = new Date();

        const result = [
            {
                id: "1",
                title: "Event 1",
                start: new Date(curr.getFullYear(), curr.getMonth(), curr.getDate(), 13, 0, 0, 0),
                end: new Date(curr.getFullYear(), curr.getMonth(), curr.getDate(), 14, 0, 0, 0),
                group: ["0"],
                color: "red",
            },
            {
                id: "2",
                title: "Event 2",
                start: new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + 1, 11, 0, 0, 0),
                end: new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + 1, 12, 0, 0, 0),
                group: ["6"],
                color: "yellow",
            },
            {
                id: "3",
                title: "Event 3",
                start: new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + 2, 15, 0, 0, 0),
                end: new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + 2, 16, 0, 0, 0),
                group: ["5"],
                color: "green",
            },
        ];

        const tId = setTimeout(() => {
            res(result);

            clearTimeout(tId);
        }, 1000);
    });
}
