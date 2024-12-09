/**
 * ColorModule - Handles color transitions for agent movement visualization
 * Provides smooth color interpolation from red -> yellow -> green
 * Uses caching to optimize repeated color calculations
 */
export const ColorModule = {
    /**
     * Returns an RGB color string based on progress value
     * Uses cached values to improve performance
     * 
     * Progress transitions:
     * 0.0  -> rgb(255,0,0)    // Red
     * 0.25 -> rgb(255,255,0)  // Yellow 
     * 0.5  -> rgb(127,255,0)  // Yellow-Green
     * 0.99 -> rgb(0,255,0)    // Green
     * 
     * @param {number} progress - Value between 0 and 1 indicating completion
     * @returns {string} RGB color string
     * 
     * @example
     * getColor(0)    // Returns 'rgb(255,0,0)'
     * getColor(0.5)  // Returns 'rgb(127,255,0)'
     * getColor(1)    // Returns 'rgb(0,255,0)'
     */
    getColor: (() => {
        // Cache color values to avoid recalculating
        const colorCache = new Map();
        
        return (progress) => {
            // Round to nearest percent to limit cache size
            const key = Math.round(progress * 100);
            
            if (!colorCache.has(key)) {
                // Full completion is always green
                if (progress >= 0.99) {
                    colorCache.set(key, 'rgb(0,255,0)');
                } else {
                    // Green increases linearly 0->510, capped at 255
                    const green = Math.min(Math.floor(progress * 510), 255);
                    
                    // Red starts at 255, begins decreasing at progress 0.49
                    const red = progress >= 0.49 
                        ? Math.max(255 - Math.floor((progress - 0.49) * 510), 0)
                        : 255;
                        
                    colorCache.set(key, `rgb(${red},${green},0)`);
                }
            }
            return colorCache.get(key);
        };
    })()
};