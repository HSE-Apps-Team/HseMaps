/**
 * @module Config
 * @description Core configuration constants and settings for the navigation system
 */
export const Config = {
    /** @namespace SVG - SVG-related configuration */
    SVG: {
        /** @constant {string} NAMESPACE - SVG namespace URI */
        NAMESPACE: 'http://www.w3.org/2000/svg',
        /** @namespace SELECTORS - DOM element selectors */
        SELECTORS: {
            GRAPH: '#graph',
            SVGRAPH: '#svgraph',
            AGENT: '#agent',
            IMAGE: '#svgraph > g > image',
            PROGBAR: '#progbar',
            SCROLL: '#scroll',
            SVG: '#svg',
            SVGDIV: '#svgdiv'
        }
    },
    /** @namespace PATHS - Asset file paths */
    PATHS: {
        MAIN_FLOOR: '../src/elements/mainfloorcrunched.png',
        COMB_SCALED: '../src/elements/combscaled.png',
        STREET_VIEW: '../src/elements/StreetImages/'
    },
    /** @namespace THRESHOLD - System thresholds and limits */
    THRESHOLD: {
        FLOOR_CHANGE: 76,
        STAIR_DISTANCE: 10000
    },
    /** @namespace DEFAULTS - Default system values */
    DEFAULTS: { MARGIN: 300 },
    /** @namespace LOG - Authentication and logging configuration */
    LOG: {
        SELECTORS: {
            EMAIL: '#email',
            PASSWORD: '#password',
            RETRY: '#retry',
            SUBMIT: '#submit'
        },
        VALID_EMAILS: '../src/elements/ValidEmails.json',
        VALID_PASSWORDS: '../src/elements/ValidPasswords.json'
    }
};