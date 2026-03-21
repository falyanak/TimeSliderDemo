import noUiSlider, { API } from "nouislider";
import { TimeSeriesChart } from "./TimeSeriesChart";

interface TimePoint { t: string; v: number; }

export class TimeSliderComponent {
    private readonly MS_PER_DAY = 86400000;
    private chart: TimeSeriesChart | null = null;
    private masterApi: API | null = null;
    private detailApi: API | null = null;
    
    // Pour éviter les calculs inutiles si les valeurs sont identiques
    private lastMin: number = -1;
    private lastMax: number = -1;

    constructor(
        private readonly start: string,
        private readonly end: string,
        private readonly data: TimePoint[]
    ) {}

    public init(): void {
        const masterEl = document.getElementById("masterSlider");
        const detailEl = document.getElementById("detailSlider");
        const chartEl = document.getElementById("chart") as HTMLCanvasElement;
        const outputEl = document.getElementById("output");

        if (!masterEl || !detailEl || !chartEl) return;

        // Protection contre la double initialisation
        if ((masterEl as any).noUiSlider) return;

        // --- FIX TAILLE : Assurer une hauteur stable ---
        const container = chartEl.parentElement;
        if (container) {
            container.style.height = "450px"; // Hauteur fixe pour stopper l'expansion infinie
            container.style.position = "relative";
        }

        // 1. Initialiser le graphique
        this.chart = new TimeSeriesChart(chartEl);
        console.log("Chart initialisé ✅");

        const minDay = this.toDay(this.start);
        const maxDay = this.toDay(this.end);

        // 2. Créer les Sliders
        noUiSlider.create(masterEl, {
            start: [minDay, maxDay],
            connect: true,
            range: { min: minDay, max: maxDay },
            step: 1
        });

        noUiSlider.create(detailEl, {
            start: [minDay, minDay + 30],
            connect: true,
            range: { min: minDay, max: maxDay },
            step: 1
        });

        this.masterApi = (masterEl as any).noUiSlider as API;
        this.detailApi = (detailEl as any).noUiSlider as API;

        // 3. Liaison Master -> Detail (Utilisation de 'slide' pour éviter les rafales d'updates)
        this.masterApi.on("slide", (values) => {
            const [min, max] = values.map(Number);
            // On met à jour les limites du détail sans déclencher l'event 'update' si possible
            this.detailApi?.updateOptions({ range: { min, max } }, false);
        });

        // 4. Liaison Detail -> Chart & UI
        this.detailApi.on("update", (values) => {
            const [min, max] = values.map(Number);
            const sMin = Math.round(min);
            const sMax = Math.round(max);

            // Sécurité : Ne rien faire si les valeurs n'ont pas bougé (évite boucle infinie)
            if (sMin === this.lastMin && sMax === this.lastMax) return;
            
            this.lastMin = sMin;
            this.lastMax = sMax;

            if (outputEl) {
                outputEl.innerHTML = `Période : <b>${this.fromDay(sMin).toLocaleDateString()}</b> au <b>${this.fromDay(sMax).toLocaleDateString()}</b>`;
            }

            this.syncData(sMin, sMax);
        });
    }

    private syncData(min: number, max: number): void {
        // Filtrage optimisé
        const filtered = this.data.filter(d => {
            const day = this.toDay(d.t);
            return day >= min && day <= max;
        });

        // Envoi des données au wrapper
        this.chart?.update(
            filtered.map(d => d.t),
            filtered.map(d => d.v)
        );
    }

    private toDay = (date: string | Date): number => Math.floor(new Date(date).getTime() / this.MS_PER_DAY);
    private fromDay = (day: number): Date => new Date(day * this.MS_PER_DAY);
}