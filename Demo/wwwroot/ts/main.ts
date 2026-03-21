import { TimeSliderComponent } from "./TimeSliderComponent";

// On déclare les variables Razor une seule fois ici
declare const START: string;
declare const END: string;
declare const DATA: any[];

document.addEventListener("DOMContentLoaded", () => {
    const sliderComponent = new TimeSliderComponent(START, END, DATA);
    
    try {
        sliderComponent.init();
        console.log("TimeSlider Component Ready ✅");
    } catch (err) {
        console.error("Critical Failure:", err);
    }
});