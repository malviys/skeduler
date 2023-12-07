import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";

import Scheduler from "./ui/scheduler";
import { useScheduler } from "./hooks/scheduler";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);

function App() {
    const { init, setEvents } = useScheduler("scheduler");

    React.useLayoutEffect(() => {
        init();
    }, [init]);

    React.useEffect(() => {
        setEvents([
            {
                id: 1,
                title: "Event 1",
                start: new Date(new Date().setHours(11)),
                end: new Date(new Date().setHours(12)),
                group: [],
                color: "red",
            },
            {
                id: 2,
                title: "Event 2",
                start: new Date(new Date().setHours(11)),
                end: new Date(new Date().setHours(12)),
                group: [],
                color: "yellow",
            },
        ]);
    }, [setEvents]);

    const style: React.CSSProperties = {
        height: "100vh",
        width: "100%",
    };

    return (
        <div style={style}>
            <Scheduler name="scheduler" view="week" />
        </div>
    );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
