import noUiSlider, { API } from "nouislider";
import { TimeSeriesChart } from "./TimeSeriesChart";

interface TimePoint { t: string; v: number; }

export class TimeSliderComponent {
    private readonly MS_PER_DAY = 86400000;
    private chart: TimeSeriesChart | null = null;
    private masterApi: API | null = null;
    private detailApi: API | null = null;
    private lastMin: number = -1;
    private lastMax: number = -1;

    constructor(
        private readonly start: string,
        private readonly end: string,
        private readonly data: TimePoint[],
        private readonly range: number
    ) {}

    private readonly dateFormatter = {
        to: (value: number): string => {
            const d = new Date(Math.round(value) * this.MS_PER_DAY);
            return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
        },
        from: (value: string): number => new Date(value).getTime() / this.MS_PER_DAY
    };

    public init(): void {
        const masterEl = document.getElementById("masterSlider");
        const detailEl = document.getElementById("detailSlider");
        const chartEl = document.getElementById("chart") as HTMLCanvasElement;

        if (!masterEl || !detailEl || !chartEl || (masterEl as any).noUiSlider) return;

        this.chart = new TimeSeriesChart(chartEl);
        const minDay = this.toDay(this.start);
        const maxDay = this.toDay(this.end);
        const detailStart = Math.max(minDay, maxDay - this.range);

        const config = {
            step: 1, connect: true,
            tooltips: [this.dateFormatter, this.dateFormatter],
            range: { min: minDay, max: maxDay }
        };

        noUiSlider.create(masterEl, { ...config, start: [minDay, maxDay] });
        noUiSlider.create(detailEl, { ...config, start: [detailStart, maxDay] });

        this.masterApi = (masterEl as any).noUiSlider as API;
        this.detailApi = (detailEl as any).noUiSlider as API;

        this.masterApi.on("slide", (vals) => {
            const mMax = Math.round(Number(vals[1]));
            const mMin = Math.round(Number(vals[0]));
            this.detailApi?.updateOptions({ range: { min: mMin, max: mMax } }, false);
            this.detailApi?.set([Math.max(mMin, mMax - this.range), mMax]);
        });

        this.detailApi.on("update", (vals) => {
            const sMin = Math.round(Number(vals[0]));
            const sMax = Math.round(Number(vals[1]));
            if (sMin === this.lastMin && sMax === this.lastMax) return;
            this.lastMin = sMin; this.lastMax = sMax;
            this.syncData(sMin, sMax);
        });
    }

    private syncData(min: number, max: number): void {
        const startDate = new Date(min * this.MS_PER_DAY).toISOString().split('T')[0];
        const endDate = new Date(max * this.MS_PER_DAY).toISOString().split('T')[0];

        // Mémorisation dans les champs hidden
        const inputS = document.getElementById("filter-start") as HTMLInputElement;
        const inputE = document.getElementById("filter-end") as HTMLInputElement;
        if (inputS) inputS.value = startDate;
        if (inputE) inputE.value = endDate;

        const outputEl = document.getElementById("output");
        if (outputEl) outputEl.innerHTML = `Sélection : <b>${startDate}</b> au <b>${endDate}</b>`;

        const filtered = this.data.filter(p => p.t >= startDate && p.t <= endDate);
        this.chart?.update(filtered.map(d => d.t), filtered.map(d => d.v));
    }

    private toDay = (d: string): number => Math.floor(new Date(d).getTime() / this.MS_PER_DAY);
}