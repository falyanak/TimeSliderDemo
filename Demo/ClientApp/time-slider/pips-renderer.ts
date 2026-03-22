import { dayToPercent, formatTick } from "./time-utils";

export function renderPips(
    container: HTMLElement,
    ticks: number[],
    min: number,
    max: number
) {
    // Supprime anciens pips
    container.querySelectorAll(".custom-pip").forEach(e => e.remove());

    const span = max - min;

    ticks.forEach(day => {
        const percent = dayToPercent(day, min, max);

        const pip = document.createElement("div");
        pip.className = "custom-pip";
        pip.style.left = percent + "%";

        const label = document.createElement("div");
        label.className = "custom-pip-label";
        label.innerText = formatTick(day, span);

        pip.appendChild(label);
        container.appendChild(pip);
    });
}