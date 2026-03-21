import { initTimeSlider } from "./time-slider";

// Point d'entrée unique
document.addEventListener("DOMContentLoaded", () => {
    try {
        initTimeSlider();
        console.log("TimeSlider initialized ✅");
    } catch (err) {
        console.error("Failed to initialize TimeSlider:", err);
    }
});