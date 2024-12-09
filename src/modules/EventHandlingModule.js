import { StateManager } from './StateManager.js';
import { RenderingModule } from './RenderingModule.js';
import { UtilityModule } from './UtilityModule.js';
import { DOMCache } from './DOMCache.js';
import { Config } from '../config/config.js';

/**
 * EventHandlingModule - Manages UI event handling and synchronization
 * Coordinates scroll position, slider value, and agent movement
 * 
 * @module EventHandlingModule
 */
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

    /**
     * Handles navigation through schedule waypoints
     * Updates input fields and triggers path calculation
     * 
     * @example
     * // Given schedule input "ROOM101,ROOM102,ROOM103"
     * navSchedule()  
     * // Sets start="ROOM101", end="ROOM102"
     * // Next call sets start="ROOM102", end="ROOM103"
     * // Next call resets to beginning
     */
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

    /**
     * Synchronizes scroll position with slider value and updates agent
     * Called on scroll events to maintain visual synchronization
     * 
     * @example Input/Output
     * // When user scrolls to position 150:
     * // scroll.scrollTop = 150
     * // -> sets slider.value = 150
     * // -> triggers agent update at position 150
     * 
     * @example Usage
     * const scroll = document.getElementById("scroll");
     * scroll.scrollTop = 100;
     * updateSliderValue();
     * // Results in:
     * // - slider.value = 100
     * // - agent position updated to 100
     */
    updateSliderValue() {
        const slider = DOMCache[Config.SVG.SELECTORS.PROGBAR];
        const scroll = DOMCache[Config.SVG.SELECTORS.SCROLL];
        
        // Update slider value from scroll position
        slider.value = scroll.scrollTop;
        
        // Update agent position
        UtilityModule.updateAgent();
    }
};

/**
 * Event Bindings
 * Connects DOM events to handler functions
 * 
 * @example Scroll Event
 * // When user scrolls the container:
 * scroll.onscroll -> updateSliderValue() -> UtilityModule.updateAgent()
 * 
 * @example Slider Input
 * // When user moves the slider:
 * progbar.oninput -> UtilityModule.updateAgent()
 */

// Direct scroll event binding
document.getElementById("scroll").onscroll = () => EventHandlingModule.updateSliderValue();

// Direct slider input binding
document.getElementById("progbar").oninput = () => UtilityModule.updateAgent();

/**
 * Updates the body's data-theme attribute based on the selected theme
 * 
 * @example
 * // When user selects "dark" from the theme dropdown:
 * // themeDropdown.value = "dark"
 * // -> sets document.body.dataset.theme = "dark"
 */
function updateTheme() {
    const themeDropdown = document.getElementById("theme-dropdown");
    const selectedTheme = themeDropdown.value;
    document.body.dataset.theme = selectedTheme;
}

// Bind theme dropdown change event to updateTheme function
document.getElementById("theme-dropdown").onchange = updateTheme;