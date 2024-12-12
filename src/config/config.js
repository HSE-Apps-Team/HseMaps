export const Config = {
    SVG: {
        NAMESPACE: 'http://www.w3.org/2000/svg',
        SELECTORS: {
            GRAPH: '#graph',
            SVGRAPH: '#svgraph',
            AGENT: '#agent',
            IMAGE: '#svgraph > g > image',
            PROGBAR: '#progbar',
            SCROLL: '#scroll'
        }
    },
    PATHS: {
        MAIN_FLOOR: '../src/elements/mainfloorcrunched.png',
        COMB_SCALED: '../src/elements/combscaled.png'
    },
    THRESHOLD: {
        FLOOR_CHANGE: 76,
        STAIR_DISTANCE: 10000
    },
    DEFAULTS: { MARGIN: 300 },
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