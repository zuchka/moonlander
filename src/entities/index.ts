import Matter from 'matter-js';
import Lander from '@/src/renderers/Lander';
import TerrainSegment from '@/src/renderers/TerrainSegment';
import LandingPad from '@/src/renderers/LandingPad';

// Define the structure for the constants needed
interface GameConstants {
    LANDER_WIDTH: number;
    LANDER_HEIGHT: number;
    PAD_WIDTH: number;
    PAD_HEIGHT: number;
    INITIAL_FUEL: number;
}

// Define a basic structure for what an entity might look like
// This can be expanded later
interface GameEntity {
    body?: Matter.Body;
    size?: number[];
    renderer?: React.ComponentType<any> | null; // Placeholder for renderer component
    [key: string]: any; // Allow other properties
}

// Define the overall entities structure type
interface Entities {
    physics: { engine: Matter.Engine; world: Matter.World };
    lander: GameEntity;
    landingPad: GameEntity;
    gameState: { status: string; fuel: number; [key: string]: any };
    [key: `terrain${number}`]: GameEntity; // For terrain parts
}

/**
 * Creates the initial set of entities for the game engine.
 *
 * @param engine The Matter.js physics engine instance.
 * @param world The Matter.js physics world instance.
 * @param landerBody The pre-created Matter.js body for the lander.
 * @param terrainBodies An array of pre-created Matter.js bodies for the terrain segments.
 * @param landingPadBody The pre-created Matter.js body for the landing pad.
 * @param constants An object containing game constants like dimensions and initial fuel.
 * @returns The initial entities object for react-native-game-engine.
 */
export const createInitialEntities = (
    engine: Matter.Engine,
    world: Matter.World,
    landerBody: Matter.Body,
    terrainBodies: Matter.Body[],
    landingPadBody: Matter.Body,
    constants: GameConstants
): Entities => {

    const initialEntities: Partial<Entities> = {
        physics: { engine, world },
        lander: {
            body: landerBody,
            size: [constants.LANDER_WIDTH, constants.LANDER_HEIGHT],
            renderer: Lander, // Assign Lander component
        },
        landingPad: {
            body: landingPadBody,
            size: [constants.PAD_WIDTH, constants.PAD_HEIGHT],
            renderer: LandingPad, // Assign LandingPad component
        },
        gameState: {
            status: 'playing',
            fuel: constants.INITIAL_FUEL,
        },
    };

    // Dynamically add terrain entities
    terrainBodies.forEach((body, index) => {
        initialEntities[`terrain${index + 1}`] = {
            body: body,
            renderer: TerrainSegment, // Assign TerrainSegment component
        };
    });

    // We perform a type assertion here because we've programmatically built
    // the object to conform to the Entities interface.
    return initialEntities as Entities;
}; 