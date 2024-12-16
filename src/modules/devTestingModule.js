/**
 * Converts a node-to-rooms mapping into a room-to-nodes mapping.
 * @param {Object.<string, string[]>} obj - Object mapping node IDs to arrays of room names
 * @returns {Object.<string, string[]>} Object mapping room names to arrays of node IDs
 * @throws {Error} If input is null, undefined, or not an object
 */
export function flipKeyValuePairWithMultiNodes(obj) {
    if (!obj || typeof obj !== 'object') {
        throw new Error('Input must be a valid object mapping nodes to rooms');
    }

    const flipped = {};
    try {
        for (const [node, rooms] of Object.entries(obj)) {
            if (!Array.isArray(rooms)) {
                console.warn(`Invalid room array for node ${node}, skipping`);
                continue;
            }

            rooms.forEach(room => {
                if (typeof room !== 'string') {
                    console.warn(`Invalid room type for node ${node}, skipping`);
                    return;
                }
                if (!flipped[room]) flipped[room] = [];
                if (!flipped[room].includes(node)) {
                    flipped[room].push(node);
                }
            });
        }
        return flipped;
    } catch (error) {
        console.error('Error flipping node-room mapping:', error);
        return {};
    }
}

