import { TimeSliderComponent } from "./TimeSliderComponent";

document.addEventListener("DOMContentLoaded", () => {
    const appContainer = document.getElementById("time-slider-app");

    if (appContainer) {
        // 1. Extraction des données depuis les data-attributes du DOM
        const start = appContainer.dataset.start || "";
        const end = appContainer.dataset.end || "";
        const range = parseInt(appContainer.dataset.range || "60");
        const initialData = JSON.parse(appContainer.dataset.points || "[]");

        // 2. Initialisation du composant
        // Il va créer les deux sliders (Master/Detail) et le ChartManager
        const sliderApp = new TimeSliderComponent(start, end, initialData, range);
        sliderApp.init();
    }
});