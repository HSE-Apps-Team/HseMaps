import { Config } from '../config/config.js';
import { SVGCreator } from './SVGCreator.js';
import { StateManager } from './StateManager.js';
import { UtilityModule } from './UtilityModule.js';

/**
 * RenderingModule - Handles SVG element creation and manipulation
 * Manages path visualization, agent movement, and viewport control
 * 
 * @module RenderingModule
 */
export const RenderingModule = {
    /**
     * Creates and appends SVG points and agent for path visualization
     * @param {number[]} points - Array of vertex coordinates
     * @param {object} graph - SVG graph container element
     * @returns {SVGPolylineElement} Created path line element
     * 
     * @example
     * // Given vertices at [(100,100), (200,200)]
     * createLine([[100,100], [200,200]], graphElement)
     * // Creates: <polyline points="100,100 200,200" class="line gen"/>
     */
    createLine(points, graph = document.querySelector("svg > g > g > g")) {
        const path = SVGCreator.createElement('polyline', {
            points,
            class: 'line gen'
        });
        graph.insertAdjacentElement("beforeend", path);
        return path;
    },

    selectPath(path, verts, start = "startpt", end = "endpt", graph = document.getElementById("graph")) {
        const image = document.querySelector(Config.SVG.SELECTORS.IMAGE);
        image.href.baseVal = path[0] > Config.THRESHOLD.FLOOR_CHANGE 
            ? Config.PATHS.COMB_SCALED 
            : Config.PATHS.MAIN_FLOOR;

        const points = path.map(p => `${verts[p].x},${verts[p].y}`).join(' ');
        const line = this.createLine(points, graph);
        line.classList.add("selected");

        const startPoint = SVGCreator.createElement('circle', {
            'cx.baseVal': verts[path[0]].x,
            'cy.baseVal': verts[path[0]].y,
            'r.baseVal': 10,
            id: start
        }, ['gen']);

        const agent = startPoint.cloneNode(true);
        agent.id = 'agent';

        const endPoint = SVGCreator.createElement('circle', {
            'cx.baseVal': verts[path[path.length - 1]].x,
            'cy.baseVal': verts[path[path.length - 1]].y,
            'r.baseVal': 10,
            id: end
        }, ['gen']);

        [startPoint, agent, endPoint].forEach(el => 
            graph.insertAdjacentElement("beforeend", el));

        UtilityModule.updateAgent();
        return line;
    },

    /**
     * Updates viewport focus to center on specified element
     * @param {SVGElement} element - Element to focus on
     * @param {number} margin - Padding around focused element
     * @param {SVGSVGElement} svg - SVG container element
     * 
     * @example
     * // Given:
     * element = <circle cx="150" cy="150" r="10"/>
     * margin = 20
     * 
     * focus(element, 20)
     * // Results in viewBox:
     * // x = 140 (150 - 20/2)
     * // y = 140 (150 - 20/2)
     * // width = element.width + 20
     * // height = element.height + 20
     */
    focus(element, margin = 5, svg = document.getElementById("svg")) {
        const map = svg.viewBox.baseVal;
        const focus = element.getBBox();
        map.x = focus.x - margin / 2;
        map.y = focus.y - margin / 2;
        map.width = focus.width + margin;
        map.height = focus.height + margin;
    },

    /**
     * Clears current path visualization and resets navigation state
     * Removes all generated elements and resets transition flags
     * 
     * @example
     * // Before:
     * // <polyline class="gen"/>
     * // <circle class="gen"/>
     * refresh()
     * // After:
     * // - All elements with class "gen" removed
     * // - skipStart = true
     * // - skipEnd = false
     */
    refresh() {
        const selected = document.getElementsByClassName("gen");
        Array.from(selected).forEach(el => el.remove());
        StateManager.set('skipStart', () => true);
        StateManager.set('skipEnd', () => false);
    }
};