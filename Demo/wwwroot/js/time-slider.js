"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTimeSlider = initTimeSlider;
const nouislider_1 = __importDefault(require("nouislider"));
const DAY = 86400000; // ms dans un jour
// UTILS
function toDay(date) {
    return Math.floor(new Date(date).getTime() / DAY);
}
function fromDay(day) {
    return new Date(day * DAY);
}
function snapToMonth(day) {
    const d = fromDay(day);
    const first = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1) / DAY;
    const next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1) / DAY;
    return Math.abs(day - first) < Math.abs(day - next) ? first : next;
}
function formatDay(day, span) {
    const d = fromDay(day);
    if (span > 730) { // > 2 ans
        const m = d.getUTCMonth();
        if (m === 0)
            return `Janv ${d.getUTCFullYear()}`;
        if (m === 5)
            return `Juin ${d.getUTCFullYear()}`;
        return "";
    }
    return d.toISOString().substring(0, 10);
}
// DOM helpers
function getSlider(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Element ${id} not found`);
    return el;
}
// INITIALISATION
function initTimeSlider() {
    const master = getSlider("masterSlider");
    const detail = getSlider("detailSlider");
    const output = document.getElementById("output");
    const minDay = toDay(START);
    const maxDay = toDay(END);
    // --- Create sliders ---
    nouislider_1.default.create(master, {
        start: [minDay, maxDay],
        connect: true,
        step: 1,
        range: { min: minDay, max: maxDay }
    });
    nouislider_1.default.create(detail, {
        start: [minDay, minDay + 30],
        connect: true,
        step: 1,
        range: { min: minDay, max: maxDay }
    });
    const masterApi = master.noUiSlider;
    const detailApi = detail.noUiSlider;
    // --- Master → Detail ---
    masterApi.on("update", (values) => {
        const min = Math.round(Number(values[0]));
        const max = Math.round(Number(values[1]));
        detailApi.updateOptions({ range: { min, max }, step: 1 }, true);
        detailApi.set([min, Math.min(min + 30, max)]);
    });
    // --- Aimantation douce ---
    function applySnap(api) {
        api.on("change", (values) => {
            let vals = Array.isArray(values) ? values.map(Number) : [Number(values)];
            let [min, max] = vals;
            const snapMin = snapToMonth(min);
            const snapMax = snapToMonth(max);
            if (Math.abs(min - snapMin) < 5)
                min = snapMin;
            if (Math.abs(max - snapMax) < 5)
                max = snapMax;
            api.set([min, max]);
        });
    }
    applySnap(masterApi);
    applySnap(detailApi);
    // --- Update UI + Chart ---
    detailApi.on("update", (values) => {
        const vals = Array.isArray(values) ? values.map(Number) : [Number(values)];
        const [min, max] = vals;
        const span = max - min;
        output.innerHTML = `
            <b>From:</b> ${formatDay(min, span)}<br/>
            <b>To:</b> ${formatDay(max, span)}
        `;
        updateChart(min, max);
    });
    // --- Zoom molette sur détail ---
    detail.addEventListener("wheel", (e) => {
        e.preventDefault();
        const raw = detailApi.get();
        const values = Array.isArray(raw) ? raw.map(Number) : [Number(raw)];
        let [min, max] = values;
        const center = (min + max) / 2;
        const range = max - min;
        const zoom = e.deltaY > 0 ? 1.2 : 0.8;
        let newRange = range * zoom;
        newRange = Math.max(7, Math.min(newRange, maxDay - minDay));
        let newMin = Math.round(center - newRange / 2);
        let newMax = Math.round(center + newRange / 2);
        newMin = Math.max(minDay, newMin);
        newMax = Math.min(maxDay, newMax);
        detailApi.set([newMin, newMax]);
    });
    // --- Chart ---
    const chartEl = document.getElementById("chart");
    const chart = new window.Chart(chartEl, {
        type: "line",
        data: { labels: [], datasets: [{ label: "Value", data: [], tension: 0.2 }] },
        options: { animation: false, responsive: true }
    });
    function updateChart(min, max) {
        const filtered = DATA.filter(x => {
            const day = toDay(x.t);
            return day >= min && day <= max;
        });
        chart.data.labels = filtered.map(x => x.t);
        chart.data.datasets[0].data = filtered.map(x => x.v);
        chart.update();
    }
}
// --- Auto-init ---
document.addEventListener("DOMContentLoaded", () => {
    initTimeSlider();
});
//# sourceMappingURL=time-slider.js.map