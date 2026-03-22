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

    /**
     * Formatteur pour les tooltips noUiSlider
     */
   private readonly dateFormatter = {
        to: (value: number): string => {
            const d = new Date(Math.round(value) * this.MS_PER_DAY);
            
            // Format adapté selon la largeur de l'écran
            if (window.innerWidth < 600) {
                // Format compact : 22/03/26
                return d.toLocaleDateString('fr-FR', { 
                    day: '2-digit', 
                    month: '2-digit',
                    year: '2-digit' 
                });
            }
            
            // Format complet : 22 mars 2026
            return d.toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: 'short',
                year: 'numeric' 
            });
        },
        from: (value: string): number => new Date(value).getTime() / this.MS_PER_DAY
    };

    /**
     * Formatteur pour l'affichage textuel (Accordéon)
     */
    private formatDateFriendly(dateStr: string): string {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    public init(): void {
        const masterEl = document.getElementById("masterSlider");
        const detailEl = document.getElementById("detailSlider");
        
        if (!masterEl || !detailEl || (masterEl as any).noUiSlider) return;

        // On utilise le manager partagé
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
            // On s'assure que le détail reste dans les clous
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
    }

    private syncUI(min: number, max: number): void {
        const startDate = new Date(min * this.MS_PER_DAY).toISOString().split('T')[0];
        const endDate = new Date(max * this.MS_PER_DAY).toISOString().split('T')[0];

        // 1. Mise à jour des inputs cachés (pour compatibilité boutons/forms)
        const inputS = document.getElementById("filter-start") as HTMLInputElement;
        const inputE = document.getElementById("filter-end") as HTMLInputElement;
        if (inputS) inputS.value = startDate;
        if (inputE) inputE.value = endDate;

        // 2. SYNCHRONISATION DE L'ACCORDÉON
        const displayRange = document.getElementById('display-range');
        if (displayRange) {
            displayRange.innerHTML = `${this.formatDateFriendly(startDate)} &nbsp;-&nbsp; ${this.formatDateFriendly(endDate)}`;
        }

        // 3. FILTRAGE ET MISE À JOUR DU GRAPHIQUE
        // Note: Ici on filtre localement les data initiales injectées
        const filtered = this.data.filter(p => p.t >= startDate && p.t <= endDate);
        
        if (this.chartManager) {
            this.chartManager.update(filtered);
        }
    }

    private toDay = (d: string): number => Math.floor(new Date(d).getTime() / this.MS_PER_DAY);
}