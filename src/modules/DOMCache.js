/**
 * @module DOMCache
 * @description React-optimized DOM element caching with ref management

*/

import { useRef, useEffect } from 'react';

const elementCache = new Map();

// Legacy DOMCache API
export const DOMCache = new Proxy({}, {
    get: (_, selector) => {
        if (typeof selector !== 'string') return undefined;
        
        if (!elementCache.has(selector) || !elementCache.get(selector).isConnected) {
            const element = document.querySelector(selector);
            if (element) elementCache.set(selector, element);
        }
        
        return elementCache.get(selector) || null;
    }
});

// Modern React hooks
export const useElementRef = (selector) => {
    const ref = useRef(null);
    
    useEffect(() => {
        if (!selector) return;
        ref.current = document.querySelector(selector);
    }, [selector]);
    
    return ref;
};