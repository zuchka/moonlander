import Matter from 'matter-js';
import { Entities } from '@/src/entities'; // Import Entities type for better typing

/**
 * The UISystem calculates display values and dispatches them for the UI overlay.
 *
 * @param entities The current state of all game entities.
 * @param dispatch The dispatch function from the game engine.
 * @returns The entities state (unchanged by this system).
 */
const UISystem = (entities: Entities, { dispatch }: any) => {
    const landerBody = entities.lander?.body;
    const gameState = entities.gameState;

    if (!landerBody || !gameState) {
        return entities; // Required entities missing
    }

    const landerX = landerBody.position.x;
    const landerY = landerBody.position.y;

    // --- Calculate Altitude Above Terrain --- START
    let terrainY = 0; // Default ground level if off-terrain
    let altitude = 0;
    const lander = entities.lander; // Get lander entity for size

    // Iterate through terrain entities using Object.keys
    Object.keys(entities).forEach(key => {
        if (key.startsWith('terrain') && !terrainY) { // Stop if terrainY is already found
            // Type assertion needed because TS doesn't know key matches the pattern
            const segment = entities[key as keyof Entities];
            // Ensure segment is a valid GameEntity with vertices
            if (segment && typeof segment === 'object' && 'vertices' in segment && Array.isArray(segment.vertices) && segment.vertices.length >= 2) {
                const v1 = segment.vertices[0];
                const v2 = segment.vertices[1];

                if (v1 && v2 && typeof v1.x === 'number' && typeof v1.y === 'number' && typeof v2.x === 'number' && typeof v2.y === 'number') {
                    // Check if lander is horizontally within this segment's bounds
                    if (landerX >= v1.x && landerX <= v2.x) {
                        const segmentWidth = v2.x - v1.x;
                        if (segmentWidth > 0) {
                            const proportion = (landerX - v1.x) / segmentWidth;
                            terrainY = v1.y + proportion * (v2.y - v1.y);
                        } else {
                            terrainY = v1.y;
                        }
                        // Setting terrainY implicitly breaks the loop condition `!terrainY` on next iteration
                        // or we could use a flag `foundSegment = true` and check that.
                    }
                }
            }
        }
    });

    // Get lander height (provide fallback if size is missing)
    const landerHeight = lander?.size?.[1] ?? 0; // Default to 0 if size isn't available
    const landerBottomY = landerY + landerHeight / 2;

    // Calculate altitude (difference between terrain surface and lander BOTTOM)
    altitude = Math.max(0, terrainY - landerBottomY);
    // --- Calculate Altitude Above Terrain --- END

    // Calculate other UI values
    const fuel = gameState.fuel;
    const status = gameState.status;
    const hVel = landerBody.velocity.x;
    const vVel = landerBody.velocity.y;
    const landerAngle = landerBody.angle;

    // Dispatch the UI update event
    dispatch({
        type: 'ui-update',
        payload: {
            fuel,
            altitude, // Use the new calculated altitude
            hVel,
            vVel,
            status,
            landerX, // Keep sending these if needed elsewhere
            landerY,
            landerAngle
        }
    });

    return entities;
};

export { UISystem }; 