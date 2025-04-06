import Matter from 'matter-js';

// Constants for control forces/speeds (adjust as needed)
const THRUST_FORCE_MAGNITUDE = 0.0005; // Keep vertical thrust force
const LATERAL_FORCE_MAGNITUDE = 0.0002; // Adjust this for desired acceleration
const FUEL_CONSUMPTION_RATE = 0.1; // Main thrust fuel rate
const LATERAL_FUEL_CONSUMPTION_RATE = 0.03; // Smaller fuel rate for lateral thrust

/**
 * The ControlSystem handles player input to control the lander.
 * Implements lateral force application with angle lock (Plan C).
 *
 * @param entities The current state of all game entities.
 * @returns The updated entities state.
 */
const ControlSystem = (entities: any) => {
    const lander = entities.lander;
    const gameState = entities.gameState;

    if (gameState.status !== 'playing' || !lander || !gameState.inputState || !lander.body) {
        return entities;
    }

    const landerBody = lander.body;

    // --- Angle Lock --- (REMOVED)
    // Matter.Body.setAngle(landerBody, 0);
    // Matter.Body.setAngularVelocity(landerBody, 0);

    // --- Vertical Thrust --- (Check fuel and consume)
    const { thrusting, lateral } = gameState.inputState;
    if (thrusting && gameState.fuel > 0) {
        // Thrust should now respect angle
        const angleRad = landerBody.angle; 
        const force = {
             x: Math.sin(angleRad) * THRUST_FORCE_MAGNITUDE, 
             y: -Math.cos(angleRad) * THRUST_FORCE_MAGNITUDE 
        }; 
        Matter.Body.applyForce(landerBody, landerBody.position, force);

        gameState.fuel -= FUEL_CONSUMPTION_RATE;
        if (gameState.fuel < 0) {
            gameState.fuel = 0;
        }
    }

    // --- Lateral Movement --- (Check fuel, apply force, consume fuel)
    let lateralForceX = 0;
    // Lateral controls might need rethinking without angle lock.
    // For now, apply force horizontally relative to the world.
    if (lateral === 'left') {
        lateralForceX = -LATERAL_FORCE_MAGNITUDE;
    } else if (lateral === 'right') {
        lateralForceX = LATERAL_FORCE_MAGNITUDE;
    }

    if (lateralForceX !== 0 && gameState.fuel > 0) {
        Matter.Body.applyForce(landerBody, landerBody.position, { x: lateralForceX, y: 0 });
        // ... fuel consumption ...
        gameState.fuel -= LATERAL_FUEL_CONSUMPTION_RATE;
        if (gameState.fuel < 0) {
            gameState.fuel = 0;
        }
    }

    // Note: Air friction (set on the body definition) should handle damping

    return entities;
};

export { ControlSystem }; 