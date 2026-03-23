import { ChartManager } from '../shared/ChartManager';
import { LoaderManager } from '../shared/LoaderManager';

export class TimeFormManager {
    private chart: ChartManager;
    private readonly minDate: Date;
    private readonly maxDate: Date;
    private errorTimeout: number | null = null;
    
    // Accès au Singleton global
    private loader = LoaderManager.getInstance();

    constructor(
        private container: HTMLElement,
        private minLimitStr: string,
        private maxLimitStr: string,
        private rangeDays: number,
        private points: any[]
    ) {
        this.chart = new ChartManager('chart');
        this.minDate = this.parseInputDate(this.minLimitStr);
        this.maxDate = this.parseInputDate(this.maxLimitStr);
    }

    /**
     * Applique réellement le filtre et met à jour le graphique avec Loader
     */
    public update(): void {
        if (!this.validate()) return;

        // 1. Afficher le loader global
        this.loader.show();

        // 2. Utiliser un micro-délai pour laisser le DOM respirer et afficher le spinner
        setTimeout(() => {
            const startInput = this.container.querySelector('#input-start') as HTMLInputElement;
            const endInput = this.container.querySelector('#input-end') as HTMLInputElement;
            const display = document.getElementById('display-range');

            const s = startInput.value;
            const e = endInput.value;

            // Mise à jour du libellé de période
            if (display) {
                const fmt = (val: string) => {
                    const d = new Date(val);
                    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
                };
                display.innerHTML = `${fmt(s)} &nbsp;-&nbsp; ${fmt(e)}`;
            }

            // Filtrage et mise à jour du graphique
            const filtered = this.points.filter((p: any) => p.t >= s && p.t <= e);
            this.chart.update(filtered);

            // 3. Cacher le loader une fois le rendu terminé
            this.loader.hide();
        }, 50);
    }

    public setToDefault(): void {
        const startInput = this.container.querySelector('#input-start') as HTMLInputElement;
        const endInput = this.container.querySelector('#input-end') as HTMLInputElement;

        if (!startInput || !endInput) return;

        const dateEnd = new Date(this.maxDate.getTime());
        const dateStart = new Date(dateEnd.getTime());
        dateStart.setDate(dateStart.getDate() - this.rangeDays);

        const finalStart = dateStart < this.minDate ? this.minDate : dateStart;

        endInput.value = this.toISO(dateEnd);
        startInput.value = this.toISO(finalStart);

        // Appel update() qui gère déjà le loader
        this.update();
    }

    public adjust(isStart: boolean, isIncrement: boolean): void {
        const input = this.container.querySelector(isStart ? '#input-start' : '#input-end') as HTMLInputElement;
        const stepSel = this.container.querySelector('#stepUnit') as HTMLSelectElement;

        if (!input || !input.value) return;

        const step = parseInt(stepSel?.value || "1");
        const date = new Date(input.value);
        if (isNaN(date.getTime())) return;

        date.setDate(date.getDate() + (isIncrement ? step : -step));

        if (date < this.minDate) date.setTime(this.minDate.getTime());
        if (date > this.maxDate) date.setTime(this.maxDate.getTime());

        input.value = this.toISO(date);
        
        // Mise à jour directe (déclenche le loader via update)
        this.update();
    }

    // --- MÉTHODES PRIVÉES DE VALIDATION ET FORMATAGE (Simplifiées) ---

    public validate(): boolean {
        const startInput = this.container.querySelector('#input-start') as HTMLInputElement;
        const endInput = this.container.querySelector('#input-end') as HTMLInputElement;
        const applyBtn = this.container.querySelector('#btn-apply-filter') as HTMLButtonElement;

        if (!startInput || !endInput) return false;

        const isInvalid = startInput.value > endInput.value;
        this.toggleErrorBadge(isInvalid);

        if (applyBtn) applyBtn.disabled = isInvalid;
        return !isInvalid;
    }

    private parseInputDate(s: string): Date {
        if (!s) return new Date();
        if (s.includes('/')) {
            const parts = s.split('/');
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        const d = new Date(s);
        return isNaN(d.getTime()) ? new Date() : d;
    }

    private toISO(d: Date): string {
        try {
            return d.toISOString().split('T')[0];
        } catch {
            return new Date().toISOString().split('T')[0];
        }
    }

    private toggleErrorBadge(show: boolean): void {
        let badge = this.container.querySelector('#date-error-badge') as HTMLElement;

        if (this.errorTimeout) {
            window.clearTimeout(this.errorTimeout);
            this.errorTimeout = null;
        }

        if (show) {
            if (!badge) {
                badge = document.createElement('span');
                badge.id = 'date-error-badge';
                badge.className = 'badge bg-danger mt-2 d-table mx-auto fw-bold shadow-sm';
                badge.style.padding = '8px 12px';
                badge.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-1"></i> La date de fin ne peut être inférieure à la date début !';

                const grid = this.container.querySelector('.time-inputs-grid');
                grid?.parentNode?.insertBefore(badge, grid.nextSibling);
            }
            badge.style.display = 'table';
            this.errorTimeout = window.setTimeout(() => {
                if (badge) badge.style.display = 'none';
            }, 3000);
        } else if (badge) {
            badge.style.setProperty('display', 'none', 'important');
        }
    }
}