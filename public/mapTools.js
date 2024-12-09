import { DataModule } from './modules/DataModule.js';
import { EventHandlingModule } from './modules/EventHandlingModule.js';
import { StreetViewModule } from './modules/StreetViewModule.js';
import { UtilityModule } from './modules/UtilityModule.js';

// Initialize application
(async () => {
    try {
        await DataModule.initialize();
        
        // Expose necessary functions to global scope
        Object.assign(window, {
            markShortestPathFromInput: EventHandlingModule.markShortestPathFromInput,
            navSchedule: EventHandlingModule.navSchedule,
            updateAgent: UtilityModule.updateAgent,
            getImg: StreetViewModule.getImg
        });
        
        window.addEventListener('resize', UtilityModule.configureScroll);
    } catch (error) {
        console.error('Application initialization failed:', error);
    }
})();