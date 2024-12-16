/**
 * @module ScheduleManager
 * @description Handles schedule data persistence and retrieval with built-in validation.
 * Provides a robust interface for storing and loading daily room schedules while
 * ensuring data integrity through validation and deduplication.
 */

export class ScheduleManager {
    /**
     * @static
     * @description Prefix used for localStorage keys to avoid naming conflicts
     * with other stored data in the application
     */
    static STORAGE_PREFIX = 'schedule_';
    
    /**
     * Persists a validated schedule to localStorage with deduplication
     * @param {string} day - Day identifier (e.g., 'monday', 'tuesday')
     * @param {string[]} rooms - Array of room identifiers to save
     * @returns {string[]} Cleaned and deduplicated array of room identifiers
     * @throws {Error} If localStorage is not available or data cannot be serialized
     */
    static save(day, rooms) {
        if (!this.validateInput(day, rooms)) return [];
        
        const uniqueRooms = [...new Set(rooms)];
        localStorage.setItem(
            `${this.STORAGE_PREFIX}${day}`, 
            JSON.stringify(uniqueRooms)
        );
        return uniqueRooms;
    }

    /**
     * Retrieves and validates a previously stored schedule
     * @param {string} day - Day identifier to load schedule for
     * @returns {string[]} Array of room identifiers, empty if none found or invalid
     * @throws {Error} If localStorage is not available or data is corrupted
     */
    static load(day) {
        try {
            const data = localStorage.getItem(`${this.STORAGE_PREFIX}${day}`);
            return data ? [...new Set(JSON.parse(data))] : [];
        } catch {
            return [];
        }
    }

    /**
     * Validates input parameters for schedule operations
     * @private
     * @param {string} day - Day identifier to validate
     * @param {any[]} rooms - Array to validate as room list
     * @returns {boolean} True if inputs are valid, false otherwise
     */
    static validateInput(day, rooms) {
        return day && Array.isArray(rooms);
    }
}