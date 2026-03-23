import { ChartManager } from '../shared/ChartManager';

export class TimeFormManager {
    private chart: ChartManager;
    private readonly minDate: Date;
    private readonly maxDate: Date;

    constructor(
        private container: HTMLElement,
        private minLimitStr: string,
        private maxLimitStr: string,
        private rangeDays: number,
        private points: any[]
    ) {
        this.chart = new ChartManager('chart');
        this.minDate = this.parseSafe(this.minLimitStr);
        this.maxDate = this.parseSafe(this.maxLimitStr);
    }

    private parseSafe(s: string): Date {
        const d = new Date(s);
        return isNaN(d.getTime()) ? new Date() : d;
    }

    private toISO(d: Date): string {
        return d.toISOString().split('T')[0];
    }

    public setToDefault(): void {
        const startInput = this.container.querySelector('#input-start') as HTMLInputElement;
        const endInput = this.container.querySelector('#input-end') as HTMLInputElement;

        if (!startInput || !endInput) return;

        // Fin = Max autorisé (maxLimitStr)
        const dateEnd = new Date(this.maxDate.getTime());
        endInput.value = this.toISO(dateEnd);

        // Début = Fin - Range
        const dateStart = new Date(dateEnd.getTime());
        dateStart.setDate(dateStart.getDate() - this.rangeDays);
        
        // Sécurité borne min
        const finalStart = dateStart < this.minDate ? this.minDate : dateStart;
        startInput.value = this.toISO(finalStart);

        this.update();
    }

    public update(): void {
        const startInput = this.container.querySelector('#input-start') as HTMLInputElement;
        const endInput = this.container.querySelector('#input-end') as HTMLInputElement;
        const display = document.getElementById('display-range'); // ID dans la vue parente

        if (!startInput || !endInput) return;

        const s = startInput.value;
        const e = endInput.value;

        if (display) {
            const fmt = (val: string) => new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
            display.innerHTML = `${fmt(s)} &nbsp;-&nbsp; ${fmt(e)}`;
        }

        const filtered = this.points.filter((p: any) => p.t >= s && p.t <= e);
        this.chart.update(filtered);
    }

    public adjust(isStart: boolean, isIncrement: boolean): void {
        const input = this.container.querySelector(isStart ? '#input-start' : '#input-end') as HTMLInputElement;
        const stepSel = this.container.querySelector('#stepUnit') as HTMLSelectElement;
        
        if (!input) return;

        const step = parseInt(stepSel?.value || "1");
        const date = new Date(input.value);
        if (isNaN(date.getTime())) return;

        date.setDate(date.getDate() + (isIncrement ? step : -step));

        // Clamp
        if (date < this.minDate) date.setTime(this.minDate.getTime());
        if (date > this.maxDate) date.setTime(this.maxDate.getTime());

        input.value = this.toISO(date);
        this.update();
    }
}