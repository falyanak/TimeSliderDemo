import { TimeSliderComponent } from "./TimeSliderComponent";

document.addEventListener("DOMContentLoaded", () => {
    const appContainer = document.getElementById("time-slider-app");
    const btnFilter = document.getElementById("btn-apply-filter");

    if (appContainer) {
        const start = appContainer.dataset.start || "";
        const end = appContainer.dataset.end || "";
        const range = parseInt(appContainer.dataset.range || "60");
        const data = JSON.parse(appContainer.dataset.points || "[]");

        const sliderApp = new TimeSliderComponent(start, end, data, range);
        sliderApp.init();

        // Gestion du clic en TypeScript
        btnFilter?.addEventListener("click", () => {
            const s = (document.getElementById("filter-start") as HTMLInputElement).value;
            const e = (document.getElementById("filter-end") as HTMLInputElement).value;
            window.location.href = `/Time/GetFilter?startDate=${s}&endDate=${e}`;
        });
    }
});