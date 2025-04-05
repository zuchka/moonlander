import Matter from 'matter-js';

// Function to safely get altitude (example logic)
const getAltitude = (landerBody: Matter.Body | undefined, groundY: number): number => {
    if (!landerBody) return 0;
    // This is a simplification - assumes ground is flat at groundY
    // A real implementation might check against terrain segments below the lander.
    return Math.max(0, groundY - landerBody.position.y);
};

// Assume ground level for altitude calculation (needs refinement)
// Maybe pass screenHeight via entities or use a constant
const GROUND_LEVEL_Y = 600; // Placeholder - should be dynamic

/**
 * The UISystem calculates display values and dispatches them for the UI overlay.
 *
 * @param entities The current state of all game entities.
 * @param dispatch The dispatch function from the game engine.
 * @returns The entities state (unchanged by this system).
 */
const UISystem = (entities: any, { dispatch }: any) => {
    const landerBody = entities.lander?.body;
    const gameState = entities.gameState;

    if (!landerBody || !gameState) {
        return entities; // Required entities missing
    }

    // Calculate UI values
    const fuel = gameState.fuel;
    const status = gameState.status;
    const altitude = getAltitude(landerBody, GROUND_LEVEL_Y);
    const hVel = landerBody.velocity.x;
    const vVel = landerBody.velocity.y;

    // Dispatch the UI update event
    dispatch({
        type: 'ui-update',
        payload: {
            fuel,
            altitude,
            hVel,
            vVel,
            status,
        }
    });

    return entities;
};

export { UISystem }; 