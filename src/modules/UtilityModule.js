import { Config } from '../config/config.js';
import { StateManager } from './StateManager.js';
import { DOMCache } from './DOMCache.js';
import { ColorModule } from './ColorModule.js';
import { PathTransitionHandler } from './PathTransitionHandler.js';
import { RenderingModule } from './RenderingModule.js';
import { DataModule } from './DataModule.js';
import { StreetViewModule } from './StreetViewModule.js';

/**
 * @module UtilityModule
 * @description Provides utility functions for managing agent movement, path rendering,
 * and transition handling in the navigation system. Handles core functionality for
 * path visualization and agent positioning.
 */
export const UtilityModule = {

    /**
     * Marks and renders the shortest path on the map, handling both regular paths
     * and paths with stair transitions.
     * @returns {Promise<void>} A promise that resolves when the path is rendered
     * @throws {Error} When no valid path is available to render
     */
    markShortestPath() {
        const path = StateManager.get('path');
        if (!path?.length) {
            console.warn('No path to render');
            return;
        }

        RenderingModule.refresh();
        StateManager.set('onPathEnd', () => {});
        StateManager.set('onPathStart', () => {});
        const { distMatrix, verts } = DataModule.get();
        StateManager.set('totalDistance', distMatrix[path[0]][path[path.length - 1]]);
        StateManager.set('path', path);

        const distanceDomain = [];
        let accumulatedDist = 0;
        
        for (let i = 0; i < path.length; i++) {
            distanceDomain[i] = accumulatedDist;
            if (i < path.length - 1 && distMatrix[path[i]][path[i + 1]] < Config.THRESHOLD.STAIR_DISTANCE) {
                accumulatedDist += distMatrix[path[i]][path[i + 1]];
            }
        }
        
        StateManager.set('distanceDomain', distanceDomain);
        for (let i = 0; i < path.length - 1; i++) {
            if (distMatrix[path[i]][path[i + 1]] === Config.THRESHOLD.STAIR_DISTANCE) {
                this.handleStairTransition(path, i + 1, distMatrix, verts);
                return RenderingModule.selectPath(path.slice(0, i + 1), verts, undefined, "stairwell");
            }
        }
        return RenderingModule.selectPath(path, verts);
    },

    /**
     * Configures the transition between floors when stairs are encountered in the path.
     * @param {Array<number>} path - The complete path array
     * @param {number} index - The index where the stair transition occurs
     * @param {Array<Array<number>>} distMatrix - The distance matrix
     * @param {Array<Object>} verts - The vertices data
     */
    handleStairTransition(path, index, distMatrix, verts) {
        StateManager.set('totalDistance', 
            StateManager.get('totalDistance') - distMatrix[path[index - 1]][path[index]]
        );
        
        StateManager.set('onPathStart', () => {
            if (!StateManager.get('skipStart')()) {
                RenderingModule.refresh();
                StateManager.set('skipEnd', () => false);
                StateManager.set('skipStart', () => true);
                
                RenderingModule.selectPath(
                    path.slice(0, index),
                    verts, 
                    undefined, 
                    "stairwell"
                );
                this.configureScroll();
            }
        });

        StateManager.set('onPathEnd', () => {
            if (!StateManager.get('skipEnd')()) {
                RenderingModule.refresh();
                StateManager.set('skipStart', () => false);
                StateManager.set('skipEnd', () => true);
            
                RenderingModule.selectPath(
                    path.slice(index),
                    verts,
                    "stairwell"
                );
                this.configureScroll();
            }
        });
    },

    /**
     * Configures the scroll behavior and progress bar for path navigation.
     * @throws {Error} When required DOM elements are not available
     */
    configureScroll() {
        const element = DOMCache[Config.SVG.SELECTORS.AGENT];
        if (!element) return;
        
        RenderingModule.focus(element, Config.DEFAULTS.MARGIN);
        const scroll = DOMCache[Config.SVG.SELECTORS.SCROLL];
        const slider = DOMCache[Config.SVG.SELECTORS.PROGBAR];
        
        slider.max = StateManager.get('totalDistance') - 0.0000001;
        scroll.children[0].style.height = `${slider.max}px`;
    }
};