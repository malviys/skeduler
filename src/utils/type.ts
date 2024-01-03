export type ReplaceWith<T, R extends { [K in keyof T]?: unknown }> = {
    [K in keyof T]: K extends keyof R ? R[K] : T[K];
};
