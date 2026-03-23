import { Chart, registerables } from 'chart.js';
import { LoaderManager } from './LoaderManager';

Chart.register(...registerables);

export class ChartManager {
    private chart: Chart | null = null;

    private loader = LoaderManager.getInstance();

    constructor(private canvasId: string) {
        // On récupère le loader une seule fois au constructeur
      
    }


    /**
 * Met à jour le graphique avec un délai simulé pour tester le loader
 * @param data Tableau d'objets { t: string, v: number }
 */
    public update(data: any[]): void {
        if (!this.loader) return;

        // 1. Affichage immédiat du loader global
       this.loader.show();

        const labels = data.map(p => p.t);
        const values = data.map(p => p.v);

        if (!this.chart) {
            this.createChart(labels, values);
        } else {
            this.chart.data.labels = labels;
            this.chart.data.datasets[0].data = values;
            this.chart.update('none'); // Mise à jour rapide
        }

        this.loader.hide();

    }

    private createChart(labels: string[], values: number[]): void {
        const canvas = document.getElementById(this.canvasId) as HTMLCanvasElement;
        if (!canvas) return;

        this.chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.05)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } },
                    y: { beginAtZero: true }
                }
            }
        });
    }
    /**
     * Permet de détruire le graphique proprement si nécessaire (changement de page/vue)
     */
    public destroy(): void {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}