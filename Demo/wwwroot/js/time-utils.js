"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAY = void 0;
exports.toDay = toDay;
exports.fromDay = fromDay;
exports.firstOfMonthUTC = firstOfMonthUTC;
exports.generateMonthTicks = generateMonthTicks;
exports.dayToPercent = dayToPercent;
exports.formatTick = formatTick;
exports.DAY = 86400000;
function toDay(date) {
    return Math.floor(date.getTime() / exports.DAY);
}
function fromDay(day) {
    return new Date(day * exports.DAY);
}
function firstOfMonthUTC(year, month) {
    return Date.UTC(year, month, 1) / exports.DAY;
}
function generateMonthTicks(minDay, maxDay) {
    const ticks = [];
    let d = fromDay(minDay);
    let year = d.getUTCFullYear();
    let month = d.getUTCMonth();
    while (true) {
        const tick = firstOfMonthUTC(year, month);
        if (tick > maxDay)
            break;
        if (tick >= minDay)
            ticks.push(tick);
        month++;
        if (month > 11) {
            month = 0;
            year++;
        }
    }
    return ticks;
}
function dayToPercent(day, min, max) {
    return ((day - min) / (max - min)) * 100;
}
function formatTick(day, span) {
    const d = fromDay(day);
    if (span > 730) {
        const m = d.getUTCMonth();
        if (m === 0)
            return "Janv " + d.getUTCFullYear();
        if (m === 5)
            return "Juin " + d.getUTCFullYear();
        return "";
    }
    return d.toISOString().substring(0, 7);
}
//# sourceMappingURL=time-utils.js.map