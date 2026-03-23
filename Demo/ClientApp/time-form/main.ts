import { TimeFormManager } from './time-form';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('time-form-app'); // Le conteneur racine de la page
    const partialContainer = document.querySelector('.time-form-container') as HTMLElement;
    
    if (!app || !partialContainer) return;

    // 1. Extraction des attributs (Noms exacts de ta vue partielle et du parent)
    const minLimit = partialContainer.getAttribute('data-min-limit') || ""; 
    const maxLimit = app.getAttribute('data-end') || ""; // On prend la fin max autorisée sur le parent
    const range = parseInt(partialContainer.getAttribute('data-range') || "60");
    const points = JSON.parse(app.getAttribute('data-points') || "[]");

    // Debug pour vérifier les formats reçus
    console.log("Init Form:", { minLimit, maxLimit, range });

    // 2. Initialisation du Manager
    const manager = new TimeFormManager(partialContainer, minLimit, maxLimit, range, points);

    // 3. Branchement des événements
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

    // 4. Lancement initial
    manager.setToDefault();
});