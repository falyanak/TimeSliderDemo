import { TimeFormManager } from './time-form';

document.addEventListener('DOMContentLoaded', () => {
    // 1. On cible le conteneur racine (qui porte les data-points)
    const app = document.getElementById('time-form-app');
    // 2. On cible le conteneur de la partielle (qui porte data-min-limit)
    const partialContainer = document.querySelector('.time-form-container') as HTMLElement;
    
    if (!app || !partialContainer) return;

    // Extraction rigoureuse des attributs
    const minLimit = partialContainer.getAttribute('data-min-limit') || ""; 
    const maxLimit = app.getAttribute('data-end') || ""; 
    const range = parseInt(partialContainer.getAttribute('data-range') || "60");
    const pointsRaw = app.getAttribute('data-points') || "[]";

    let points = [];
    try {
        points = JSON.parse(pointsRaw);
    } catch (e) {
        console.error("Erreur lors du parse des points JSON", e);
    }

    // Debug Console pour vérifier que rien n'est "undefined"
    console.log("Configuration extraite :", { minLimit, maxLimit, range, pointsCount: points.length });

    // Initialisation
    const manager = new TimeFormManager(partialContainer, minLimit, maxLimit, range, points);

    // Branchement des événements (Scoped à partialContainer)
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

    partialContainer.querySelector('#btn-apply-filter')?.addEventListener('click', (e) => {
        e.preventDefault();
        manager.update();
    });

    // Lancement initial
    manager.setToDefault();
});