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

        // Call instance method if available
        if (typeof lander.body.applyForce === 'function') {
            lander.body.applyForce(lander.body.position, force);
        } else {
            // Fallback or warning if method doesn't exist on mock/real body
            console.warn('applyForce method not found on lander body');
            // Matter.Body.applyForce(lander.body, lander.body.position, force); // Keep static as last resort?
        }

        // Consume fuel
        gameState.fuel -= FUEL_CONSUMPTION_RATE;
        if (gameState.fuel < 0) {
            gameState.fuel = 0;
        }
    }

    // Apply Rotation based on state
    const rotateDirection = rotation === 'left' ? -1 : rotation === 'right' ? 1 : 0;
    if (rotateDirection !== 0) {
        const currentVelocity = lander.body.angularVelocity;
        const targetVelocity = currentVelocity + (rotateDirection * ROTATION_TORQUE);
        // Call instance method if available
        if (typeof lander.body.setAngularVelocity === 'function') {
            lander.body.setAngularVelocity(targetVelocity);
        } else {
            console.warn('setAngularVelocity method not found on lander body');
            // Matter.Body.setAngularVelocity(lander.body, targetVelocity); // Keep static as last resort?
        }
    }

    return entities;
};

export { ControlSystem }; 