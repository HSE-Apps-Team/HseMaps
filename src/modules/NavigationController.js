/**
 * @module NavigationController
 * @description Centralized controller for navigation state, transitions, and updates
 */
import { Config } from '../config/config.js';
import { StateManager } from './StateManager.js';
import { DOMCache } from './DOMCache.js';
import { ColorModule } from './ColorModule.js';
import { PathTransitionHandler } from './PathTransitionHandler.js';
import { RenderingModule } from './RenderingModule.js';
import { DataModule } from './DataModule.js';
import { ResourceManager } from './ResourceManager.js';

export const NavigationController = {

    /**
     * Updates the agent position based on current scroll/slider position
     * @param {number} [margin=Config.DEFAULTS.MARGIN] - Margin for focusing
     */
    updateAgentPosition(margin = Config.DEFAULTS.MARGIN) {
        const elements = {
            agent: DOMCache[Config.SVG.SELECTORS.AGENT],
            path: DOMCache[`${Config.SVG.SELECTORS.GRAPH} > polyline`],
            progbar: DOMCache[Config.SVG.SELECTORS.PROGBAR],
            svg: DOMCache[Config.SVG.SELECTORS.SVGRAPH],
            svgdiv: DOMCache[Config.SVG.SELECTORS.SVGDIV]
        };

        // Validate elements
        const path = StateManager.get('path');
        if (path?.length && !Object.values(elements).every(el => el?.isConnected)) {
            console.debug('Some UI elements not yet available');
            return;
        }

        try {
            const { agent, path, progbar, svg, svgdiv } = elements;
            const sliderValue = progbar.value;
            const distanceDomain = StateManager.get('distanceDomain');
            
            // Calculate current path segment
            const currentPathSegment = distanceDomain.findIndex((e, i) => 
                sliderValue >= distanceDomain[i] && sliderValue < (distanceDomain[i + 1] || Infinity)
            );
            
            // Update state and background image
            const prevSegment = StateManager.get('currentPathSegment');
            StateManager.set('currentPathSegment', currentPathSegment);
            
            if (prevSegment !== currentPathSegment) {
                svgdiv.style.backgroundImage = `url(${ResourceManager.getPathSegmentImage()})`;
            }
            
            // Position the agent
            const sliderCompletion = sliderValue / progbar.max;
            const dist = StateManager.get('secondPathRendered')
                ? -(StateManager.get('totalDistance') - sliderValue - path.getTotalLength())
                : sliderValue;
            
            const point = path.getPointAtLength(dist);
            const nextPoint = path.getPointAtLength(Number(dist) + 10);
            
            this.positionAgent(agent, point, nextPoint, svg, margin);
            agent.style.fill = ColorModule.getColor(sliderCompletion);
            
            // Handle floor transitions
            PathTransitionHandler.handleTransition();
        } catch (error) {
            console.error('Agent update failed:', error);
        }
    },
    
    /**
     * Positions and rotates the agent correctly on the path
     */
    positionAgent(agent, point, nextPoint, svg, margin) {
        const dx = nextPoint.x - point.x;
        const dy = nextPoint.y - point.y;
        agent.cx.baseVal.value = point.x;
        agent.cy.baseVal.value = point.y;
        const orientation = 270 - (Math.atan2(dy, dx) * 180 / Math.PI);
        let rotate = 'transform: rotate(90deg)';
        if(localStorage.useRotate == 'true' || StateManager.flagRotate == false) {
            rotate = `transform: rotate(${orientation}deg)`;
            StateManager.flagRotate = true;
        } 
        RenderingModule.focus(agent, margin);
        svg.setAttribute("style", `transform-origin: ${point.x}px ${point.y}px; ` + rotate);
    },
    
    /**
     * Initializes and renders the path for navigation
     */
    initializePath(path) {
        if (!path?.length) {
            console.warn('No path to render');
            return;
        }

        // Reset the rendering state
        RenderingModule.refresh();
        StateManager.set('currentPathSegment', 0);
        StateManager.set('onPathEnd', () => {});
        StateManager.set('onPathStart', () => {});
        
        // Calculate distance information
        const { distMatrix, verts } = DataModule.get();
        StateManager.set('totalDistance', distMatrix[path[0]][path[path.length - 1]]);
        StateManager.set('path', path);
        
        // Preload images for smoother navigation
        ResourceManager.preloadImagesForPath(path);

        // Create distance domain for path navigation
        const distanceDomain = [];
        let accumulatedDist = 0;
        
        for (let i = 0; i < path.length; i++) {
            distanceDomain[i] = accumulatedDist;
            if (i < path.length - 1 && distMatrix[path[i]][path[i + 1]] < Config.THRESHOLD.STAIR_DISTANCE) {
                accumulatedDist += distMatrix[path[i]][path[i + 1]];
            }
        }
        
        StateManager.set('distanceDomain', distanceDomain);
        
        // Handle stair transitions if present
        for (let i = 0; i < path.length - 1; i++) {
            if (distMatrix[path[i]][path[i + 1]] === Config.THRESHOLD.STAIR_DISTANCE) {
                this.configureStairTransition(path, i + 1, distMatrix, verts);
                return RenderingModule.selectPath(path.slice(0, i + 1), verts, undefined, "stairwell");
            }
        }
        
        return RenderingModule.selectPath(path, verts);
    },
    
    /**
     * Configures stair transitions between floors
     */
    configureStairTransition(path, index, distMatrix, verts) {
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
     * Configures scroll and slider for path navigation
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
