import { TimeFormManager } from './time-form';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('time-form-app');
    const startInput = document.getElementById('input-start') as HTMLInputElement;
    const endInput = document.getElementById('input-end') as HTMLInputElement;
    const stepSel = document.getElementById('stepUnit') as HTMLSelectElement;
    const display = document.getElementById('display-range');

    if (!app || !startInput || !endInput) return;

    // Initialisation du Manager
    const manager = new TimeFormManager(app, startInput, endInput, display, stepSel);

    // Branchement des Listeners
    document.getElementById('btn-decrement-start')?.addEventListener('click', (e) => {
        e.preventDefault();
        manager.adjust(true, false); // Start, Decrement
    });

    document.getElementById('btn-increment-end')?.addEventListener('click', (e) => {
        e.preventDefault();
        manager.adjust(false, true); // End, Increment
    });

    document.getElementById('btn-reset')?.addEventListener('click', (e) => {
        e.preventDefault();
        manager.setToDefault();
    });

    document.getElementById('btn-apply-filter')?.addEventListener('click', (e) => {
        e.preventDefault();
        manager.update();
    });

    // Lancement initial
    manager.setToDefault();
});