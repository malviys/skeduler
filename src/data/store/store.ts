import { create } from "zustand";

import { TReturnStateFunction, TState } from "./type";

type T = {
    state: TState;
    dispatch: (...fns: TReturnStateFunction[]) => void;
};

export const useStore = create<T>((set) => ({
    state: {},
    dispatch: (...fns) => {
        set((state) => {
            const nextState = { state: state.state };

            for (const fn of fns) {
                nextState.state = fn(nextState.state);
            }

            return nextState;
        });
    },
}));

/** all operations were synchronous */
export function useDispatch() {
    return useStore((state) => state.dispatch);
}

export function useSelector<R>(selectorFn: (state: TState) => R) {
    return useStore((state) => selectorFn(state.state));
}

// function useSyncDispatch() {
//     const storeDispatch = useStore((state) => state.dispatch);

//     const [blockingDispatchQueue, setBlockingDispatchQueue] = useState<{
//         queue: TReturnStateFunction[];
//         processing: boolean;
//     }>({ queue: [], processing: false });

//     const processQueue = useCallback(() => {
//         setBlockingDispatchQueue((p) => ({ ...p, processing: true }));

//         new Promise(() => {
//             setBlockingDispatchQueue((p) => {
//                 while (p.queue.length) {
//                     // rome-ignore lint/style/noNonNullAssertion: <explanation>
//                     storeDispatch(p.queue.shift()!);
//                 }

//                 return {
//                     ...p,
//                     processing: false,
//                 };
//             });
//         });
//     }, []);

//     function r(state: T) {
//         return function (fn: TReturnStateFunction) {
//             const newState = blockingDispatchQueue.queue.at(0)?.(state.state);

//             if (!newState?.[""].initialized) {
//                 throw new Error();
//             }

//             processQueue()
//         };
//     }
// }
