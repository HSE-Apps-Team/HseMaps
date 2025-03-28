/**
 * @module PathfindingModule
 * @description Implements optimized pathfinding algorithms using Floyd-Warshall's pre-computed matrices.
 * Provides efficient path reconstruction and node selection based on distance heuristics.
 */

export class PathfindingModule {
    /**
     * Reconstructs optimal path using pre-computed next vertex information
     * @param {number[][]} nextMatrix - Pre-computed matrix where nextMatrix[i][j] represents 
     *                                  the next vertex to visit when going from i to j
     * @param {number} start - Index of starting vertex in the graph
     * @param {number} end - Index of destination vertex in the graph
     * @returns {number[]} Array of vertex indices forming the shortest path from start to end.
     *                     Returns empty array if no valid path exists.
     * @example
     * const path = PathfindingModule.constructPath(nextMatrix, 0, 5);
     * // Returns [0, 2, 3, 5] representing the optimal path from vertex 0 to 5
     */
    static constructPath(nextMatrix, start, end) {
        if (!this.validateMatrix(nextMatrix, start, end)) return [];
        
        const path = [start];
        let current = start;
        
        while (current !== end) {
            const next = nextMatrix[current]?.[end];
            if (next == null) break;
            path.push(next);
            current = next;
        }
        
        return path;
    }

    /**
     * Determines optimal node from candidates based on distance to goals
     * @param {number[]} nodes - Array of candidate node indices to evaluate
     * @param {number[]} goals - Array of target node indices to measure against
     * @param {number[][]} distMatrix - Matrix of pre-computed distances between all vertices
     * @returns {number|null} Index of the optimal node, or null if no valid node found
     * @example
     * const bestNode = PathfindingModule.selectBestNode([1,2,3], [10,11], distMatrix);
     * // Returns the node index from [1,2,3] that's closest to either 10 or 11
     */
    static selectBestNode(nodes, goals, distMatrix) {
        if (!nodes?.length || !goals?.length) return null;
        
        let bestNode = null;
        let bestDistance = Infinity;
        
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            let minDistToGoal = Infinity;
            
            for (let j = 0; j < goals.length; j++) {
                const goal = goals[j];
                const dist = distMatrix[node]?.[goal] ?? Infinity;
                if (dist < minDistToGoal) {
                    minDistToGoal = dist;
                }
            }
            
            if (minDistToGoal < bestDistance) {
                bestDistance = minDistToGoal;
                bestNode = node;
            }
        }
        
        return bestNode;
    }

    /**
     * Finds shortest path between rooms using precomputed matrices
     * @static
     * @param {Array<Array<number>>} nextMatrix - Next vertex matrix
     * @param {Array<Array<number>>} distMatrix - Distance matrix
     * @param {string} startRoom - Starting room identifier
     * @param {string} endRoom - Ending room identifier
     * @param {Object.<string, number[]>} rooms - Room to vertices mapping
     * @returns {number[]} Array of vertex indices forming the shortest path
     */
    static findShortestPath(nextMatrix, distMatrix, startRoom, endRoom, rooms) {
        if (!rooms[startRoom] || !rooms[endRoom]) return [];
        if (startRoom === endRoom) return [];

        const startNode = this.selectBestNode(rooms[startRoom], rooms[endRoom], distMatrix);
        if (startNode == null) return [];

        const endNode = this.selectBestNode(rooms[endRoom], [startNode], distMatrix);
        if (endNode == null) return [];

        return this.constructPath(nextMatrix, startNode, endNode);
    }

    /**
     * Validates path finding input parameters
     * @private
     */
    static validateMatrix(matrix, start, end) {
        return matrix?.[start]?.[end] != null;
    }
}