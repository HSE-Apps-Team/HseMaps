import { ImageModule } from './ImageModule.js';
import { DataModule } from './DataModule.js';
import { Config } from '../config/config.js';

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

/**
 * Checks if a connection involves stairwells based on Config.STAIRWELLS
 * @param {string} connectionId - Connection ID in format "source-target"
 * @returns {boolean} True if connection involves a stairwell node
 */
function isStairwellConnection(connectionId) {
    const [source, target] = connectionId.split('-').map(node => parseInt(node, 10));
    return Config.STAIRWELLS.includes(source) || Config.STAIRWELLS.includes(target);
}

/**
 * Checks for missing streetview images by comparing connections in StreetView.json
 * with the available images in the streetimages folder.
 * This function can be run directly from browser console.
 * Connections involving stairwell nodes are ignored.
 * 
 * @returns {Object} Results containing lists of found and missing images
 */
export function checkMissingStreetViewImages() {
    try {
        // Get street view data from DataModule
        const streetViewData = DataModule.get('imgs');
        
        if (!streetViewData || !Array.isArray(streetViewData)) {
            console.error('StreetView data not available or not in expected format');
            return { error: 'StreetView data not available' };
        }
        
        console.log(`Loaded StreetView data with ${streetViewData.length} rows`);
        
        // Extract all non-empty connections (unique)
        const connections = new Set();
        streetViewData.forEach(row => {
            row.forEach(cell => {
                if (cell && typeof cell === 'string' && cell.trim() !== '') {
                    connections.add(cell);
                }
            });
        });
        
        const uniqueConnections = Array.from(connections);
        console.log(`Found ${uniqueConnections.length} unique connections`);
        
        // Filter out stairwell connections
        const filteredConnections = uniqueConnections.filter(conn => !isStairwellConnection(conn));
        const stairwellConnections = uniqueConnections.filter(conn => isStairwellConnection(conn));
        
        console.log(`Ignoring ${stairwellConnections.length} stairwell connections`);
        console.log(`Checking ${filteredConnections.length} non-stairwell connections`);
        
        // Check each connection for an associated image using ImageModule
        const missingImages = [];
        const foundImages = [];
        
        filteredConnections.forEach(connectionId => {
            // Check for JPG and PNG formats
            const jpgImage = `${connectionId}.jpg`;
            const pngImage = `${connectionId}.png`;
            
            // Use the ImageModule to check if images exist
            const jpgUrl = ImageModule.getImageUrl(jpgImage);
            const pngUrl = ImageModule.getImageUrl(pngImage);
            
            if (!jpgUrl && !pngUrl) {
                const [source, target] = connectionId.split('-');
                missingImages.push({
                    connection: connectionId,
                    source,
                    target,
                    expectedImages: [jpgImage, pngImage]
                });
            } else {
                foundImages.push({
                    connection: connectionId,
                    imageName: jpgUrl ? jpgImage : pngImage
                });
            }
        });
        
        // Output results
        console.log('\n=== STREET VIEW IMAGES CHECK RESULTS ===');
        console.log(`Total connections (excluding stairwells): ${filteredConnections.length}`);
        console.log(`Images found: ${foundImages.length}`);
        console.log(`Images missing: ${missingImages.length}`);
        
        if (missingImages.length > 0) {
            console.log('\nMissing images:');
            console.table(missingImages);
        } else {
            console.log('\n✅ All non-stairwell connections have associated images');
        }
        
        return {
            total: filteredConnections.length,
            stairwellsIgnored: stairwellConnections.length,
            found: foundImages,
            missing: missingImages
        };
    } catch (error) {
        console.error('Error checking street view images:', error);
        return { error: error.message };
    }
}

/**
 * Analyzes the PrecomputedPaths data to find and rank the most common connections
 * in paths between any two nodes in the building.
 * 
 * @param {boolean} onlyMissingImages - If true, only return connections without StreetView images
 * @param {number} limit - Maximum number of connections to return (default: 20)
 * @returns {Array} Array of connection objects with usage statistics
 */
export function analyzePathConnections(onlyMissingImages = false, limit = 20) {
    try {
        // Load necessary data - only NextMatrix is needed
        const nextMatrix = DataModule.get('nextMatrix');
        
        if (!nextMatrix || !Array.isArray(nextMatrix) || nextMatrix.length === 0) {
            console.error('PrecomputedPaths data not available or invalid');
            return [];
        }
        
        console.log(`Analyzing ${nextMatrix.length} rows in precomputed paths matrix...`);
        
        // Store connection usage counts
        const connectionCounts = {};
        let totalPathsAnalyzed = 0;
        let pathsWithStairwells = 0;
        
        // Process each path in the precomputed paths matrix
        for (let source = 0; source < nextMatrix.length; source++) {
            // Skip if row doesn't exist
            if (!nextMatrix[source] || !Array.isArray(nextMatrix[source])) {
                continue;
            }
            
            for (let target = 0; target < nextMatrix[source].length; target++) {
                // Skip self-connections or null paths
                if (source === target || nextMatrix[source][target] === null) {
                    continue;
                }
                
                // Get the next node in the path from source to target
                const nextNode = nextMatrix[source][target];
                
                // This is the first hop in the path from source to target
                const connectionId = source < nextNode 
                    ? `${source}-${nextNode}` 
                    : `${nextNode}-${source}`;
                
                // Skip stairwell connections if appropriate
                if (isStairwellConnection(connectionId)) {
                    pathsWithStairwells++;
                    continue;
                }
                
                // Increment the connection count
                connectionCounts[connectionId] = (connectionCounts[connectionId] || 0) + 1;
                totalPathsAnalyzed++;
                
                // Now follow the path all the way to the target by repeatedly looking up the next hop
                let currentNode = nextNode;
                while (currentNode !== target) {
                    // Get the next node in the path
                    const nextInPath = nextMatrix[currentNode][target];
                    
                    // Handle unexpected null in path or loops
                    if (nextInPath === null || nextInPath === currentNode) {
                        break;
                    }
                    
                    // Create connection ID for this segment (normalize so smaller node ID is first)
                    const segmentConnectionId = currentNode < nextInPath 
                        ? `${currentNode}-${nextInPath}` 
                        : `${nextInPath}-${currentNode}`;
                    
                    // Skip stairwell connections
                    if (isStairwellConnection(segmentConnectionId)) {
                        pathsWithStairwells++;
                        currentNode = nextInPath;
                        continue;
                    }
                    
                    // Increment the connection count
                    connectionCounts[segmentConnectionId] = (connectionCounts[segmentConnectionId] || 0) + 1;
                    totalPathsAnalyzed++;
                    
                    currentNode = nextInPath;
                }
            }
        }
        
        // Convert to array and check which connections have images
        let connectionsArray = Object.entries(connectionCounts).map(([connectionId, count]) => {
            // Check if this connection has a StreetView image
            const jpgUrl = ImageModule.getImageUrl(`${connectionId}.jpg`);
            const pngUrl = ImageModule.getImageUrl(`${connectionId}.png`);
            const hasImage = !!(jpgUrl || pngUrl);
            
            // Get source and target node IDs
            const [source, target] = connectionId.split('-').map(id => parseInt(id, 10));
            
            return {
                connectionId,
                source,
                target,
                count,
                percentage: ((count / totalPathsAnalyzed) * 100).toFixed(2) + '%',
                hasImage
            };
        });
        
        // Filter for connections without images if requested
        if (onlyMissingImages) {
            connectionsArray = connectionsArray.filter(conn => !conn.hasImage);
        }
        
        // Sort by count (descending)
        connectionsArray.sort((a, b) => b.count - a.count);
        
        // Limit the number of results
        const results = connectionsArray.slice(0, limit);
        
        // Log summary
        console.log(`Analysis complete. ${totalPathsAnalyzed} total path segments analyzed.`);
        console.log(`Skipped ${pathsWithStairwells} stairwell connections.`);
        console.log(`Found ${connectionsArray.length} unique connections.`);
        
        if (onlyMissingImages) {
            console.log(`${results.length} most frequent connections without Street View images:`);
        } else {
            console.log(`${results.length} most frequently used connections:`);
        }
        
        // Format the results for console display
        console.table(results.map(conn => ({
            'Connection': conn.connectionId,
            'Count': conn.count,
            'Percentage': conn.percentage,
            'Has Image': conn.hasImage ? '✓' : '✗'
        })));
        
        return results;
    } catch (error) {
        console.error('Error analyzing path connections:', error);
        return [];
    }
}

// Make functions accessible from the browser console
if (typeof window !== 'undefined') {
    // Create a namespace for dev tools if it doesn't exist
    window.devTools = window.devTools || {};
    
    // Add the functions to the namespace
    window.devTools.checkMissingStreetViewImages = checkMissingStreetViewImages;
    window.devTools.analyzePathConnections = analyzePathConnections;
    window.devTools.analyzeMissingImageConnections = function(limit = 20) {
        return analyzePathConnections(true, limit);
    };
    
    console.log('Development tools loaded:');
    console.log('- devTools.checkMissingStreetViewImages() - Check for missing Street View images');
    console.log('- devTools.analyzePathConnections(onlyMissingImages = false, limit = 20) - Analyze most common paths');
    console.log('- devTools.analyzeMissingImageConnections(limit = 20) - Analyze most common paths with missing images');
}

