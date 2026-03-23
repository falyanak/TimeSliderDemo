import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export class ChartManager {
    private chart: any = null;
    private loader: HTMLElement | null;

    constructor(private canvasId: string) {
        this.loader = document.getElementById('app-loader');
    }

    public update(data: any[]): void {
        if (this.loader) this.loader.style.display = 'flex';

        const labels = data.map(p => p.t);
        const values = data.map(p => p.v);

        if (!this.chart) {
            const ctx = document.getElementById(this.canvasId) as HTMLCanvasElement;
            if (!ctx) return;
            this.chart = new Chart(ctx, {
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
        } else {
            this.chart.data.labels = labels;
            this.chart.data.datasets[0].data = values;
            this.chart.update('none');
        }

        setTimeout(() => { if (this.loader) this.loader.style.display = 'none'; }, 150);
    }
}