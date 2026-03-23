import noUiSlider, { API } from "nouislider";
import { ChartManager } from "../shared/ChartManager";
import { LoaderManager } from '../shared/LoaderManager';

interface TimePoint { t: string; v: number; }

export class TimeSliderComponent {
    private readonly MS_PER_DAY = 86400000;
    private chartManager: ChartManager | null = null;
    private masterApi: API | null = null;
    private detailApi: API | null = null;
    private lastMin: number = -1;
    private lastMax: number = -1;
    
    private debounceTimer: number | null = null;
    private loader = LoaderManager.getInstance();

    constructor(
        private readonly start: string,
        private readonly end: string,
        private readonly data: TimePoint[],
        private readonly range: number
    ) { }

    /**
     * Formateur pour les tooltips du slider
     */
    private readonly dateFormatter = {
        to: (value: number): string => {
            const d = new Date(Math.round(value) * this.MS_PER_DAY);
            if (window.innerWidth < 600) {
                return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
            }
            return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
        },
        from: (value: string): number => new Date(value).getTime() / this.MS_PER_DAY
    };

    /**
     * Formate une date ISO en format lisible (ex: 25 oct. 2023)
     */
    private formatDateFriendly(dateStr: string): string {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    public init(): void {
        const masterEl = document.getElementById("masterSlider");
        const detailEl = document.getElementById("detailSlider");
        
        if (!masterEl || !detailEl || (masterEl as any).noUiSlider) return;

        this.chartManager = new ChartManager('chart');

        const minDay = this.toDay(this.start);
        const maxDay = this.toDay(this.end);
        const detailStart = Math.max(minDay, maxDay - this.range);

        const config = {
            step: 1, 
            connect: true,
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
            
            this.lastMin = sMin; 
            this.lastMax = sMax;

            // Mise à jour visuelle immédiate des dates
            this.updateTextInputs(sMin, sMax);

            // Mise à jour différée du graphique avec loader
            this.debouncedSync(sMin, sMax);
        });

        this.bindReset();
    }

    /**
     * Gère l'affichage du loader et la mise à jour du graphique
     */
    private debouncedSync(min: number, max: number): void {
        if (this.debounceTimer) window.clearTimeout(this.debounceTimer);

        this.debounceTimer = window.setTimeout(() => {
            this.loader.show();
            
            // On laisse 50ms pour que le navigateur affiche le loader
            setTimeout(() => {
                this.syncChart(min, max);
                this.loader.hide();
            }, 50);
            
        }, 250); 
    }

    /**
     * Met à jour les inputs et le label de plage de dates (Instantané)
     */
    private updateTextInputs(min: number, max: number): void {
        const startDate = new Date(min * this.MS_PER_DAY).toISOString().split('T')[0];
        const endDate = new Date(max * this.MS_PER_DAY).toISOString().split('T')[0];

        const inputS = document.getElementById("filter-start") as HTMLInputElement;
        const inputE = document.getElementById("filter-end") as HTMLInputElement;
        
        if (inputS) inputS.value = startDate;
        if (inputE) inputE.value = endDate;

        const displayRange = document.getElementById('display-range');
        if (displayRange) {
            displayRange.innerHTML = `${this.formatDateFriendly(startDate)} &nbsp;-&nbsp; ${this.formatDateFriendly(endDate)}`;
        }
    }

    /**
     * Filtre les données et met à jour le ChartManager (Lourd)
     */
    private syncChart(min: number, max: number): void {
        const startDate = new Date(min * this.MS_PER_DAY).toISOString().split('T')[0];
        const endDate = new Date(max * this.MS_PER_DAY).toISOString().split('T')[0];

        const filtered = this.data.filter(p => p.t >= startDate && p.t <= endDate);
        if (this.chartManager) {
            this.chartManager.update(filtered);
        }
    }

    private bindReset(): void {
        const resetBtn = document.getElementById('btn-reset-slider');
        if (!resetBtn) return;

        resetBtn.addEventListener('click', () => {
            this.loader.show();
            
            const minLimitDay = this.toDay(this.start);
            const maxLimitDay = this.toDay(this.end);
            const finalStartDay = Math.max(minLimitDay, maxLimitDay - this.range);

            if (this.masterApi) this.masterApi.set([minLimitDay, maxLimitDay]);
            if (this.detailApi) {
                this.detailApi.updateOptions({ range: { min: minLimitDay, max: maxLimitDay } }, false);
                this.detailApi.set([finalStartDay, maxLimitDay]);
            }

            setTimeout(() => this.loader.hide(), 300);
        });
    }

    private toDay = (d: string): number => Math.floor(new Date(d).getTime() / this.MS_PER_DAY);
}