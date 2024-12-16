/**
 * @module AuthContext
 * @description Authentication context provider with default state and type definitions
 */

import { createContext } from "react";

/**
 * @typedef {Object} AuthState
 * @property {boolean} isAuth - Authentication status
 * @property {Object|null} user - User information
 * @property {string} user.displayName - User's display name
 * @property {string} user.homeAccountId - User's account ID
 */

/**
 * @type {AuthState}
 */
const defaultState = {
    isAuth: false,
    user: null
};

export default createContext(defaultState);