import noUiSlider, { API } from "nouislider";
import { TimeSeriesChart } from "./TimeSeriesChart";

interface TimePoint { t: string; v: number; }

export class TimeSliderComponent {
    private readonly MS_PER_DAY = 86400000;
    private chart: TimeSeriesChart | null = null;
    private masterApi: API | null = null;
    private detailApi: API | null = null;
    
    // VERROU : Empêche Chart.js de boucler à l'infini
    private lastMin: number = -1;
    private lastMax: number = -1;

    constructor(
        private readonly start: string,
        private readonly end: string,
        private readonly data: TimePoint[]
    ) {}

    /**
     * Le formateur interne : C'est ici que l'année a été ajoutée.
     */
    private readonly dateFormatter = {
        to: (value: number): string => {
            const date = new Date(Math.round(value) * this.MS_PER_DAY);
            return date.toLocaleDateString(undefined, { 
                day: '2-digit', 
                month: 'short',
                year: 'numeric' // <--- L'ANNÉE EST ICI MAINTENANT
            });
        },
        // Nécessaire pour que noUiSlider comprenne comment lire la valeur si besoin
        from: (value: string): number => {
            return new Date(value).getTime() / this.MS_PER_DAY;
        }
    };

    public init(): void {
        const masterEl = document.getElementById("masterSlider");
        const detailEl = document.getElementById("detailSlider");
        const chartEl = document.getElementById("chart") as HTMLCanvasElement;

        if (!masterEl || !detailEl || !chartEl) return;
        if ((masterEl as any).noUiSlider) return; 

        // FIX HAUTEUR : On verrouille le parent du graphique
        const container = chartEl.parentElement;
        if (container) {
            container.style.height = "450px"; 
            container.style.position = "relative";
        }

        this.chart = new TimeSeriesChart(chartEl);

        const minDay = this.toDay(this.start);
        const maxDay = this.toDay(this.end);

        // Configuration avec les 2 tooltips activés
        const sliderConfig = {
            step: 1,
            connect: true,
            tooltips: [this.dateFormatter, this.dateFormatter], // Applique le formateur aux 4 bulles
            range: { min: minDay, max: maxDay }
        };

        noUiSlider.create(masterEl, { ...sliderConfig, start: [minDay, maxDay] });
        noUiSlider.create(detailEl, { ...sliderConfig, start: [minDay, minDay + 30] });

        this.masterApi = (masterEl as any).noUiSlider as API;
        this.detailApi = (detailEl as any).noUiSlider as API;

        // Liaison fluide Master -> Detail
        this.masterApi.on("slide", (values) => {
            const [min, max] = values.map(Number);
            this.detailApi?.updateOptions({ range: { min, max } }, false);
        });

        // Liaison Detail -> Chart avec VERROU
        this.detailApi.on("update", (values) => {
            const [min, max] = values.map(Number);
            const sMin = Math.round(min);
            const sMax = Math.round(max);

            if (sMin === this.lastMin && sMax === this.lastMax) return;
            
            this.lastMin = sMin;
            this.lastMax = sMax;

            this.syncData(sMin, sMax);
        });
    }

    private syncData(min: number, max: number): void {
        const filtered = this.data.filter(d => {
            const day = this.toDay(d.t);
            return day >= min && day <= max;
        });

        this.chart?.update(
            filtered.map(d => d.t),
            filtered.map(d => d.v)
        );
    }

    private toDay = (date: string | Date): number => Math.floor(new Date(date).getTime() / this.MS_PER_DAY);
}