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
     * @description Flag indicating if a transition has occurred at current position
     */
    transitionPerformed: false,
    
    /**
     * @function handleTransition
     * @returns {boolean} True if transition occurred, false otherwise
     * @description Handles floor transitions based on agent proximity to stairwell
     */
    handleTransition() {
        // Check if agent is near stairwell
        if (!this.isNearStairwell()) {
            // Reset transition state when away from stairwell
            this.transitionPerformed = false;
            return false;
        }
        
        // Only perform transition once per stairwell visit
        if (this.transitionPerformed) {
            return false;
        }
        
        // Perform the transition
        const transitionOccurred = this.onStair();
        return transitionOccurred;
    },
    
    /**
     * @function isNearStairwell
     * @returns {boolean} True if agent is near a stairwell, false otherwise
     * @description Checks if agent element is near the stairwell element
     */
    isNearStairwell() {
        const agentElement = document.getElementById('agent');
        const stairwellElement = document.getElementById('stairwell');
        
        if (!agentElement || !stairwellElement) return false;
        
        const agentRect = agentElement.getBoundingClientRect();
        const stairwellRect = stairwellElement.getBoundingClientRect();
        
        // Calculate centers
        const agentCenterX = agentRect.left + agentRect.width / 2;
        const agentCenterY = agentRect.top + agentRect.height / 2;
        const stairwellCenterX = stairwellRect.left + stairwellRect.width / 2;
        const stairwellCenterY = stairwellRect.top + stairwellRect.height / 2;
        
        // Calculate distance between centers
        const distance = Math.sqrt(
            Math.pow(agentCenterX - stairwellCenterX, 2) + 
            Math.pow(agentCenterY - stairwellCenterY, 2)
        );
        
        // Check if distance is less than the threshold
        const proximityThreshold = Config.THRESHOLD.STAIR_PROXIMITY;
        return distance <= proximityThreshold;
    },
    
    /**
     * @function onStair
     * @returns {boolean} True if transition occurred, false otherwise
     * @description Handles the floor transition when agent is on a stair
     */
    onStair() {
        this.transitionPerformed = true;
        // Instead of checking which floor we're on based on node IDs,
        // simply check which floor is currently rendered
        const firstFloorRendered = StateManager.get('firstPathRendered');
        const secondFloorRendered = StateManager.get('secondPathRendered');
        
        // Need both the current floor state and a valid path
        if (StateManager.get('path') === undefined) return false;
        
        // If first floor is showing, transition to second floor
        if (firstFloorRendered) {
            StateManager.set('firstPathRendered', false);
            StateManager.set('secondPathRendered', true);
            
            // Call the path end callback (going upstairs)
            const callback = StateManager.get('onPathEnd');
            if (callback) callback();
            return true;
        }
        
        // If second floor is showing, transition to first floor
        if (secondFloorRendered) {
            StateManager.set('firstPathRendered', true);
            StateManager.set('secondPathRendered', false);
            
            // Call the path start callback (going downstairs)
            const callback = StateManager.get('onPathStart');
            if (callback) callback();
            return true;
        }
        
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
                return i;
            }
        }
        return -1;
    }
};