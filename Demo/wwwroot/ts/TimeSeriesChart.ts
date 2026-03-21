import Chart from "chart.js/auto";

export class TimeSeriesChart {
    private chart: Chart;

    constructor(canvas: HTMLCanvasElement) {
        this.chart = new Chart(canvas, {
            type: "line",
            data: {
                labels: [] as string[],
                datasets: [{
                    label: "Valeur",
                    data: [] as number[],
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.1,
                    pointRadius: 0,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // OBLIGATOIRE pour respecter la hauteur du parent
                animation: false,           // Désactive les animations pour fluidifier le slider
                elements: {
                    line: { tension: 0 }    // Désactiver le lissage (Bézier) peut aussi aider les perfs
                }
            }
        });
    }

    public update(labels: string[], data: number[]): void {
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.update('none');
    }

    public destroy(): void {
        this.chart.destroy();
    }
}