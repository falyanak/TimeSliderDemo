import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// ... imports ...

export class ChartManager {
    private chart: Chart | null = null;

    constructor(private canvasId: string) {}

    public update(data: any[]) {
        const ctx = document.getElementById(this.canvasId) as HTMLCanvasElement;
        if (!ctx || !data) return;

        // DEBUG : Vérifie le format dans la console F12
        console.log("Données reçues par le manager :", data[0]); 

        // ADAPTATION AUX CLÉS C# (t et v)
        const labels = data.map(d => d.t); // t = "yyyy-MM-dd"
        const values = data.map(d => d.v); // v = nombre

        if (this.chart) {
            this.chart.data.labels = labels;
            this.chart.data.datasets[0].data = values;
            this.chart.update();
        } else {
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Analyse',
                        data: values,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 0 // Évite de surcharger si 1800 points
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { display: true },
                        y: { beginAtZero: false } // Mieux pour des variations boursières/temporelles
                    }
                }
            });
        }
        
        const loader = document.getElementById('app-loader');
        if (loader) loader.style.display = 'none';
    }
}