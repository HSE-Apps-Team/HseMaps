import { DataModule } from "./DataModule.js";
import { StateManager } from './StateManager.js';

/**
 * @module StreetViewModule
 * @description Manages street view image retrieval and display for path segments,
 * including fallback handling for missing images and error states.
 */
export const StreetViewModule = {
    /** @constant {string} DEFAULT_IMAGE - Path to the default fallback image */
    DEFAULT_IMAGE: '/assets/no-streetview.jpg',
    
    /**
     * Retrieves the appropriate street view image for the current path segment.
     * @returns {string} URL of the street view image or default image if none available
     * @throws {Error} When image retrieval fails
     */
    getImage() {
        const path = StateManager.get().path;
        const currentSegment = StateManager.get().currentPathSegment;
        
        if (!path?.length || currentSegment === null || currentSegment >= path.length - 1) {
            return this.DEFAULT_IMAGE;
        }

        const [from, to] = [path[currentSegment], path[currentSegment + 1]];
        const images = DataModule.get().imgs;
        
        return images?.[from]?.[to] || this.DEFAULT_IMAGE;
    }
};