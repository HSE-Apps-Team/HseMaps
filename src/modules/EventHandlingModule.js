// src/modules/EventHandlingModule.js
import { StateManager } from './StateManager.js';
import { RenderingModule } from './RenderingModule.js';
import { UtilityModule } from './UtilityModule.js';
import { DOMCache } from './DOMCache.js';
import { Config } from '../config/config.js';

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

    navSchedule() {
        RenderingModule.refresh();
        const sched = document.getElementById("sched");
        const classes = sched.value.split(",");
        const iterator = StateManager.get('iterator');
        const from = classes[iterator - 1];
        const to = classes[iterator];
        document.getElementById("start").value = from;
        document.getElementById("end").value = to;
        this.markShortestPathFromInput();
        StateManager.set('iterator', iterator + 1);
        if (iterator === classes.length - 1) StateManager.set('iterator', 1);
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