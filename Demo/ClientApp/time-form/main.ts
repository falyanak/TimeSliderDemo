import { TimeFormManager } from './time-form';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('time-form-app');
    const partialContainer = document.querySelector('.time-form-container') as HTMLElement;
    
    if (!app || !partialContainer) return;

    const minLimit = partialContainer.getAttribute('data-min-limit') || ""; 
    const maxLimit = app.getAttribute('data-end') || ""; 
    const range = parseInt(partialContainer.getAttribute('data-range') || "60");
    const pointsRaw = app.getAttribute('data-points') || "[]";

    let points = [];
    try { points = JSON.parse(pointsRaw); } catch (e) { console.error(e); }

    const manager = new TimeFormManager(partialContainer, minLimit, maxLimit, range, points);

    // 1. Navigation & Reset -> Mise à jour immédiate (Confort)
    partialContainer.querySelector('#btn-decrement-start')?.addEventListener('click', (e) => {
        e.preventDefault();
        manager.adjust(true, false);
    });

    partialContainer.querySelector('#btn-increment-end')?.addEventListener('click', (e) => {
        e.preventDefault();
        manager.adjust(false, true);
    });

    partialContainer.querySelector('#btn-reset')?.addEventListener('click', (e) => {
        e.preventDefault();
        manager.setToDefault();
    });

    // 2. Saisie manuelle -> Validation visuelle UNIQUEMENT (Badge/Bouton)
    partialContainer.querySelector('#input-start')?.addEventListener('change', () => manager.validate());
    partialContainer.querySelector('#input-end')?.addEventListener('change', () => manager.validate());

    // 3. Bouton Filtrer -> Mise à jour du graphique (Action)
    partialContainer.querySelector('#btn-apply-filter')?.addEventListener('click', (e) => {
        e.preventDefault();
        manager.update();
    });

    manager.setToDefault();
});