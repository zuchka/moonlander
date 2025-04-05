import Matter from 'matter-js';

// Constants for control forces (adjust as needed)
const THRUST_FORCE_MAGNITUDE = 0.0005; // Reduced force
const ROTATION_TORQUE = 0.005; // Torque for rotation
const FUEL_CONSUMPTION_RATE = 0.1; // Fuel consumed per tick of thrust

/**
 * The ControlSystem handles player input to control the lander.
 *
 * @param entities The current state of all game entities.
 * @returns The updated entities state.
 */
const ControlSystem = (entities: any) => {
    const lander = entities.lander;
    const gameState = entities.gameState;

    if (gameState.status !== 'playing' || !lander || !gameState.inputState) {
        return entities;
    }

    // Read input directly from gameState
    const { thrusting, rotation } = gameState.inputState;

    // Apply Thrust based on state
    if (thrusting && gameState.fuel > 0) {
        // Calculate force vector based on lander angle
        // Remember angle=0 is pointing up, positive angle is clockwise
        const angleRad = lander.body.angle;
        const force = {
            x: THRUST_FORCE_MAGNITUDE * Math.sin(angleRad),
            y: -THRUST_FORCE_MAGNITUDE * Math.cos(angleRad) // Negative Y is up
        };

        // Use the static Matter.Body.applyForce method
        Matter.Body.applyForce(lander.body, lander.body.position, force);

        // Consume fuel
        gameState.fuel -= FUEL_CONSUMPTION_RATE;
        if (gameState.fuel < 0) {
            gameState.fuel = 0;
        }
    }

    // Apply Rotation based on state
    const rotateDirection = rotation === 'left' ? -1 : rotation === 'right' ? 1 : 0;
    if (rotateDirection !== 0) {
        // Apply torque directly to the body instance
        const desiredTorque = rotateDirection * ROTATION_TORQUE;
        lander.body.torque = desiredTorque;

        // Note: Matter.js automatically resets torque each step, so we apply it every frame input is active.
        // No need for explicit damping here usually, unless torque is very high or you want a specific feel.
    } else {
        // Optional: Reset torque if no rotation input to prevent residual spin
        // lander.body.torque = 0;
    }

    return entities;
};

export { ControlSystem }; 