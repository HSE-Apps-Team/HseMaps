// src/modules/EventHandlingModule.js
import { StateManager } from './StateManager.js';
import { RenderingModule } from './RenderingModule.js';
import { UtilityModule } from './UtilityModule.js';
import { DOMCache } from './DOMCache.js';
import { Config } from '../config/config.js';
import { ScheduleManager } from './ScheduleManager.js';

export const EventHandlingModule = {
    markShortestPathFromInput() {
        RenderingModule.refresh();
        DOMCache[Config.SVG.SELECTORS.PROGBAR].value = 0;
        DOMCache[Config.SVG.SELECTORS.SCROLL].scrollTop = 0;
        const start = document.getElementById("start").value.toUpperCase();
        const end = document.getElementById("end").value.toUpperCase();
        UtilityModule.markShortestPath(start, end);
        UtilityModule.configureScroll();
    },
    displayNext(){
        const selectedDay = document.getElementById("daySelect").value;
        const schedule = ScheduleManager.getSchedule(selectedDay);
        const currentClass = schedule[0];
        const nextClass = schedule[1];
document.getElementById("nextDestination").innerText = currentClass + " -> " + nextClass;
    },
    navSchedule() {
        RenderingModule.refresh();
        const selectedDay = document.getElementById("daySelect").value;
        const schedule = ScheduleManager.getSchedule(selectedDay);
        let iterator = StateManager.get('iterator') || 1;
        const currentClass = schedule[iterator-1];
        const nextClass = schedule[(iterator) % schedule.length];
        
        if (!schedule.length) return;
        
        
        
        document.getElementById("start").value = currentClass;
        document.getElementById("end").value = nextClass;
        
        this.markShortestPathFromInput();
        StateManager.set('iterator', (iterator+1) % schedule.length);
        iterator = StateManager.get('iterator') || 1;
        document.getElementById("nextDestination").innerText = schedule[iterator-1] + " -> " + schedule[(iterator) % schedule.length];
    },

    updateSliderValue() {
        const slider = DOMCache[Config.SVG.SELECTORS.PROGBAR];
        const scroll = DOMCache[Config.SVG.SELECTORS.SCROLL];
        if (slider && scroll) {
            slider.value = scroll.scrollTop;
            UtilityModule.updateAgent();
        }
    }
};

// Remove direct DOM event bindings