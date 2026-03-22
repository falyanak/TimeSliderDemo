// Récupération des éléments
const btnDecStart = document.getElementById('btn-decrement-start') as HTMLButtonElement;
const stepUnit = document.getElementById('stepUnit') as HTMLSelectElement;
const inputStart = document.getElementById('input-start') as HTMLInputElement;
const inputEnd = document.getElementById('input-end') as HTMLInputElement;
const appContainer = document.getElementById('time-slider-app');
const displayRange = document.getElementById('display-range');

// Borne inférieure globale (extraite du data-attribute au chargement)
const GLOBAL_MIN_DATE = appContainer?.getAttribute('data-start') 
    ? new Date(appContainer.getAttribute('data-start')!) 
    : null;

const syncAccordionTitle = (start: string, end: string) => {
    if (displayRange) {
        displayRange.innerText = `${start} - ${end}`;
    }
};

/**
 * Reculer : Diminue la date de début AVEC contrôle de borne
 */
btnDecStart?.addEventListener('click', () => {
    const daysToSubtract = parseInt(stepUnit.value);
    const currentStart = new Date(inputStart.value);
    
    // Calcul de la nouvelle date
    currentStart.setDate(currentStart.getDate() - daysToSubtract);
    
    // CONTRÔLE DE BORNE INFÉRIEURE
    if (GLOBAL_MIN_DATE && currentStart < GLOBAL_MIN_DATE) {
        console.warn("Limite historique atteinte");
        currentStart.setTime(GLOBAL_MIN_DATE.getTime());
        // Optionnel : on peut flasher le bouton en rouge ou désactiver
    }

    const newStartStr = currentStart.toISOString().split('T')[0];
    inputStart.value = newStartStr;
    syncAccordionTitle(newStartStr, inputEnd.value);
});