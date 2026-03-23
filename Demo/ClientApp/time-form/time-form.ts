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
        
        // Sécurité : parseSafe évite que "new Date("")" ne fasse planter toISOString() plus tard
        this.minDate = this.parseSafe(this.minLimitStr);
        this.maxDate = this.parseSafe(this.maxLimitStr);
    }

    private parseSafe(s: string): Date {
        const d = new Date(s);
        // Si la date est invalide, on renvoie "aujourd'hui" pour éviter le crash
        return isNaN(d.getTime()) ? new Date() : d;
    }

    private toISO(d: Date): string {
        // Méthode ultra-sécurisée pour le format YYYY-MM-DD
        if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
        return d.toISOString().split('T')[0];
    }

    public setToDefault(): void {
        const startInput = this.container.querySelector('#input-start') as HTMLInputElement;
        const endInput = this.container.querySelector('#input-end') as HTMLInputElement;

        if (!startInput || !endInput) return;

        // Fin = Date maximale autorisée
        const dateEnd = new Date(this.maxDate.getTime());
        endInput.value = this.toISO(dateEnd);

        // Début = Fin - Range
        const dateStart = new Date(dateEnd.getTime());
        dateStart.setDate(dateStart.getDate() - this.rangeDays);
        
        // On ne descend pas sous la limite min
        const finalStart = dateStart < this.minDate ? this.minDate : dateStart;
        startInput.value = this.toISO(finalStart);

        this.update();
    }

    public update(): void {
        const startInput = this.container.querySelector('#input-start') as HTMLInputElement;
        const endInput = this.container.querySelector('#input-end') as HTMLInputElement;
        const display = document.getElementById('display-range');

        if (!startInput || !endInput) return;

        const s = startInput.value;
        const e = endInput.value;

        // Mise à jour de l'affichage texte
        if (display) {
            const fmt = (val: string) => {
                const d = new Date(val);
                return isNaN(d.getTime()) ? val : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
            };
            display.innerHTML = `${fmt(s)} &nbsp;-&nbsp; ${fmt(e)}`;
        }

        // Filtrage local
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

        // Clamp (bornage)
        if (date < this.minDate) date.setTime(this.minDate.getTime());
        if (date > this.maxDate) date.setTime(this.maxDate.getTime());

        input.value = this.toISO(date);
        this.update();
    }
}