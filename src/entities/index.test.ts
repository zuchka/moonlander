import Matter from 'matter-js';
import { createInitialEntities } from './index'; // Function to be tested (doesn't exist yet)

// --- Mock Matter.js Objects ---
// Simple mock function to create objects with labels and other needed props
const mockBody = (label: string, id: number, overrides = {}): Matter.Body => ({
    id: id,
    label: label,
    position: { x: 0, y: 0 },
    vertices: [{x:0, y:0}], // Minimal vertices
    velocity: { x: 0, y: 0 },
    angle: 0,
    isStatic: label !== 'lander',
    ...overrides,
} as Matter.Body); // Type assertion needed for mock

const mockEngine = { world: {} } as Matter.Engine;
const mockWorld = { gravity: { y: 0.05 } } as Matter.World;
const mockLanderBody = mockBody('lander', 1);
const mockTerrainBody1 = mockBody('terrain', 2);
const mockTerrainBody2 = mockBody('terrain', 3);
const mockLandingPadBody = mockBody('landingPad', 4);

// --- Constants expected in entities (Match definitions if they exist) ---
const LANDER_WIDTH = 40; // Assuming these exist somewhere accessible or are passed in
const LANDER_HEIGHT = 40;
const PAD_WIDTH = 80;
const PAD_HEIGHT = 10;
const INITIAL_FUEL = 100; // Example value

describe('createInitialEntities', () => {

    let entities: any;

    beforeAll(() => {
        // Call the function (will fail until implemented)
        entities = createInitialEntities(
            mockEngine,
            mockWorld,
            mockLanderBody,
            [mockTerrainBody1, mockTerrainBody2],
            mockLandingPadBody,
            { LANDER_WIDTH, LANDER_HEIGHT, PAD_WIDTH, PAD_HEIGHT, INITIAL_FUEL } // Pass constants
        );
    });

    test('should return an object', () => {
        expect(entities).toBeInstanceOf(Object);
    });

    test('should contain core entities: physics, lander, landingPad, gameState', () => {
        expect(entities).toHaveProperty('physics');
        expect(entities).toHaveProperty('lander');
        expect(entities).toHaveProperty('landingPad');
        expect(entities).toHaveProperty('gameState');
    });

    test('should contain terrain entities based on input array', () => {
        expect(entities).toHaveProperty('terrain1'); // Derived from index
        expect(entities).toHaveProperty('terrain2');
        // Ensure no unexpected terrain entities exist
        expect(entities).not.toHaveProperty('terrain0');
        expect(entities).not.toHaveProperty('terrain3');
    });

    test('physics entity should contain the engine and world', () => {
        expect(entities.physics.engine).toBe(mockEngine);
        expect(entities.physics.world).toBe(mockWorld);
    });

    test('lander entity should contain the lander body and correct size', () => {
        expect(entities.lander.body).toBe(mockLanderBody);
        expect(entities.lander.size).toEqual([LANDER_WIDTH, LANDER_HEIGHT]);
        expect(entities.lander.renderer).toBeDefined(); // Expecting a placeholder/null initially
    });

    test('terrain entities should contain the correct bodies', () => {
        expect(entities.terrain1.body).toBe(mockTerrainBody1);
        expect(entities.terrain1.renderer).toBeDefined();
        expect(entities.terrain2.body).toBe(mockTerrainBody2);
        expect(entities.terrain2.renderer).toBeDefined();
    });

    test('landingPad entity should contain the pad body and correct size', () => {
        expect(entities.landingPad.body).toBe(mockLandingPadBody);
        expect(entities.landingPad.size).toEqual([PAD_WIDTH, PAD_HEIGHT]);
        expect(entities.landingPad.renderer).toBeDefined();
    });

    test('gameState entity should have correct initial values', () => {
        expect(entities.gameState.status).toBe('playing');
        expect(entities.gameState.fuel).toBe(INITIAL_FUEL);
        // Add other initial states if needed (score, altitude etc)
    });
}); 