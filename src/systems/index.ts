import { PhysicsSystem } from './physics';
import { ControlSystem } from './controls';
import { CollisionSystem } from './collisions';
import { GameStateSystem } from './gameState';

// Export an array of systems in the desired execution order.
// Controls -> Physics -> Collisions -> Game State
export default [
    ControlSystem,
    PhysicsSystem,
    CollisionSystem,
    GameStateSystem,
]; 