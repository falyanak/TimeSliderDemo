export const DAY = 86400000;

export function toDay(date: Date): number {
    return Math.floor(date.getTime() / DAY);
}

export function fromDay(day: number): Date {
    return new Date(day * DAY);
}

export function firstOfMonthUTC(year: number, month: number): number {
    return Date.UTC(year, month, 1) / DAY;
}

export function generateMonthTicks(minDay: number, maxDay: number): number[] {
    const ticks: number[] = [];

    let d = fromDay(minDay);
    let year = d.getUTCFullYear();
    let month = d.getUTCMonth();

    while (true) {
        const tick = firstOfMonthUTC(year, month);

        if (tick > maxDay) break;
        if (tick >= minDay) ticks.push(tick);

        month++;
        if (month > 11) {
            month = 0;
            year++;
        }
    }

    return ticks;
}

export function dayToPercent(day: number, min: number, max: number): number {
    return ((day - min) / (max - min)) * 100;
}

export function formatTick(day: number, span: number): string {
    const d = fromDay(day);

    if (span > 730) {
        const m = d.getUTCMonth();
        if (m === 0) return "Janv " + d.getUTCFullYear();
        if (m === 5) return "Juin " + d.getUTCFullYear();
        return "";
    }

    return d.toISOString().substring(0, 7);
}