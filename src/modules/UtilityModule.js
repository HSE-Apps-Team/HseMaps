import { Config } from '../config/config.js';
import { StateManager } from './StateManager.js';
import { DOMCache } from './DOMCache.js';
import { ColorModule } from './ColorModule.js';
import { PathTransitionHandler } from './PathTransitionHandler.js';
import { RenderingModule } from './RenderingModule.js';
import { DataModule } from './DataModule.js';
import { PathfindingModule } from './PathfindingModule.js';
import { StreetViewModule } from './StreetViewModule.js';

/**
 * UtilityModule - Core functionality for agent movement and path tracking
 * Manages agent position updates, orientation calculations, and path transitions
 * 
 * @module UtilityModule
 */
export const UtilityModule = {


    /**
     * Updates agent position, color, and orientation based on scroll progress
     * Handles both first and second floor path transitions
     * 
     * @param {number} margin - Viewport margin around agent
     * 
     * @example First floor movement
     * // Given:
     * StateManager.get('secondPathRendered') = false
     * progbar.value = 50
     * progbar.max = 200
     * path.getTotalLength() = 100
     * 
     * updateAgent(300)
     * // Results in:
     * // - agent positioned at path.getPointAtLength(50)
     * // - agent color = yellow (50/200 completion)
     * // - viewport centered on agent with 300px margin
     * 
     * @example Second floor transition
     * // Given:
     * StateManager.get('secondPathRendered') = true
     * StateManager.get('totalDistance') = 200
     * progbar.value = 150
     * path.getTotalLength() = 100
     * 
     * updateAgent()
     * // Results in:
     * // dist = -(200 - 150 - 100) = 50
     * // - agent positioned at path.getPointAtLength(50)
     * // - agent color = green (150/200 completion)
     */
    updateAgent(margin = Config.DEFAULTS.MARGIN) {
        const elements = {
            agent: DOMCache[Config.SVG.SELECTORS.AGENT],
            path: DOMCache[`${Config.SVG.SELECTORS.GRAPH} > polyline`],
            progbar: DOMCache[Config.SVG.SELECTORS.PROGBAR],
            svg: DOMCache[Config.SVG.SELECTORS.SVGRAPH],
            image: DOMCache[Config.SVG.SELECTORS.IMAGE]
        };

        if (!Object.values(elements).every(el => el?.isConnected)) return;

        try {
            const { agent, path, progbar, svg, image } = elements;
            const sliderValue = progbar.value;
            const sliderCompletion = sliderValue / progbar.max;
            
            const distanceDomain = StateManager.get('distanceDomain');
            const currentPathSegment = distanceDomain.findIndex((e,i) => 
                sliderValue >= distanceDomain[i] && sliderValue < (distanceDomain[i + 1] || Infinity)
            );
            StateManager.set('currentPathSegment', currentPathSegment);
            // Calculate distance based on floor
            const dist = StateManager.get('secondPathRendered')
                ? -(StateManager.get('totalDistance') - sliderValue - path.getTotalLength())
                : sliderValue;

            const point = path.getPointAtLength(dist);
            const nextPoint = path.getPointAtLength(Number(dist) + 10);
            
            UtilityModule.updateAgentPosition(agent, point, nextPoint, svg, margin);
            agent.style.fill = ColorModule.getColor(sliderCompletion);
            
            PathTransitionHandler.handleTransition(path, sliderValue, StateManager.get('totalDistance'));
            //image.href.baseVal = StreetViewModule.getImg();
        } catch (error) {
            console.error('Agent update failed:', error);
        }
    },

          /**
     * Updates agent position and orientation on the SVG path
     * Calculates rotation angle based on next point
     * 
     * @param {SVGCircleElement} agent - Agent circle element
     * @param {SVGPoint} point - Current point on path
     * @param {SVGPoint} nextPoint - Next point for orientation
     * @param {SVGElement} svg - SVG container element
     * @param {number} margin - Viewport margin
     * 
     * @example
     * // Given:
     * point = {x: 100, y: 100}
     * nextPoint = {x: 110, y: 110}
     * 
     * updateAgentPosition(agent, point, nextPoint, svg, 300)
     * // Results in:
     * // - agent.cx.baseVal.value = 100
     * // - agent.cy.baseVal.value = 100
     * // - svg rotation = 315 degrees (pointing northeast)
     * // - viewport centered on agent with 300px margin
     */
          updateAgentPosition(agent, point, nextPoint, svg, margin) {
            agent.cx.baseVal.value = point.x;
            agent.cy.baseVal.value = point.y;
            RenderingModule.focus(agent, margin);
            
            const orientation = 270 - (Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180 / Math.PI);
            svg.setAttribute("style", `transform-origin: ${point.x}px ${point.y}px; transform: rotate(${orientation}deg)`);
        },

    /**
     * Calculates and renders shortest path between two locations
     * Handles floor transitions and stairwell detection
     * 
     * @param {string} start - Starting room identifier (e.g., "ROOM101")
     * @param {string} end - Destination room identifier (e.g., "ROOM201")
     * @returns {SVGPolylineElement} Created path element
     * 
     * @example Single floor path
     * // Given:
     * start = "ROOM101"  // Room on first floor
     * end = "ROOM102"    // Room on first floor
     * rooms = {
     *   "ROOM101": [0],  // Vertex index 0
     *   "ROOM102": [5]   // Vertex index 5
     * }
     * 
     * markShortestPath("ROOM101", "ROOM102")
     * // Results in:
     * // - path = [0, 2, 4, 5]
     * // - totalDistance = 150
     * // - Returns: <polyline points="100,100 150,100..."/>
     * 
     * @example Floor transition path
     * // Given:
     * start = "ROOM101"  // First floor
     * end = "ROOM201"    // Second floor
     * distMatrix[4][5] >= Config.THRESHOLD.STAIR_DISTANCE
     * 
     * markShortestPath("ROOM101", "ROOM201")
     * // Results in:
     * // - First floor path rendered: [0, 2, 4]
     * // - Stairwell transition registered at index 4
     * // - onPathStart/End handlers set for floor transition
     */
    markShortestPath(start, end) {
        RenderingModule.refresh();
        StateManager.set('onPathEnd', () => {});
        StateManager.set('onPathStart', () => {});
        
        const { nextMatrix, distMatrix, rooms, verts } = DataModule.get();
        const path = PathfindingModule.minPathBtwRooms(nextMatrix, distMatrix, start, end, rooms);
        StateManager.set('totalDistance', distMatrix[path[0]][path[path.length - 1]]);
        StateManager.set('path', path);

        // Recalculate distance domain to handle stairwells smoothly
        const distanceDomain = [];
        let accumulatedDist = 0;
        
        for (let i = 0; i < path.length; i++) {
            distanceDomain[i] = accumulatedDist;
            if (i < path.length - 1 && distMatrix[path[i]][path[i + 1]] < Config.THRESHOLD.STAIR_DISTANCE) {
                let segmentDist = distMatrix[path[i]][path[i + 1]];
                // Don't subtract stair distance, just use actual segment length
                accumulatedDist += segmentDist;
            }
        }
        
        StateManager.set('distanceDomain', distanceDomain);
        for (let i = 0; i < path.length-1; i++) {
            if (distMatrix[path[i]][path[i + 1]] === Config.THRESHOLD.STAIR_DISTANCE) {
                this.handleStairTransition(path, i+1, distMatrix, verts);
                return RenderingModule.selectPath(path.slice(0, i+1), verts, undefined, "stairwell");
            }
        }
        return RenderingModule.selectPath(path, verts);
    },

    /**
     * Configures state and handlers for floor transitions via stairwell
     * Sets up callbacks for transitioning between floors and manages path segments
     * 
     * @param {number[]} path - Array of vertex indices for complete path
     * @param {number} index - Index where stair transition occurs
     * @param {number[][]} distMatrix - Distance matrix between vertices
     * @param {Object[]} verts - Array of vertex coordinates {x,y}
     * 
     * @example Complete floor transition
     * // Given:
     * path = [0, 1, 4, 77, 80]    // 0-4 first floor, 77-80 second floor
     * index = 3                    // Transition at vertex 77
     * distMatrix = [              // Distance matrix with stair connection
     *   [0, 5, Infinity, ...],
     *   [5, 0, 10, ...],
     *   ...
     *   [Infinity, 10000, 0, ...]
     * ]
     * verts = [
     *   {x: 100, y: 100},        // Vertex 0
     *   {x: 150, y: 100},        // Vertex 1
     *   {x: 150, y: 200}         // Vertex 4
     *   // ... more vertices
     * ]
     * 
     * handleStairTransition(path, 3, distMatrix, verts)
     * // Results in:
     * 
     * // 1. Total distance adjustment:
     * // totalDistance = originalDistance - distMatrix[4][77]
     * 
     * // 2. onPathStart handler set:
     * // When first floor revisited:
     * // - Clears existing path
     * // - Creates path: [0, 1, 4]
     * // - Sets skipEnd=false, skipStart=true
     * // - Configures scroll for new path
     * 
     * // 3. onPathEnd handler set:
     * // When reaching second floor:
     * // - Clears existing path
     * // - Creates path: [77, 80]
     * // - Sets skipStart=false, skipEnd=true
     * // - Configures scroll for new path
     */
    handleStairTransition(path, index, distMatrix, verts) {
        StateManager.set('totalDistance', 
            StateManager.get('totalDistance') - distMatrix[path[index - 1]][path[index]]
        );
        
        // Configure handler for returning to first floor
        StateManager.set('onPathStart', () => {
            if (!StateManager.get('skipStart')()) {
                RenderingModule.refresh();
                StateManager.set('skipEnd', () => false);
                StateManager.set('skipStart', () => true);
                
                // Use path segment to determine first floor section
                RenderingModule.selectPath(
                    path.slice(0, index),
                    verts, 
                    undefined, 
                    "stairwell"
                );
                this.configureScroll();
            }
        });

        // Configure handler for transitioning to second floor
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
     * Configures scroll container and progress slider based on path length
     * Centers viewport on agent and synchronizes scroll height with path distance
     * 
     * @example Basic configuration
     * // Given:
     * StateManager.get('totalDistance') = 500
     * DOMCache[Config.SVG.SELECTORS.AGENT] = <circle cx="150" cy="200" r="10"/>
     * 
     * configureScroll()
     * // Results in:
     * // 1. Viewport adjustment:
     * // - Centers on (150,200)
     * // - Adds Config.DEFAULTS.MARGIN (300px) padding
     * // - Sets viewBox to approximately (0,50,300,300)
     * 
     * // 2. Scroll/Slider setup:
     * // - slider.max = 500
     * // - scroll.children[0].style.height = "500px"
     * 
     * @example No agent element
     * // Given:
     * DOMCache[Config.SVG.SELECTORS.AGENT] = null
     * 
     * configureScroll()
     * // Returns early with no changes
     * 
     * @example Path transition
     * // During floor transition:
     * // 1. Initial state:
     * // - totalDistance = 800
     * // - scroll height = 800px
     * 
     * // 2. After stair transition:
     * // - totalDistance reduced by stair distance
     * // - totalDistance = 600
     * configureScroll()
     * // - scroll height updates to 600px
     * // - slider.max = 600
     * // - viewport re-centers on agent position
     */
    configureScroll() {
        const element = DOMCache[Config.SVG.SELECTORS.AGENT];
        if (!element) return;
        
        RenderingModule.focus(element, Config.DEFAULTS.MARGIN);
        const scroll = DOMCache[Config.SVG.SELECTORS.SCROLL];
        const slider = DOMCache[Config.SVG.SELECTORS.PROGBAR];
        
        slider.max = StateManager.get('totalDistance');
        scroll.children[0].style.height = `${slider.max}px`;
    }
};