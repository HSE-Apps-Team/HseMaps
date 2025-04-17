import { StateManager } from './StateManager.js';
import { RenderingModule } from './RenderingModule.js';
import { UtilityModule } from './UtilityModule.js';
import { DOMCache } from './DOMCache.js';
import { Config } from '../config/config.js';
import { ScheduleManager } from './ScheduleManager.js';
import { DataModule } from './DataModule.js';
import { PathTransitionHandler } from './PathTransitionHandler.js';
import { PathfindingModule } from './PathfindingModule.js';
import { NavigationController } from './NavigationController.js';
import mainFloorImage from '../elements/mainfloorcrunched.png';
import combFloorImage from '../elements/combscaled.png';

/**
 * @module EventHandlingModule
 * @description Manages user interactions and event handling for navigation features
 */
export const EventHandlingModule = {
    /**
     * @function markShortestPath
     * @async
     * @description Calculates and displays the shortest path between selected rooms
     * @throws {Error} If room selection or path finding fails
     */
    async markShortestPath() {
        // Existing room validation and path calculation
        const start = document.getElementById("start").value?.toUpperCase();
        const end = document.getElementById("end").value?.toUpperCase();
        
        if (!start || !end) {
            alert("Please enter both start and end rooms");
            return;
        }

        const { rooms, nextMatrix, distMatrix } = DataModule.get();
        if (!rooms[start] || !rooms[end]) {
            alert("One or both rooms not found. Please check room names.");
            return;
        }

        if (start === end) {
            alert("You are already at your destination!");
            RenderingModule.refresh();
            return;
        }

        // Reset rendering state
        RenderingModule.refresh();
        StateManager.set('firstPathRendered', true);
        StateManager.set('secondPathRendered', false);
        StateManager.set('maskedImages', null);
        
        // Prepare UI
        DOMCache[Config.SVG.SELECTORS.PROGBAR].value = 0;
        DOMCache[Config.SVG.SELECTORS.SCROLL].scrollTop = 0;
        
        // Calculate path
        const path = PathfindingModule.findShortestPath(nextMatrix, distMatrix, start, end, rooms);
        if (!path?.length) {
            alert("No valid path found between these rooms");
            return;
        }
        
        // Generate visualization data
        const vertices = DataModule.get().verts;
        const stairIndex = PathTransitionHandler.getStairIndex(path);
        const points = path.map(p => `${vertices[p].x},${vertices[p].y}`);
        let segments = [points.slice(0, stairIndex).join(' '), points.slice(stairIndex).join(' ')];
        
        if (stairIndex === -1) {
            segments = [points.join(' '), ''];
        }
        
        // Set up floor masks
        let [firstFloorImage, secondFloorImage] = [mainFloorImage, combFloorImage];
        let [firstFloor, secondFloor] = ['main', 'comb'];
        
        if (path[0] > Config.THRESHOLD.FLOOR_CHANGE) {
            [firstFloorImage, secondFloorImage] = [combFloorImage, mainFloorImage];
            [firstFloor, secondFloor] = ['comb', 'main'];
        }
        

        
        // Initialize path for navigation
        NavigationController.initializePath(path);
        NavigationController.configureScroll();
    },

    /**
     * @function displayNextClass
     * @description Updates the UI to show the next class in the schedule
     */
    displayNextClass() {
        const selectedDay = document.getElementById("daySelect").value;
        const schedule = ScheduleManager.load(selectedDay);
        const currentClass = schedule[0];
        const nextClass = schedule[1];
        document.getElementById("nextDestination").innerText = `${currentClass} -> ${nextClass}`;
    },

    /**
     * @function navigateSchedule
     * @description Handles navigation between consecutive classes in the schedule
     */
    navigateSchedule() {
        const selectedDay = document.getElementById("daySelect").value;
        const schedule = ScheduleManager.load(selectedDay);
        
        if (!schedule?.length) {
            alert("No schedule available for selected day");
            return;
        }

        let iterator = StateManager.get('iterator') || 1;
        const currentClass = schedule[iterator - 1];
        const nextClass = schedule[iterator % schedule.length];

        if (currentClass === nextClass) {
            alert("Next class is in the same room - no navigation needed");
            return;
        }

        RenderingModule.refresh();
        
        document.getElementById("start").value = currentClass;
        document.getElementById("end").value = nextClass;
        
        EventHandlingModule.markShortestPath(); // Fix here
        StateManager.set('iterator', (iterator + 1) % schedule.length);
        iterator = StateManager.get('iterator') || 1;
        document.getElementById("nextDestination").innerText = `${schedule[iterator - 1]} -> ${schedule[iterator % schedule.length]}`;
    },

    /**
     * @function updateSlider
     * @description Updates the progress slider based on scroll position
     */
    updateSlider() {
        const slider = DOMCache[Config.SVG.SELECTORS.PROGBAR];
        const scroll = DOMCache[Config.SVG.SELECTORS.SCROLL];
        if (slider && scroll) {
            slider.value = scroll.scrollTop;
            UtilityModule.updateAgent();
        }
    }
};