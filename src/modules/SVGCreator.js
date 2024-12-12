/**
 * SVGCreator - Utility module for creating SVG elements with attributes
 * Handles complex attribute paths and class assignments
 * 
 * @module SVGCreator
 */
import { Config } from '../config/config.js';

export const SVGCreator = {
    /**
     * Creates an SVG element with specified attributes and classes
     * Supports dot notation for complex attribute paths
     * 
     * @param {string} type - SVG element type (e.g., 'circle', 'polyline')
     * @param {Object} attributes - Key-value pairs of attributes to set
     * @param {string[]} classList - Array of CSS classes to add
     * @returns {SVGElement} Created SVG element
     * 
     * @example Simple circle
     * createElement('circle', {
     *   cx: 100,
     *   cy: 100,
     *   r: 10,
     *   fill: 'red'
     * })
     * // Returns: <circle cx="100" cy="100" r="10" fill="red"/>
     * 
     * @example Complex attributes with dot notation
     * createElement('circle', {
     *   'cx.baseVal': 100,
     *   'cy.baseVal': 100,
     *   'r.baseVal': 10
     * })
     * // Returns: <circle> with baseVal properties set
     * // circle.cx.baseVal = 100
     * // circle.cy.baseVal = 100
     * // circle.r.baseVal = 10
     * 
     * @example Element with classes
     * createElement('polyline', 
     *   { points: '0,0 100,100' },
     *   ['line', 'selected']
     * )
     * // Returns: <polyline points="0,0 100,100" class="line selected"/>
     * 
     * @example Mixed attributes
     * createElement('path', {
     *   'd': 'M0 0L100 100',
     *   'stroke-width': 2,
     *   'transform.baseVal.consolidate': null
     * }, ['path', 'animated'])
     * // Returns: <path d="M0 0L100 100" stroke-width="2" class="path animated"/>
     * // with transform.baseVal.consolidate() called
     */
    createElement(type, attributes = {}, classList = []) {
        // Create element with correct namespace
        const element = document.createElementNS(Config.SVG.NAMESPACE, type);

        // Apply attributes
        Object.entries(attributes).forEach(([key, value]) => {
            key.includes('.') 
                // Handle nested properties (e.g., 'cx.baseVal')
                ? key.split('.').reduce((obj, prop, i, arr) => 
                    i === arr.length - 1 ? obj[prop].value = value : obj[prop], element)
                // Set direct attributes
                : element.setAttribute(key, value);
        });

        // Add classes if provided
        if (classList.length) element.classList.add(...classList);

        return element;
    }
};