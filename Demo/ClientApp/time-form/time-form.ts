import { ChartManager } from '../shared/ChartManager';

export class TimeFormManager {
    private chart: ChartManager;
    private minLimit: Date;
    private today: Date;

    constructor(
        private app: HTMLElement,
        private startInput: HTMLInputElement,
        private endInput: HTMLInputElement,
        private display: HTMLElement | null,
        private stepSel: HTMLSelectElement
    ) {
        this.chart = new ChartManager('chart');
        this.minLimit = new Date(this.app.dataset.start || "2020-01-01");
        this.today = new Date();
        this.today.setHours(0, 0, 0, 0);
    }

    public async update() {
        const fmt = (s: string) => new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
        
        if (this.display) {
            this.display.innerHTML = `${fmt(this.startInput.value)} &nbsp;-&nbsp; ${fmt(this.endInput.value)}`;
        }

        const res = await fetch(`/Time/GetData?start=${this.startInput.value}&end=${this.endInput.value}`);
        this.chart.update(await res.json());
    }

    public setToDefault() {
        const range = parseInt(this.app.dataset.range || "60");
        const now = new Date(this.today);
        
        this.endInput.value = now.toISOString().split('T')[0];
        now.setDate(now.getDate() - range);
        this.startInput.value = (now < this.minLimit ? this.minLimit : now).toISOString().split('T')[0];

        this.update();
    }

    public adjust(isStart: boolean, isIncrement: boolean) {
        const input = isStart ? this.startInput : this.endInput;
        const step = parseInt(this.stepSel.value) || 1;
        const delta = isIncrement ? step : -step;
        
        let d = new Date(input.value);
        d.setDate(d.getDate() + delta);

        if (isStart) {
            if (d < this.minLimit) d = this.minLimit;
            if (d > new Date(this.endInput.value)) d = new Date(this.endInput.value);
        } else {
            if (d > this.today) d = this.today;
            if (d < new Date(this.startInput.value)) d = new Date(this.startInput.value);
        }

        input.value = d.toISOString().split('T')[0];
        this.update();
    }
}