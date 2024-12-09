/**
 * PathfindingModule - Handles path construction and node selection for navigation
 * Provides methods for finding optimal paths between rooms and reconstructing paths
 * from precomputed matrices
 * 
 * @module PathfindingModule
 */
export const PathfindingModule = {
    /**
     * Constructs a path between two vertices using a next-vertex matrix
     * @param {number[][]} nextMatrix - Matrix containing next vertex in shortest path
     * @param {number} u - Starting vertex index
     * @param {number} v - Ending vertex index
     * @returns {number[]} Array of vertex indices forming the path
     * 
     * @example
     * // Given nextMatrix:
     * // [[0, 1, 2],
     * //  [1, 1, 2],
     * //  [2, 2, 2]]
     * constructPath(nextMatrix, 0, 2)
     * // Returns: [0, 1, 2]
     * 
     * @example Edge case - no path exists
     * constructPath(nextMatrix, 0, 3)
     * // Returns: []
     */
    constructPath(nextMatrix, u, v) {
        if (!nextMatrix[u]?.[v]) return [];
        const path = [u];
        while (path[path.length - 1] !== v) {
            const next = nextMatrix[path[path.length - 1]][v];
            if (!next && next !== 0) break;
            path.push(next);
        }
        return path;
    },

    /**
     * Selects the best node from a set based on minimum distance to goal nodes
     * @param {number[]} nodes - Array of candidate node indices
     * @param {number[]} goalNodes - Array of target node indices
     * @param {number[][]} distMatrix - Matrix of distances between nodes
     * @returns {number|null} Index of best node or null if no valid node found
     * 
     * @example
     * // Given distMatrix:
     * // [[0, 5, Infinity],
     * //  [5, 0, 3],
     * //  [Infinity, 3, 0]]
     * selectBestNode([0, 1], [2], distMatrix)
     * // Returns: 1 (node 1 has shortest path to goal node 2)
     * 
     * @example No valid path
     * selectBestNode([0], [2], distMatrix)
     * // Returns: null (no path from node 0 to goal node 2)
     */
    selectBestNode(nodes, goalNodes, distMatrix) {
        return nodes.reduce((best, node) => {
            const minDist = Math.min(...goalNodes.map(goal => 
                distMatrix[node]?.[goal] ?? Infinity
            ));
            return minDist < best.dist ? { node, dist: minDist } : best;
        }, { node: null, dist: Infinity }).node;
    },

    /**
     * Finds shortest path between two rooms using precomputed matrices
     * @param {number[][]} nextMatrix - Matrix containing next vertex in shortest path
     * @param {number[][]} distMatrix - Matrix of distances between nodes
     * @param {string} startRoom - Starting room identifier
     * @param {string} endRoom - Destination room identifier
     * @param {Object<string, number[]>} rooms - Map of room IDs to vertex indices
     * @returns {number[]} Array of vertex indices forming the shortest path
     * 
     * @example
     * // Given room mapping:
     * // rooms = { "ROOM101": [0, 1], "ROOM102": [2] }
     * minPathBtwRooms(nextMatrix, distMatrix, "ROOM101", "ROOM102", rooms)
     * // Returns: [1, 2] (shortest path from ROOM101 to ROOM102)
     * 
     * @example No valid path
     * minPathBtwRooms(nextMatrix, distMatrix, "ROOM101", "ROOM999", rooms)
     * // Returns: [] (no path exists or invalid room)
     */
    minPathBtwRooms(nextMatrix, distMatrix, startRoom, endRoom, rooms) {
        const startNode = this.selectBestNode(rooms[startRoom], rooms[endRoom], distMatrix);
        const endNode = this.selectBestNode(rooms[endRoom], [startNode], distMatrix);
        return this.constructPath(nextMatrix, startNode, endNode);
    }
};