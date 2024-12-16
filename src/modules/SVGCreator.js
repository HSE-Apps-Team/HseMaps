import { Config } from '../config/config.js';

/**
 * @module SVGCreator
 * @description Provides utilities for creating and configuring SVG elements
 * with proper namespace handling and attribute setting.
 */
export const SVGCreator = {
    /**
     * Creates an SVG element with specified attributes and class list.
     * @param {string} type - The type of SVG element to create (e.g., 'circle', 'path')
     * @param {Object} [attributes={}] - Key-value pairs of attributes to set on the element
     * @param {string[]} [classList=[]] - Array of CSS classes to apply to the element
     * @returns {SVGElement} The created SVG element
     * @throws {Error} When type is invalid or element creation fails
     */
    createElement(type, attributes = {}, classList = []) {
        try {
            if (!type || typeof type !== 'string') {
                throw new Error('Invalid SVG element type');
            }

            const element = document.createElementNS(Config.SVG.NAMESPACE, type);

            Object.entries(attributes).forEach(([key, value]) => {
                try {
                    if (key.includes('.')) {
                        key.split('.').reduce((obj, prop, i, arr) => {
                            if (i === arr.length - 1) {
                                if (obj && obj[prop] && 'value' in obj[prop]) {
                                    obj[prop].value = value;
                                }
                            }
                            return obj ? obj[prop] : null;
                        }, element);
                    } else {
                        element.setAttribute(key, value);
                    }
                } catch (attrError) {
                    console.warn(`Failed to set attribute ${key}:`, attrError);
                }
            });

            if (Array.isArray(classList) && classList.length) {
                element.classList.add(...classList.filter(c => typeof c === 'string'));
            }

            return element;
        } catch (error) {
            console.error('SVG element creation failed:', error);
            throw error;
        }
    }
};