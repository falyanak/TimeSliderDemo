import noUiSlider, { API } from "nouislider";
import Chart from "chart.js/auto";

interface TimePoint {
    t: string;
    v: number;
}

// Variables globales (injectées par Razor)
declare const START: string;
declare const END: string;
declare const DATA: TimePoint[];

const MS_PER_DAY = 86400000;
const toDay = (date: string | Date): number => Math.floor(new Date(date).getTime() / MS_PER_DAY);
const fromDay = (day: number): Date => new Date(day * MS_PER_DAY);

// On utilise un nom unique pour éviter les conflits de portée
let globalChartInstance: Chart | null = null;

export function initTimeSlider(): void {
    const chartEl = document.getElementById("chart") as HTMLCanvasElement;
    const masterEl = document.getElementById("masterSlider") as HTMLElement;
    const detailEl = document.getElementById("detailSlider") as HTMLElement;
    const outputEl = document.getElementById("output")!;

    if (!chartEl || !masterEl || !detailEl) return;

    // 1. SÉCURITÉ : Éviter l'erreur "Slider was already initialized"
    if ((masterEl as any).noUiSlider) {
        console.warn("Sliders déjà initialisés, arrêt.");
        return;
    }

    // 2. INITIALISER LE GRAPHIQUE EN PREMIER 
    // Obligatoire pour que syncChart ne trouve pas 'null' au premier rendu du slider
    globalChartInstance = new Chart(chartEl, {
        type: "line",
        data: {
            labels: [] as string[],
            datasets: [{
                label: "Valeur",
                data: [] as number[],
                borderColor: "#3b82f6",
                tension: 0.1,
                pointRadius: 0,
                fill: true,
                backgroundColor: "rgba(59, 130, 246, 0.1)"
            }]
        },
        options: {
            animation: false, // Performance : indispensable pour le slider
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // 3. FONCTION DE MISE À JOUR
    const syncChart = (min: number, max: number) => {
        if (!globalChartInstance) return;
        
        const filtered = DATA.filter(d => {
            const dDay = toDay(d.t);
            return dDay >= min && dDay <= max;
        });

        globalChartInstance.data.labels = filtered.map(d => d.t);
        globalChartInstance.data.datasets[0].data = filtered.map(d => d.v);
        globalChartInstance.update('none'); 
    };

    const minDay = toDay(START);
    const maxDay = toDay(END);

    // 4. CRÉER LES SLIDERS (déclenchent immédiatement un event 'update')
    noUiSlider.create(masterEl, {
        start: [minDay, maxDay],
        connect: true,
        range: { min: minDay, max: maxDay }
    });

    noUiSlider.create(detailEl, {
        start: [minDay, minDay + 30],
        connect: true,
        range: { min: minDay, max: maxDay }
    });

    // 5. RÉCUPÉRER LES API (Cast explicite)
    const masterApi = (masterEl as any).noUiSlider as API;
    const detailApi = (detailEl as any).noUiSlider as API;

    // 6. ÉVÉNEMENTS
    masterApi.on("update", (values) => {
        const [min, max] = values.map(Number);
        detailApi.updateOptions({ range: { min, max } }, false);
    });

    detailApi.on("update", (values) => {
        const [min, max] = values.map(Number);
        const sMin = Math.round(min);
        const sMax = Math.round(max);
        
        if (outputEl) {
            outputEl.innerHTML = `Du <b>${fromDay(sMin).toLocaleDateString()}</b> au <b>${fromDay(sMax).toLocaleDateString()}</b>`;
        }
        
        syncChart(sMin, sMax);
    });
}