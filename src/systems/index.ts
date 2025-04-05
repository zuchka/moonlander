import { PhysicsSystem } from './physics';
import { ControlSystem } from './controls';
import { GameStateSystem } from './gameState';
import { UISystem } from './uiUpdate';
import { EffectsSystem } from './EffectsSystem';

// Export an array of systems in the desired execution order.
// Input handled by GameScreen -> Controls -> Physics -> Collisions -> Game State -> UI Updates
export default [
    // InputSystem, // Removed
    ControlSystem,
    PhysicsSystem,
    GameStateSystem,
    UISystem,
    EffectsSystem
]; 