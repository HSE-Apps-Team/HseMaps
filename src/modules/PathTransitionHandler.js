/**
 * @module PathTransitionHandler
 * @description Manages transitions between floors during path navigation
 */

import { Config } from '../config/config.js';
import { StateManager } from './StateManager.js';
import { DataModule } from './DataModule.js';

export const PathTransitionHandler = {
    /**
     * @type {boolean}
     * @description Flag indicating if a floor transition is in progress
     */
    isTransitioning: false,

    /**
     * @function handleTransition
     * @returns {boolean} True if transition occurred, false otherwise
     * @description Handles floor transitions based on current path segment
     */
    handleTransition() {
        if (this.isTransitioning) return false;
        
        this.isTransitioning = true;
        const currentSegment = StateManager.get('currentPathSegment');
        const fullPath = StateManager.get('path');
        let isSecondFloor = fullPath[currentSegment] > Config.THRESHOLD.FLOOR_CHANGE;
        
        if (fullPath[0] > Config.THRESHOLD.FLOOR_CHANGE) {
            isSecondFloor = !isSecondFloor;
        }

        const needsTransition = isSecondFloor ? 
            StateManager.get('firstPathRendered') : 
            StateManager.get('secondPathRendered');

        if (needsTransition) {
            StateManager.set('firstPathRendered', !isSecondFloor);
            StateManager.set('secondPathRendered', isSecondFloor);
            const callback = isSecondFloor ? 
                StateManager.get('onPathEnd') : 
                StateManager.get('onPathStart');
            if (callback) callback();
            this.isTransitioning = false;
            return true;
        }

        this.isTransitioning = false;
        return false;
    },
    
    /**
     * @function getStairIndex
     * @param {number[]} path - Array of vertex indices
     * @returns {number} Index of stair transition point or -1 if none found
     * @description Finds the index where the path transitions between floors
     */
    getStairIndex(path){
        const { distMatrix } = DataModule.get();
        for (let i = 0; i < path.length-1; i++) {
            if (distMatrix[path[i]][path[i + 1]] === Config.THRESHOLD.STAIR_DISTANCE) {
                return i+1;
            }
        }
        return -1;
    }
};