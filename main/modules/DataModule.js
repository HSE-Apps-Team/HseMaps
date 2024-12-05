/**
 * DataModule - Manages graph data loading and access for pathfinding
 * Handles asynchronous loading of distance matrices, paths, rooms and vertices
 * Provides centralized data access through getter
 */
export const DataModule = (function() {
    /**
     * Internal data store for graph components
     * @type {{
     *   distMatrix: number[][],  // Matrix of distances between vertices
     *   nextMatrix: number[][],  // Next vertex matrix for path reconstruction
     *   rooms: Object<string, number[]>,  // Map of room names to vertex indices
     *   verts: {x: number, y: number}[]  // Array of vertex coordinates
     * }}
     * 
     * @example Data structure
     * data = {
     *   distMatrix: [[0, 5, Infinity], [5, 0, 10], [Infinity, 10, 0]],
     *   nextMatrix: [[0, 1, null], [1, 1, 2], [null, 2, 2]],
     *   rooms: { "ROOM101": [0, 1], "ROOM102": [2] },
     *   verts: [{x: 100, y: 200}, {x: 150, y: 200}, {x: 150, y: 250}]
     * }
     */
    const data = {
        distMatrix: [],
        nextMatrix: [],
        rooms: [],
        verts: [],
        imgs: []
    };

    /**
     * Fetches and parses JSON from given URL
     * @param {string} url - URL to fetch JSON from
     * @returns {Promise<any>} Parsed JSON data
     * @throws {Error} If fetch fails or response is not OK
     * 
     * @example
     * await fetchJSON('elements/DistanceMatrix.json')
     * // Returns: [[0, 5, Infinity], [5, 0, 10], [Infinity, 10, 0]]
     */
    async function fetchJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch ${url}:`, error);
            throw error;
        }
    }

    /**
     * Initializes the module by loading all required data files
     * Uses Promise.all for concurrent loading
     * @returns {Promise<void>}
     * @throws {Error} If any data file fails to load
     * 
     * @example
     * await DataModule.initialize()
     * // Loads all data files and populates internal data store
     * // After initialization:
     * DataModule.get().rooms // Returns: { "ROOM101": [0, 1], ... }
     * DataModule.get().verts // Returns: [{x: 100, y: 200}, ...]
     */
    async function initialize() {
        try {
            const [distMatrix, nextMatrix, rooms, verts, imgs] = await Promise.all([
                fetchJSON('elements/DistanceMatrix.json'),
                fetchJSON('elements/PrecomputedPaths.json'),
                fetchJSON('elements/Nodes.json').then(flipKeyValuePairWithMultiNodes),
                fetchJSON('elements/Vertices.json'),
                fetchJSON('elements/StreetView.json')
            ]);
            
            Object.assign(data, { distMatrix, nextMatrix, rooms, verts, imgs });
        } catch (error) {
            console.error('Initialization failed:', error);
            throw error;
        }
    }

    return {
        fetchJSON,
        initialize,
        get: () => data
    };
})();
