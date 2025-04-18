/**
 * @module RenderingModule
 * @description Handles SVG rendering and manipulation of path visualizations
 */

import { Config } from '../config/config.js';
import { SVGCreator } from './SVGCreator.js';
import { StateManager } from './StateManager.js';
import { NavigationController } from './NavigationController.js';
import mainFloorImage from '../elements/mainfloorcrunched.png';
import secondFloorImage from '../elements/combscaled.png';

export const RenderingModule = {
    /**
     * @function createLine
     * @param {string} points - SVG points string for polyline
     * @param {SVGElement} [graph] - Parent SVG group element
     * @returns {SVGPolylineElement|null} Created line element or null if failed
     * @description Creates an SVG polyline element for path visualization
     */
    createLine(points, graph = document.querySelector("svg > g > g > g")) {
        if (!points || !graph) {
            console.warn('Invalid parameters for line creation');
            return null;
        }
        const path = SVGCreator.createElement('polyline', {
            points,
            class: 'line gen'
        });
        graph.insertAdjacentElement("beforeend", path);
        return path;
    },
    getFloor(path, vertices) {
        if (!path?.length || !vertices) {
            console.warn('Invalid path or vertices data');
            return null;
        }
        let floor = path[0] > Config.THRESHOLD.FLOOR_CHANGE ? 'comb' : 'main';
        let level = undefined;
        if(floor === 'comb') {
            level = 'Second';
        } else if (floor === 'main') { 
            level = 'First';
        };
        return level;
    },
    getIMG(level) {
        if (level === 'Second') {
            return secondFloorImage;
        } else if (level === 'First') {
            return mainFloorImage;
        } else {
            console.warn('Invalid level for image retrieval');
            return null;
        }
    },
    /**
     * @function selectPath
     * @async
     * @param {number[]} path - Array of vertex indices
     * @param {Object[]} vertices - Array of vertex coordinates
     * @param {string} [start="startpt"] - Start point ID
     * @param {string} [end="endpt"] - End point ID
     * @param {SVGElement} [graph] - Parent SVG element
     * @returns {Promise<SVGElement|null>} Created path element or null if failed
     * @description Visualizes a selected path on the map
     */
    async selectPath(path, vertices, start = "startpt", end = "endpt", graph = document.getElementById("graph")) {
        if (!path?.length || !vertices) {
            console.warn('Invalid path or vertices data');
            return null;
        }
        try {
   

            
            const image = document.querySelector(Config.SVG.SELECTORS.IMAGE);
            image.href.baseVal = this.getIMG(this.getFloor(path, vertices));
            document.getElementById("overlappingText").innerText = this.getFloor(path, vertices) + ' Floor';

            const points = path.map(p => `${vertices[p].x},${vertices[p].y}`).join(' ');
            const line = this.createLine(points, graph);
            line.classList.add("selected");

            const startPoint = SVGCreator.createElement('circle', {
                'cx.baseVal': vertices[path[0]].x,
                'cy.baseVal': vertices[path[0]].y,
                'r.baseVal': 10,
                id: start
            }, ['gen']);

            const agent = startPoint.cloneNode(true);
            agent.id = 'agent';

            const endPoint = SVGCreator.createElement('circle', {
                'cx.baseVal': vertices[path[path.length - 1]].x,
                'cy.baseVal': vertices[path[path.length - 1]].y,
                'r.baseVal': 10,
                id: end
            }, ['gen']);

            [startPoint, agent, endPoint].forEach(el => 
                graph.insertAdjacentElement("beforeend", el));



            NavigationController.updateAgentPosition();
            return line;
        } catch (error) {
            console.error('Path selection failed:', error);
            this.displayError('Failed to display path');
            return null;
        }
    },

    /**
     * @function focus
     * @param {SVGElement} element - Element to focus on
     * @param {number} [margin=5] - Margin around focused element
     * @param {SVGElement} [svg] - Parent SVG element
     * @description Adjusts viewport to focus on a specific element
     */
    focus(element, margin = 5, svg = document.getElementById("svg")) {
        if (!element || !svg) {
            console.warn('Missing elements for focus');
            return;
        }
        margin = 500
        const map = svg.viewBox.baseVal;
        const focus = element.getBBox();
        map.x = focus.x - margin / 2;
        map.y = focus.y - margin / 2;
        map.width = focus.width + margin;
        map.height = focus.height + margin;
    },

    /**
     * @function refresh
     * @description Clears all generated elements and resets path state
     */
    refresh() {
        try {
            const selected = document.getElementsByClassName("gen");
            Array.from(selected).forEach(el => el.remove());
            StateManager.set('skipStart', () => true);
            StateManager.set('skipEnd', () => false);
        } catch (error) {
            console.error('Refresh failed:', error);
        }
    },

    /**
     * @function displayError
     * @param {string} message - Error message to display
     * @description Shows a temporary error message to the user
     */
    displayError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }
};