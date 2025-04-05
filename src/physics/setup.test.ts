import Matter from 'matter-js';
import { Dimensions } from 'react-native';
import {
    initializePhysics,
    createLanderBody,
    createTerrainBodies,
    createLandingPadBody,
} from './setup'; // Corrected import path

// Mock React Native's Dimensions module for consistent testing
const MOCK_SCREEN_WIDTH = 800;
const MOCK_SCREEN_HEIGHT = 600;
jest.mock('react-native', () => ({
    Dimensions: {
        get: jest.fn(() => ({
            width: MOCK_SCREEN_WIDTH,
            height: MOCK_SCREEN_HEIGHT,
        })),
    },
    Platform: { // Mock Platform if it were used
        OS: 'ios',
        select: jest.fn(selector => selector.ios || selector.default),
    },
    StyleSheet: { // Mock StyleSheet if needed
        create: jest.fn(styles => styles),
    },
}));

// Define the expected type for the return value of initializePhysics
interface PhysicsHandles {
    engine: Matter.Engine;
    world: Matter.World;
}

describe('Physics Setup Utilities', () => {

    describe('initializePhysics', () => {
        let physics: PhysicsHandles;

        beforeAll(() => {
            physics = initializePhysics();
        });

        test('should return an object', () => {
            expect(physics).toBeInstanceOf(Object);
        });

        test('should contain an engine property', () => {
            expect(physics).toHaveProperty('engine');
        });

        test('should contain a world property', () => {
            expect(physics).toHaveProperty('world');
        });

        test('engine should have expected properties', () => {
            // Instead of toBeInstanceOf, check for characteristic properties
            expect(physics.engine).toHaveProperty('world'); // Engines have a world
            expect(physics.engine).toHaveProperty('timing'); // Engines have timing info
            // expect(typeof physics.engine.update).toBe('function'); // Type definitions mark this as static, instance check removed
        });

        test('world should have expected properties', () => {
            // Instead of toBeInstanceOf, check for characteristic properties
            expect(physics.world).toHaveProperty('gravity'); // Worlds have gravity
            expect(physics.world).toHaveProperty('bodies');  // Worlds contain bodies (array)
            expect(Array.isArray(physics.world.bodies)).toBe(true);
        });

        test('world gravity should be set correctly', () => {
            // Using toBeCloseTo for potential floating point inaccuracies
            expect(physics.world.gravity.y).toBeCloseTo(0.05);
            expect(physics.world.gravity.x).toBe(0);
        });
    });

    describe('createLanderBody', () => {
        let landerBody: Matter.Body;

        beforeAll(() => {
            landerBody = createLanderBody();
        });

        test('should return a valid Matter.Body object', () => {
            expect(landerBody).toHaveProperty('id');
            expect(typeof landerBody.id).toBe('number');
            expect(landerBody).toHaveProperty('position');
            expect(typeof landerBody.position.x).toBe('number');
            expect(landerBody).toHaveProperty('vertices');
            expect(Array.isArray(landerBody.vertices)).toBe(true);
        });

        test('should have the label "lander"', () => {
            expect(landerBody.label).toBe('lander');
        });

        test('should have correct initial position', () => {
            const expectedX = MOCK_SCREEN_WIDTH / 2;
            const expectedY = 50;
            expect(landerBody.position.x).toBeCloseTo(expectedX);
            expect(landerBody.position.y).toBeCloseTo(expectedY);
        });

        test('should have default physics properties', () => {
            expect(landerBody.frictionAir).toBeCloseTo(0.01);
            expect(landerBody.density).toBeCloseTo(0.001);
        });

        test('should apply custom options correctly', () => {
            const customOptions = { restitution: 0.8, density: 0.005 };
            const customLander = createLanderBody(customOptions);
            expect(customLander.restitution).toBe(0.8);
            expect(customLander.density).toBe(0.005); // Overrides default
            expect(customLander.frictionAir).toBeCloseTo(0.01); // Keeps default
            expect(customLander.label).toBe('lander'); // Keeps default label
        });
    });

    describe('createTerrainBodies', () => {
        let terrainBodies: Matter.Body[];

        beforeAll(() => {
            // Uses default terrain vertices defined in setup.ts
            terrainBodies = createTerrainBodies();
        });

        test('should return an array', () => {
            expect(terrainBodies).toBeInstanceOf(Array);
        });

        test('should return correct number of bodies for default terrain', () => {
            // Based on EXAMPLE_TERRAIN_VERTICES in setup.ts
            expect(terrainBodies.length).toBe(2);
        });

        test('each element should be a valid Matter.Body object', () => {
            terrainBodies.forEach(body => {
                expect(body).toHaveProperty('id');
                expect(typeof body.id).toBe('number');
                expect(body).toHaveProperty('position');
                expect(body).toHaveProperty('vertices');
                expect(Array.isArray(body.vertices)).toBe(true);
            });
        });

        test('each body should be static', () => {
            terrainBodies.forEach(body => {
                expect(body.isStatic).toBe(true);
            });
        });

        test('each body should have the label "terrain"', () => {
            terrainBodies.forEach(body => {
                expect(body.label).toBe('terrain');
            });
        });

        test('should create bodies from custom vertex data', () => {
            const customVertices = [
                [{ x: 0, y: 500 }, { x: 100, y: 500 }, { x: 100, y: 600 }, { x: 0, y: 600 }]
            ];
            const customTerrain = createTerrainBodies(customVertices);
            expect(customTerrain.length).toBe(1);
            expect(customTerrain[0]).toHaveProperty('id');
            expect(typeof customTerrain[0].id).toBe('number');
            expect(customTerrain[0]).toHaveProperty('vertices');
            expect(Array.isArray(customTerrain[0].vertices)).toBe(true);
            expect(customTerrain[0].label).toBe('terrain');
        });

         test('should apply custom options to all bodies', () => {
            const customOptions = { friction: 0.9, render: { fillStyle: 'blue' } };
            const customTerrain = createTerrainBodies(undefined, customOptions);
            expect(customTerrain.length).toBe(2);
            customTerrain.forEach(body => {
                expect(body.friction).toBe(0.9);
                expect(body.render.fillStyle).toBe('blue');
                expect(body.label).toBe('terrain');
                expect(body.isStatic).toBe(true);
            });
        });
    });

    describe('createLandingPadBody', () => {
        let landingPadBody: Matter.Body;

        beforeAll(() => {
            landingPadBody = createLandingPadBody();
        });

        test('should return a valid Matter.Body object', () => {
            expect(landingPadBody).toHaveProperty('id');
            expect(typeof landingPadBody.id).toBe('number');
            expect(landingPadBody).toHaveProperty('position');
            expect(landingPadBody).toHaveProperty('vertices');
            expect(Array.isArray(landingPadBody.vertices)).toBe(true);
        });

        test('should have the label "landingPad"', () => {
            expect(landingPadBody.label).toBe('landingPad');
        });

        test('should be static', () => {
            expect(landingPadBody.isStatic).toBe(true);
        });

        test('should not be a sensor', () => {
            // isSensor defaults to false, but we check explicitly
            expect(landingPadBody.isSensor).toBe(false);
        });

        test('should have correct initial position', () => {
            const PAD_WIDTH = 80;
            const PAD_HEIGHT = 10;
            const expectedX = MOCK_SCREEN_WIDTH / 2;
            const expectedY = MOCK_SCREEN_HEIGHT - 50 - (PAD_HEIGHT / 2);
            expect(landingPadBody.position.x).toBeCloseTo(expectedX);
            expect(landingPadBody.position.y).toBeCloseTo(expectedY);
        });

        test('should apply custom options correctly', () => {
            const customOptions = { isSensor: true, render: { fillStyle: 'green' } };
            const customPad = createLandingPadBody(customOptions);
            expect(customPad.isSensor).toBe(true);
            expect(customPad.render.fillStyle).toBe('green');
            expect(customPad.label).toBe('landingPad'); // Keeps default label
            expect(customPad.isStatic).toBe(true); // Keeps default static property
        });
    });
}); 