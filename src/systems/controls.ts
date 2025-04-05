import Matter from 'matter-js';

// Constants for control forces (adjust as needed)
const THRUST_FORCE_MAGNITUDE = 0.0005; // Reduced force
const ROTATION_TORQUE = 0.005; // Torque for rotation
const FUEL_CONSUMPTION_RATE = 0.1; // Fuel consumed per tick of thrust

/**
 * The ControlSystem handles player input to control the lander.
 *
 * @param entities The current state of all game entities.
 * @param input An object containing the input payload (array of events).
 * @returns The updated entities state.
 */
const ControlSystem = (entities: any, { input }: any) => {
    const engine = entities.physics.engine;
    const lander = entities.lander;
    const gameState = entities.gameState;

    // Only process controls if the game is playing
    if (gameState.status !== 'playing') {
        return entities;
    }

    const payload = input.find((x: any) => x.name === 'dispatch-input');

    if (payload) {
        let thrusting = false;
        let rotateDirection = 0; // -1 for left, 1 for right, 0 for none

        // Process all events in the payload for this tick
        payload.events.forEach((event: any) => {
            switch (event.type) {
                case 'start-thrust':
                    thrusting = true;
                    break;
                case 'stop-thrust': // Although we might just check active state
                    thrusting = false;
                    break;
                case 'rotate-left':
                    rotateDirection = -1;
                    break;
                case 'rotate-right':
                    rotateDirection = 1;
                    break;
                // 'stop-rotate' might be handled implicitly or by separate event
            }
        });

        // Apply Thrust
        if (thrusting && gameState.fuel > 0) {
            // Calculate force vector based on lander angle
            // Remember angle=0 is pointing up, positive angle is clockwise
            const angleRad = lander.body.angle;
            const force = {
                x: THRUST_FORCE_MAGNITUDE * Math.sin(angleRad),
                y: -THRUST_FORCE_MAGNITUDE * Math.cos(angleRad) // Negative Y is up
            };

            // Matter.Body.applyForce(lander.body, lander.body.position, force);
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

        // Apply Rotation
        if (rotateDirection !== 0) {
             const currentVelocity = lander.body.angularVelocity;
             const targetVelocity = currentVelocity + (rotateDirection * ROTATION_TORQUE);
             // Matter.Body.setAngularVelocity(lander.body, targetVelocity);
             // Call instance method if available
             if (typeof lander.body.setAngularVelocity === 'function') {
                 lander.body.setAngularVelocity(targetVelocity);
             } else {
                console.warn('setAngularVelocity method not found on lander body');
                // Matter.Body.setAngularVelocity(lander.body, targetVelocity); // Keep static as last resort?
             }
        }
    }

    return entities;
};

export { ControlSystem }; 