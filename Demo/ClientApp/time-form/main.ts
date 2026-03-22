import { ChartManager } from '../shared/ChartManager';

const app = document.getElementById('time-form-app')!;
const startInput = document.getElementById('input-start') as HTMLInputElement;
const endInput = document.getElementById('input-end') as HTMLInputElement;
const stepSel = document.getElementById('stepUnit') as HTMLSelectElement;
const display = document.getElementById('display-range');

const chart = new ChartManager('chart');
const minLimit = new Date(app.dataset.start || "2020-01-01");
const getToday = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };

const update = async () => {
    const fmt = (s: string) => new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    if (display) display.innerHTML = `${fmt(startInput.value)} &nbsp;-&nbsp; ${fmt(endInput.value)}`;

    const res = await fetch(`/Time/GetData?start=${startInput.value}&end=${endInput.value}`);
    chart.update(await res.json());
};

const setToDefault = (e?: Event) => {
    if (e) e.preventDefault();
    const range = parseInt(app.dataset.range || "60");
    const now = getToday();
    
    endInput.value = now.toISOString().split('T')[0];
    const start = new Date(now);
    start.setDate(start.getDate() - range);
    startInput.value = (start < minLimit ? minLimit : start).toISOString().split('T')[0];

    update();
};

const adjust = (isStart: boolean, delta: number) => {
    const input = isStart ? startInput : endInput;
    let d = new Date(input.value);
    d.setDate(d.getDate() + delta);

    if (isStart) {
        if (d < minLimit) d = minLimit;
        if (d > new Date(endInput.value)) d = new Date(endInput.value);
    } else {
        if (d > getToday()) d = getToday();
        if (d < new Date(startInput.value)) d = new Date(startInput.value);
    }

    input.value = d.toISOString().split('T')[0];
    update();
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Bouton Reculer (Début) - Vers la gauche
    document.getElementById('btn-decrement-start')?.addEventListener('click', (e) => {
        e.preventDefault();
        adjust(true, -(parseInt(stepSel.value) || 1));
    });

    // 2. Bouton Avancer (Fin) - Vers la droite
    document.getElementById('btn-increment-end')?.addEventListener('click', (e) => {
        e.preventDefault();
        adjust(false, parseInt(stepSel.value) || 1);
    });

    // 3. Reset & Apply
    document.getElementById('btn-reset')?.addEventListener('click', setToDefault);
    document.getElementById('btn-apply-filter')?.addEventListener('click', update);

    setToDefault();
});