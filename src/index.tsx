import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";

import { Scheduler } from "./ui";

import { useScheduler } from "./hooks/scheduler";

import { fetchEvents } from "./data/services/events";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);

function App() {
    const { init, setIsLoading, setEvents } = useScheduler("scheduler");

    const [schedulerState, setSchedulerState] = React.useState<{ name: string; view: string }>();

    React.useLayoutEffect(() => {
        init();
    }, [init]);

    React.useEffect(() => {
        setIsLoading(true);

        fetchEvents().then((res) => {
            setEvents(res as Parameters<typeof setEvents>[0]);
            setIsLoading(false);
        });
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

export { useScheduler } from "./hooks/scheduler";
export { default as Scheduler } from "./ui/scheduler";
