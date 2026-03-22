import noUiSlider from 'nouislider';

const masterSlider = document.getElementById('masterSlider') as any;
const detailSlider = document.getElementById('detailSlider') as any;
const displayRange = document.getElementById('display-range');

if (masterSlider && detailSlider) {
    // Initialisation noUiSlider (simplifiée pour l'exemple)
    noUiSlider.create(masterSlider, {
        start: [20, 80],
        connect: true,
        range: { 'min': 0, 'max': 100 }
    });

    // Mise à jour du libellé de l'accordéon lors de la manipulation
    masterSlider.noUiSlider.on('update', (values: string[]) => {
        if (displayRange) {
            displayRange.innerText = `Sélection : ${values[0]} - ${values[1]}`;
        }
    });
}