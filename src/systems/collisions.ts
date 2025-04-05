import Matter from 'matter-js';

// Constants for safe landing (adjust as needed)
const MAX_LANDING_SPEED = 2.0;
const MAX_LANDING_ANGLE = 0.1; // Radians (~5.7 degrees)

/**
 * The CollisionSystem checks for collisions involving the lander and dispatches events.
 *
 * @param entities The current state of all game entities.
 * @param dispatch The dispatch function to send events to other systems.
 * @returns The updated entities state.
 */
const CollisionSystem = (entities: any, { dispatch }: any) => {
    const landerBody = entities.lander?.body;
    const gameState = entities.gameState;

    // Only process collisions if the game is playing and lander exists
    if (gameState.status !== 'playing' || !landerBody) {
        return entities;
    }

    // Gather all potential obstacles (terrain and landing pad)
    const obstacles = Object.keys(entities)
        .filter(key => key.startsWith('terrain') || key === 'landingPad')
        .map(key => entities[key].body)
        .filter(body => !!body); // Filter out any potentially missing bodies

    if (obstacles.length === 0) {
        return entities; // No obstacles to collide with
    }

    // Check for collisions
    const collisions = Matter.Query.collides(landerBody, obstacles);

    if (collisions.length > 0) {
        // Prioritize landing pad collision checks
        const padCollision = collisions.find(collision =>
            (collision.bodyA === landerBody && collision.bodyB.label === 'landingPad') ||
            (collision.bodyB === landerBody && collision.bodyA.label === 'landingPad')
        );

        if (padCollision) {
            // Check landing conditions
            const landedSafely = landerBody.speed < MAX_LANDING_SPEED &&
                                Math.abs(landerBody.angle) < MAX_LANDING_ANGLE;

            if (landedSafely) {
                dispatch({ type: 'collision', outcome: 'landed' });
            } else {
                // Determine crash reason
                const reason = landerBody.speed >= MAX_LANDING_SPEED ? 'speed' : 'angle';
                dispatch({ type: 'collision', outcome: `crashed-pad-${reason}` });
            }
        } else {
            // If not landing pad collision, any other collision is terrain
            dispatch({ type: 'collision', outcome: 'crashed-terrain' });
        }
    }

    return entities;
};

export { CollisionSystem }; 