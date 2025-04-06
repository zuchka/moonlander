import Matter, { IBodyDefinition } from 'matter-js';
import Lander from '@/src/renderers/Lander';
import TerrainSegment from '@/src/renderers/TerrainSegment';
import LandingPad from '@/src/renderers/LandingPad';
import { Vec2D } from '@/src/physics/setup';
import { Dimensions } from 'react-native';

// Define the new Level Configuration structure
interface LevelConfig {
    landingPad: {
        width: number;
        xPositionFactor: number;
    };
    lander: {
        initialFuel: number;
        maxLandingSpeed: number;
    };
    terrain: {}; // Keep simple for now
}

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
    isThrusting?: boolean; // Add this for the lander entity
    lateralDirection?: 'left' | 'right' | 'none'; // Add this
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
    maxLandingSpeed: number;
    inputState: InputState; // Include the input state
    camera: { x: number; y: number }; // Example camera state
    crashSpeed?: number;
    crashSpeedLimit?: number;
    isTumbling: boolean;
    tumbleTorqueApplied: boolean;
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
 * @param levelConfig The configuration object for the current level.
 * @returns The initial entities object for react-native-game-engine.
 */
const createInitialEntities = (
    engine: Matter.Engine,
    world: Matter.World,
    landerBody: Matter.Body,
    terrainBodies: Matter.Body[],
    terrainVertices: Vec2D[][],
    landingPadBody: Matter.Body,
    levelConfig: LevelConfig // Use the new LevelConfig type
): Entities => {

    // --- DEBUG: Log Renderer Imports ---
    console.log('Inside createInitialEntities:');
    console.log(`  Lander component: typeof=${typeof Lander}, value=${Lander}`);
    console.log(`  LandingPad component: typeof=${typeof LandingPad}, value=${LandingPad}`);
    console.log(`  TerrainSegment component: typeof=${typeof TerrainSegment}, value=${TerrainSegment}`);
    // --- END DEBUG ---

    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    // Hardcode constants not yet in level config
    const LANDER_WIDTH = 40;
    const LANDER_HEIGHT = 40;
    const PAD_HEIGHT = 10;

    // Define base entities EXCEPT landingPad
    const initialEntities: Partial<Entities> = {
        physics: { engine, world },
        lander: {
            body: landerBody,
            size: [LANDER_WIDTH, LANDER_HEIGHT],
            renderer: Lander,
        },
        gameState: {
            engine: engine,
            world: world,
            status: 'playing',
            fuel: levelConfig.lander.initialFuel,
            maxLandingSpeed: levelConfig.lander.maxLandingSpeed,
            inputState: {
                thrusting: false,
                lateral: 'none',
            },
            camera: { x: screenWidth / 2, y: screenHeight / 2 },
            isTumbling: false,
            tumbleTorqueApplied: false,
        },
    };

    // Dynamically add terrain entities FIRST
    terrainBodies.forEach((body, index) => {
        const originalVertices = terrainVertices[index];
        if (!originalVertices) {
            console.warn(`Missing original vertices for terrain body index ${index}`);
            return;
        }
        // ... debug log ...
        initialEntities[`terrain${index + 1}`] = {
            body: body,
            vertices: originalVertices,
            renderer: TerrainSegment,
        };
    });

    // Add landingPad entity AFTER terrain entities
    initialEntities.landingPad = {
        body: landingPadBody,
        size: [levelConfig.landingPad.width, PAD_HEIGHT],
        renderer: LandingPad,
    };

    // Assert and return
    const entities = initialEntities as Entities;
    return entities;
};

export { createInitialEntities, Entities, GameState, InputState, LevelConfig }; 