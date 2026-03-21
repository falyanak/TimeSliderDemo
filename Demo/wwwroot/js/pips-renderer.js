"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPips = renderPips;
const time_utils_1 = require("./time-utils");
function renderPips(container, ticks, min, max) {
    // Supprime anciens pips
    container.querySelectorAll(".custom-pip").forEach(e => e.remove());
    const span = max - min;
    ticks.forEach(day => {
        const percent = (0, time_utils_1.dayToPercent)(day, min, max);
        const pip = document.createElement("div");
        pip.className = "custom-pip";
        pip.style.left = percent + "%";
        const label = document.createElement("div");
        label.className = "custom-pip-label";
        label.innerText = (0, time_utils_1.formatTick)(day, span);
        pip.appendChild(label);
        container.appendChild(pip);
    });
}
//# sourceMappingURL=pips-renderer.js.map