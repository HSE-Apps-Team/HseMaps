/**
 * StateManager - Central state management for path navigation
 * Uses Proxy for reactive state updates and floor transition handling
 * 
 * @module StateManager
 */
export const StateManager = (() => {
    /**
     * Internal state object with Proxy wrapper
     * @type {Proxy}
     * 
     * State Properties:
     * @property {number} totalDistance - Total path length across all floors
     * @property {boolean} firstPathRendered - Whether first floor path is active
     * @property {boolean} secondPathRendered - Whether second floor path is active
     * @property {string} currentFloor - Current active floor ('main'|'second')
     * @property {Function} skipStart - Controls start point rendering
     * @property {Function} skipEnd - Controls end point rendering
     * @property {Function} onPathStart - Callback for first floor transition
     * @property {Function} onPathEnd - Callback for second floor transition
     * @property {number} iterator - Current position in navigation sequence
     * @property {Array} path - Array to store the path
     * @property {Array} distanceDomain - Array to store the distance domain
     * @property {Object|null} currentPathSegment - Current path segment
     * 
     * @example State structure
     * state = {
     *   totalDistance: 150,      // Path length in pixels
     *   firstPathRendered: true, // On first floor
     *   secondPathRendered: false,// Second floor not active
     *   currentFloor: 'main',    // Currently on main floor
     *   skipStart: () => true,   // Skip start point
     *   skipEnd: () => false,    // Show end point
     *   onPathStart: () => {},   // Floor transition callback
     *   onPathEnd: () => {},     // Floor transition callback
     *   iterator: 1,             // First waypoint
     *   path: [],                // Path array
     *   distanceDomain: [],      // Distance domain array
     *   currentPathSegment: null // Current path segment
     * }
     */
    const state = new Proxy({
        totalDistance: 0,
        firstPathRendered: true,
        secondPathRendered: false,
        currentFloor: 'main',
        skipStart: () => true,
        skipEnd: () => false,
        onPathStart: () => {},
        onPathEnd: () => {},
        iterator: 1,
        path: [],
        distanceDomain: [],
        currentPathSegment: null
    }, {
        /**
         * Proxy trap for state updates
         * Handles floor transitions when secondPathRendered changes
         * 
         * @example Floor transition
         * StateManager.set('secondPathRendered', true)
         * // Results in:
         * // - secondPathRendered = true
         * // - currentFloor = 'second'
         */
        set(target, key, value) {
            target[key] = value;
            if (key === 'secondPathRendered') {
                target.currentFloor = value ? 'second' : 'main';
            }
            return true;
        }
    });

    /**
     * Public interface for state management
     * @example Usage
     * // Get single value
     * StateManager.get('totalDistance') // Returns: 150
     * 
     * // Get entire state
     * StateManager.get() // Returns: {...state}
     * 
     * // Set state value
     * StateManager.set('totalDistance', 200)
     * // Results in state.totalDistance = 200
     * 
     * // Set floor transition
     * StateManager.set('secondPathRendered', true)
     * // Results in:
     * // - state.secondPathRendered = true
     * // - state.currentFloor = 'second'
     */
    return {
        get: key => key ? state[key] : state,
        set: (key, value) => { state[key] = value; }
    };
})();