/**
 * @module DataModule
 * @description Manages loading and initialization of navigation data
 */

import { flipKeyValuePairWithMultiNodes } from './devTestingModule.js';

export const DataModule = (function() {
    /**
     * @type {Object} Internal data storage
     */
    const data = {
        distMatrix: [],
        nextMatrix: [],
        rooms: [],
        verts: [],
        imgs: []
    };

    /**
     * @function initialize
     * @async
     * @description Loads and initializes all required navigation data
     * @throws {Error} If initialization fails
     */
    async function initialize() {
        const [distMatrix, nextMatrix, rawRooms, verts, imgs] = await Promise.all([
            require('../elements/DistanceMatrix.json'),
            require('../elements/PrecomputedPaths.json'),
            require('../elements/SLAVEWORK.json'),
            require('../elements/Vertices.json'),
            require('../elements/StreetView.json')
        ]);

        Object.assign(data, {
            distMatrix,
            nextMatrix,
            rooms: flipKeyValuePairWithMultiNodes(rawRooms),
            verts,
            imgs
        });
    }

    return {
        initialize,
        get: (key) => key ? data[key] : data,
        isInitialized: () => Object.values(data).every(Boolean)
    };
})();