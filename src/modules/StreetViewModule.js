import { StateManager } from './StateManager.js';
import { ImageModule } from './ImageModule.js';

/**
 * @module StreetViewModule
 * @description Manages street view image retrieval and display for path segments,
 * including fallback handling for missing images and error states.
 */
export const StreetViewModule = {
    /** @constant {string} DEFAULT_IMAGE - Path to the default fallback image */
    DEFAULT_IMAGE: '/assets/no-streetview.jpg',
    imageCache: new Map(),
    MAX_CACHE_SIZE: 50, // Maximum number of images to keep in cache
    preloadAbortController: null, // For cancelling previous preloads

    /**
     * Preloads images for the given path.
     * @param {Array} path - The path segments to preload images for
     */
    async preloadImagesForPath(path) {
        if (!path?.length) return;
        
        // Cancel any ongoing preloading
        if (this.preloadAbortController) {
            this.preloadAbortController.abort();
        }
        
        this.preloadAbortController = new AbortController();
        const signal = this.preloadAbortController.signal;
        
        const loadPromises = [];
        
        for (let i = 0; i < path.length - 1; i++) {
            const imageKey = `${path[i]}-${path[i + 1]}.jpg`;
            if (!this.imageCache.has(imageKey)) {
                loadPromises.push((async () => {
                    try {
                        if (signal.aborted) return;
                        
                        const imageUrl = ImageModule.getImageUrl(imageKey);
                        if (imageUrl) {
                            const img = new Image();
                            img.src = imageUrl;
                            await img.decode(); // Wait for image to load
                            
                            if (signal.aborted) return;
                            
                            // Manage cache size
                            if (this.imageCache.size >= this.MAX_CACHE_SIZE) {
                                // Remove the oldest entry
                                const firstKey = this.imageCache.keys().next().value;
                                this.imageCache.delete(firstKey);
                            }
                            
                            this.imageCache.set(imageKey, imageUrl);
                        }
                    } catch (error) {
                        if (!signal.aborted) {
                            console.warn(`Failed to preload image: ${imageKey}`);
                        }
                    }
                })());
            }
        }
        
        try {
            // Load all images in parallel instead of sequentially
            await Promise.all(loadPromises);
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error during image preloading:', error);
            }
        } finally {
            if (this.preloadAbortController?.signal === signal) {
                this.preloadAbortController = null;
            }
        }
    },

    /**
     * Retrieves the appropriate street view image for the current path segment.
     * @returns {string} URL of the street view image or default image if none available
     * @throws {Error} When image retrieval fails
     */
    getImage() {
        const currentPathSegment = StateManager.get('currentPathSegment');
        const path = StateManager.get('path');

        if (!path || currentPathSegment === undefined) {
            return ImageModule.getImageUrl('no-streetview.jpg');
        }

        const imageKey = `${path[currentPathSegment]}-${path[currentPathSegment + 1]}.jpg`;
        // Check cache first
        if (this.imageCache.has(imageKey)) {
            return this.imageCache.get(imageKey);
        }
        
        const imageUrl = ImageModule.getImageUrl(imageKey);
        if (imageUrl) {
            this.imageCache.set(imageKey, imageUrl);
            return imageUrl;
        }
        
        return ImageModule.getImageUrl('no-streetview.jpg');
    },

    /**
     * Clears the image cache.
     */
    clearCache() {
        this.imageCache.clear();
    }
};