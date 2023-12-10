export function mergeClasses(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter((cls) => (typeof cls === "string" ? cls : "")).join(" ");
}

export function getCssVariable(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name);
}

export function parseCssVariable(value: string): number {
    const amount = parseFloat(value);

    if (Number.isNaN(amount)) {
        return 0;
    }

    if (/(em|rem)$/.test(value)) {
        return amount * 16;
    }

    return amount;
}
