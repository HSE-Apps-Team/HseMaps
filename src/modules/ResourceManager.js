/**
 * @module ResourceManager
 * @description Centralized resource management for images, caching, and loading
 */
import { StateManager } from './StateManager.js';

const importAll = (r) => {
    const images = {};
    r.keys().forEach((key) => {
        images[key.replace('./', '')] = r(key);
    });
    return images;
};

export const ResourceManager = {
    // Centralized caches
    imageCache: new Map(),
    loadingPromises: new Map(),
    streetViewImages: importAll(require.context('../elements/StreetImages', false, /\.(png|jpe?g|svg)$/)),
    DEFAULT_IMAGE: '/assets/no-streetview.jpg',

    /**
     * Gets URL for a specific image
     * @param {string} imageName - Image name to look up
     * @returns {string} URL for the image or empty string if not found
     */
    getImageUrl(imageName) {
        return this.streetViewImages[imageName] || '';
    },

    /**
     * Preloads images for a path to ensure smooth navigation
     * @param {Array<number>} path - The full navigation path
     * @returns {Promise<void>} Promise that resolves when preloading is complete
     */
    async preloadImagesForPath(path) {
        if (!path?.length) return;
        
        const promises = [];
        
        for (let i = 0; i < path.length - 1; i++) {
            const imageKey = `${path[i]}-${path[i + 1]}.jpg`;
            if (!this.imageCache.has(imageKey) && !this.loadingPromises.has(imageKey)) {
                const promise = this.loadImage(imageKey);
                promises.push(promise);
            }
        }
        
        await Promise.all(promises);
    },
    
    /**
     * Loads a single image and caches it
     * @param {string} imageKey - Key identifying the image to load
     * @returns {Promise<string>} Promise resolving to the image URL
     */
    async loadImage(imageKey) {
        if (this.imageCache.has(imageKey)) {
            return this.imageCache.get(imageKey);
        }
        
        if (this.loadingPromises.has(imageKey)) {
            return this.loadingPromises.get(imageKey);
        }
        
        const imageUrl = this.getImageUrl(imageKey);
        if (!imageUrl) {
            return this.DEFAULT_IMAGE;
        }
        
        const loadPromise = new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
                this.imageCache.set(imageKey, imageUrl);
                this.loadingPromises.delete(imageKey);
                resolve(imageUrl);
            };
            img.onerror = () => {
                this.loadingPromises.delete(imageKey);
                resolve(this.DEFAULT_IMAGE);
            };
            img.src = imageUrl;
        });
        
        this.loadingPromises.set(imageKey, loadPromise);
        return loadPromise;
    },
    
    /**
     * Gets the appropriate image for the current path segment
     * @returns {string} URL of the image to display
     */
    getPathSegmentImage() {
        const currentPathSegment = StateManager.get('currentPathSegment');
        const path = StateManager.get('path');
        
        if (!path || currentPathSegment === undefined || 
            currentPathSegment < 0 || currentPathSegment >= path.length - 1) {
            return this.DEFAULT_IMAGE;
        }
        
        const imageKey = `${path[currentPathSegment]}-${path[currentPathSegment + 1]}.jpg`;
        
        // Check cache first for immediate return
        if (this.imageCache.has(imageKey)) {
            return this.imageCache.get(imageKey);
        }
        
        // Start loading if not already loading
        if (!this.loadingPromises.has(imageKey)) {
            this.loadImage(imageKey);
        }
        
        return this.DEFAULT_IMAGE;
    },
    
    /**
     * Clears all cached resources
     */
    clearCache() {
        this.imageCache.clear();
        this.loadingPromises.clear();
    }
};
