import noUiSlider, { API } from "nouislider";
import { ChartManager } from "../shared/ChartManager";

interface TimePoint { t: string; v: number; }

export class TimeSliderComponent {
    private readonly MS_PER_DAY = 86400000;
    private chartManager: ChartManager | null = null;
    private masterApi: API | null = null;
    private detailApi: API | null = null;
    private lastMin: number = -1;
    private lastMax: number = -1;

    constructor(
        private readonly start: string,
        private readonly end: string,
        private readonly data: TimePoint[],
        private readonly range: number
    ) { }

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

        // Master pilote le Range du Detail
        this.masterApi.on("slide", (vals) => {
            const mMax = Math.round(Number(vals[1]));
            const mMin = Math.round(Number(vals[0]));
            this.detailApi?.updateOptions({ range: { min: mMin, max: mMax } }, false);
            this.detailApi?.set([Math.max(mMin, mMax - this.range), mMax]);
        });

        // Detail pilote les données et l'affichage
        this.detailApi.on("update", (vals) => {
            const sMin = Math.round(Number(vals[0]));
            const sMax = Math.round(Number(vals[1]));
            if (sMin === this.lastMin && sMax === this.lastMax) return;
            this.lastMin = sMin; 
            this.lastMax = sMax;
            this.syncUI(sMin, sMax);
        });

        this.bindReset();
    }

/**
     * Réinitialise les sliders selon la logique du formulaire (End - Range)
     */
    private bindReset(): void {
        const resetBtn = document.getElementById('btn-reset-slider');
        if (!resetBtn) return;

        resetBtn.addEventListener('click', () => {
            // 1. Bornes absolues autorisées (définies à l'init)
            const minLimitDay = this.toDay(this.start);
            const maxLimitDay = this.toDay(this.end);

            // 2. Calcul de la sélection par défaut (Date de fin - Range)
            // On reproduit exactement : now.setDate(now.getDate() - range)
            const defaultStartDay = maxLimitDay - this.range;
            
            // On applique la sécurité : (now < this.minLimit ? this.minLimit : now)
            const finalStartDay = defaultStartDay < minLimitDay ? minLimitDay : defaultStartDay;

            // 3. Application au Master (Vue Totale)
            if (this.masterApi) {
                this.masterApi.set([minLimitDay, maxLimitDay]);
            }

            // 4. Application au Detail (Vue Fenêtrée)
            if (this.detailApi) {
                // On restaure d'abord le range complet pour permettre le positionnement
                this.detailApi.updateOptions({
                    range: { min: minLimitDay, max: maxLimitDay }
                }, false);
                
                // On positionne les poignées sur la période calculée
                this.detailApi.set([finalStartDay, maxLimitDay]);
            }
        });
    }

    private syncUI(min: number, max: number): void {
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

        const filtered = this.data.filter(p => p.t >= startDate && p.t <= endDate);
        if (this.chartManager) {
            this.chartManager.update(filtered);
        }
    }

    private toDay = (d: string): number => Math.floor(new Date(d).getTime() / this.MS_PER_DAY);
}