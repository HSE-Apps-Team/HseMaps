/**
 * DOMCache - Efficient DOM element caching using Proxy
 * Automatically handles element reconnection and provides cached access
 * 
 * @module DOMCache
 */

/**
 * Proxy-based DOM element cache
 * - Automatically caches DOM queries
 * - Checks element connection status
 * - Refreshes cache for disconnected elements
 * 
 * @type {Proxy}
 * 
 * @example Usage
 * // Get element by selector (cached)
 * DOMCache['#myElement']        // Returns: <div id="myElement">...</div>
 * DOMCache['.myClass']         // Returns: <div class="myClass">...</div>
 * 
 * // Automatic cache invalidation
 * element.remove()             // Element is removed from DOM
 * DOMCache['#myElement']       // Cache refreshed, new query performed
 * 
 * @example Cache behavior
 * // First access - performs querySelector
 * DOMCache['#agent']          // Performs: document.querySelector('#agent')
 * 
 * // Subsequent access - returns cached element if still connected
 * DOMCache['#agent']          // Returns cached element
 * 
 * // After element disconnection - refreshes cache
 * DOMCache['#agent']          // Performs new querySelector if element disconnected
 */
export const DOMCache = new Proxy({}, {
    /**
     * Getter trap for DOM element access
     * @param {Object} cache - Internal cache object
     * @param {string} selector - CSS selector string
     * @returns {Element|null} DOM element or null if not found
     * 
     * @example
     * DOMCache['#graph']      // Returns cached #graph element
     * DOMCache['.invalid']    // Returns null if element not found
     */
    get: (cache, selector) => {
        if (!cache[selector] || !cache[selector].isConnected) {
            cache[selector] = document.querySelector(selector);
        }
        return cache[selector];
    }
});