import Matter from 'matter-js';

/**
 * The PhysicsSystem is responsible for updating the Matter.js engine on each tick.
 *
 * @param entities The current state of all game entities.
 * @param time An object containing timing information (delta, etc.).
 * @returns The updated entities state.
 */
const PhysicsSystem = (entities: any, { time }: any) => {
    const engine = entities.physics.engine;

    // Update the physics engine via the instance method
    if (engine && typeof engine.update === 'function') {
        engine.update(time.delta);
    } else {
        // Fallback or error for safety, though shouldn't happen if entities are structured correctly
        console.warn('PhysicsSystem: Engine or engine.update method not found!');
        // Matter.Engine.update(engine, time.delta); // Remove static call
    }

    // Return the entities state. Although this system doesn't modify the entities
    // object directly in this implementation, it's conventional for systems to return it.
    return entities;
};

export { PhysicsSystem }; 