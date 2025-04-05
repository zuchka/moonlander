import Matter, { IBodyDefinition } from 'matter-js';
import Lander from '@/src/renderers/Lander';
import TerrainSegment from '@/src/renderers/TerrainSegment';
import LandingPad from '@/src/renderers/LandingPad';
import { Vec2D } from '@/src/physics/setup';
import { Dimensions } from 'react-native';

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
    vertices?: Vec2D[]; // Add original vertices
    size?: number[];
    renderer?: React.ComponentType<any> | null; // Placeholder for renderer component
    [key: string]: any; // Allow other properties
}

// Define the input state structure
interface InputState {
    thrusting: boolean;
    lateral: 'left' | 'right' | 'none'; // Renamed from rotation
}

// Define the game state structure
interface GameState {
    engine: Matter.Engine;
    world: Matter.World;
    status: string; // e.g., 'playing', 'landed', 'crashed'
    fuel: number;
    inputState: InputState; // Include the input state
    camera: { x: number; y: number }; // Example camera state
}

// Define the overall entities structure type
interface Entities {
    physics: { engine: Matter.Engine; world: Matter.World };
    lander: GameEntity;
    landingPad: GameEntity;
    gameState: GameState; // Use specific type
    [key: `terrain${number}`]: GameEntity; // For terrain parts
}

/**
 * Function to create initial game entities.
 *
 * @param engine The Matter.js engine instance.
 * @param world The Matter.js world instance.
 * @param landerBody The pre-created Matter.js body for the lander.
 * @param terrainBodies An array of pre-created Matter.js bodies for the terrain segments.
 * @param terrainVertices The original vertex data for each terrain segment.
 * @param landingPadBody The pre-created Matter.js body for the landing pad.
 * @param constants An object containing game constants like dimensions and initial fuel.
 * @returns The initial entities object for react-native-game-engine.
 */
const createInitialEntities = (
    engine: Matter.Engine,
    world: Matter.World,
    landerBody: Matter.Body,
    terrainBodies: Matter.Body[],
    terrainVertices: Vec2D[][],
    landingPadBody: Matter.Body,
    constants: GameConstants
): Entities => {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
            engine: engine,
            world: world,
            status: 'playing',
            fuel: constants.INITIAL_FUEL,
            inputState: { // Initialize input state
                thrusting: false,
                lateral: 'none', // Use new field name
            },
            camera: { x: screenWidth / 2, y: screenHeight / 2 }, // Initial camera centered
        },
    };

    // Dynamically add terrain entities
    terrainBodies.forEach((body, index) => {
        const originalVertices = terrainVertices[index];

        if (!originalVertices) {
            console.warn(`Missing original vertices for terrain body index ${index}`);
            return; // Skip if data is inconsistent
        }

        initialEntities[`terrain${index + 1}`] = {
            body: body,
            vertices: originalVertices, // Store the original vertices
            renderer: TerrainSegment,
        };
    });

    // We perform a type assertion here because we've programmatically built
    // the object to conform to the Entities interface.
    const entities = initialEntities as Entities;
    return entities;
};

export { createInitialEntities, Entities, GameState, InputState }; // Keep this export for function and types 