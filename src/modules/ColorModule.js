/**
 * @module ColorModule
 * @description Color calculation utilities with memoization
 */

export class ColorModule {
    static #colorCache = new Map();
    
    /**
     * Calculates progress-based color with caching
     * @param {number} progress - Normalized progress value [0-1]
     * @returns {string} RGB color string
     */
    static getColor(progress) {
        const normalizedProgress = this.#normalizeProgress(progress);
        const key = Math.round(normalizedProgress * 100);
        
        if (!this.#colorCache.has(key)) {
            this.#colorCache.set(key, this.#calculateColor(normalizedProgress));
        }
        
        return this.#colorCache.get(key);
    }
    
    /**
     * @private
     * Calculates RGB values based on progress
     */
    static #calculateColor(progress) {
        if (progress >= 0.99) return 'rgb(0,255,0)';
        
        const green = Math.min(progress * 510, 255);
        const red = progress >= 0.49
            ? Math.max(255 - (progress - 0.49) * 510, 0)
            : 255;
            
        return `rgb(${red},${green},0)`;
    }
    
    /**
     * @private
     * Ensures progress value is within valid range
     */
    static #normalizeProgress(value) {
        return Math.max(0, Math.min(1, Number(value) || 0));
    }
}