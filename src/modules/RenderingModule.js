/**
 * @module RenderingModule
 * @description Handles SVG rendering and manipulation of path visualizations
 */

import { Config } from '../config/config.js';
import { SVGCreator } from './SVGCreator.js';
import { StateManager } from './StateManager.js';
import { UtilityModule } from './UtilityModule.js';

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

    /**
     * @function generateMask
     * @async
     * @param {string} points - SVG points string for masking
     * @param {string} source - Image source URL
     * @param {string} floor - Floor identifier
     * @returns {Promise<void>}
     * @description Generates a masked image for floor transitions
     */
    async generateMask(points, source, floor) {
        if (!points || !source || !floor) {
            console.warn('Missing parameters for mask generation');
            return;
        }
        
        const masks = StateManager.get('maskedImages') || {};
        if (masks[floor]) return;

        try {
            const response = await fetch(source, { cache: 'force-cache' });
            const blob = await response.blob();
            const bitmap = await createImageBitmap(blob, {
                premultiplyAlpha: 'premultiply',
                colorSpaceConversion: 'default'
            });
            
            const canvas = new OffscreenCanvas(2048, 1308);
            const ctx = canvas.getContext('2d', {
                alpha: true,
                willReadFrequently: false,
                desynchronized: true,
                antialias: false
            });
            
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(bitmap, 0, 0);
            
            ctx.globalCompositeOperation = 'destination-in';
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 2048, 1308);
            
            const coords = points.split(' ').map(p => p.split(',').map(Number));
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 50;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            coords.forEach(([x, y], i) => {
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.stroke();
            
            const resultBlob = await canvas.convertToBlob({
                type: 'image/webp',
                quality: 0.7
            });
            
            masks[floor] = URL.createObjectURL(resultBlob);
            StateManager.set('maskedImages', masks);
            bitmap.close();
        } catch (error) {
            console.error('Mask generation failed:', error);
            throw error;
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
            const masks = StateManager.get('maskedImages');
            console.log(path);
            if (!masks) {
                console.warn('No mask images available');
                return null;
            }

            const floor = path[0] > Config.THRESHOLD.FLOOR_CHANGE ? 'comb' : 'main';
            
            const image = document.querySelector(Config.SVG.SELECTORS.IMAGE);
            image.href.baseVal = masks[floor];

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



            UtilityModule.updateAgent();
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