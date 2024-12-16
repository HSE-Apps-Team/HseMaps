import { createContext, useContext, useState } from 'react';

/**
 * @module StateManager
 * @description Manages global application state using a hybrid approach combining 
 * legacy object-based state and modern React Context API. Implements validation
 * rules for critical path properties to ensure data integrity.
 * 
 * @example
 * // Using legacy API
 * StateManager.set('path', [1, 2, 3]);
 * const path = StateManager.get('path');
 * 
 * // Using modern Context API
 * const { state, updateState } = useStateManager();
 * updateState('path', [1, 2, 3]);
 */

/**
 * @type {Object.<string, function>}
 * @description Validation functions that enforce data integrity rules:
 * - path: Must be an array for storing navigation waypoints
 * - totalDistance: Must be a non-negative number representing total path length
 * - currentPathSegment: Must be null or a non-negative number for current position
 */
const validators = {
    path: Array.isArray,
    totalDistance: value => typeof value === 'number' && value >= 0,
    currentPathSegment: value => value === null || (typeof value === 'number' && value >= 0)
};

// Maintain backward compatibility with existing code
const state = {
    totalDistance: 0,
    firstPathRendered: true,
    secondPathRendered: false,
    currentFloor: 'main',
    path: [],
    distanceDomain: [],
    currentPathSegment: null,
    maskedImages: null
};

// Legacy StateManager API
export const StateManager = {
    get: key => key ? state[key] : state,
    set: (key, value) => {
        if (validators[key] && !validators[key](value)) return false;
        state[key] = value;
        if (key === 'secondPathRendered') {
            state.currentFloor = value ? 'second' : 'main';
        }
        return true;
    }
};

// Modern React Context API
const StateContext = createContext({ state, updateState: () => {} });

export const StateProvider = ({ children }) => {
    const [contextState, setContextState] = useState(state);

    const updateState = (key, value) => {
        if (validators[key]?.(value) === false) return;
        
        setContextState(prev => ({
            ...prev,
            [key]: value,
            ...(key === 'secondPathRendered' && {
                currentFloor: value ? 'second' : 'main'
            })
        }));
        
        // Keep legacy state in sync
        StateManager.set(key, value);
    };

    return (
        <StateContext.Provider value={{ state: contextState, updateState }}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateManager = () => useContext(StateContext);