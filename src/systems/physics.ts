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
    // console.log('Physics Tick, delta:', time?.delta); // Remove log

    // Cap delta time to avoid physics instability
    const maxDelta = 16.667; // Corresponds to 60 FPS
    const cappedDelta = Math.min(time.delta, maxDelta);

    // Use the static Matter.Engine.update function with the capped delta
    Matter.Engine.update(engine, cappedDelta);

    // Remove the previous instance check logic
    // if (engine && typeof engine.update === 'function') {
    //     engine.update(time.delta);
    // } else {
    //     console.warn('PhysicsSystem: Engine or engine.update method not found!');
    // }

    // Return the entities state. Although this system doesn't modify the entities
    // object directly in this implementation, it's conventional for systems to return it.
    return entities;
};

export { PhysicsSystem }; 