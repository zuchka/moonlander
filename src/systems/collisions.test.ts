import Matter from 'matter-js';
import { CollisionSystem } from './collisions'; // System to be tested

// --- Mocks ---
const mockCollides = jest.spyOn(Matter.Query, 'collides');
const mockDispatch = jest.fn();

// Helper to create mock bodies with controllable speed/angle
const createMockBody = (id: number, label: string, speed: number = 1, angle: number = 0): Matter.Body => ({
    id,
    label,
    speed, // Include speed directly
    angle, // Include angle directly
    // Add other minimal required Body properties if needed by system logic
    position: { x: 0, y: 0 },
    vertices: [{x:0, y:0}],
    velocity: { x: 0, y: 0 },
    isStatic: label !== 'lander',
} as Matter.Body);

// Helper to create a more complete mock Collision object
const createMockCollision = (bodyA: Matter.Body, bodyB: Matter.Body): Matter.Collision => ({
    collided: true,
    bodyA: bodyA,
    bodyB: bodyB,
    // Add other minimal required Collision properties - values usually don't matter for this system's logic
    pair: {} as Matter.Pair,
    parentA: bodyA,
    parentB: bodyB,
    depth: 1,
    normal: { x: 0, y: 0 },
    tangent: { x: 0, y: 0 },
    penetration: { x: 0, y: 0 },
    supports: [],
});

describe('CollisionSystem', () => {
    let mockEntities: any; // Type any for now
    let mockLanderBody: Matter.Body;
    let mockTerrainBody: Matter.Body;
    let mockLandingPadBody: Matter.Body;

    beforeEach(() => {
        mockCollides.mockClear();
        mockDispatch.mockClear();

        // Create bodies for each test run to allow modification
        mockLanderBody = createMockBody(1, 'lander');
        mockTerrainBody = createMockBody(2, 'terrain');
        mockLandingPadBody = createMockBody(3, 'landingPad');

        mockEntities = {
            lander: { body: mockLanderBody },
            terrain1: { body: mockTerrainBody }, // Example terrain entity
            landingPad: { body: mockLandingPadBody },
            gameState: { status: 'playing' }
        };
    });

    afterAll(() => {
        mockCollides.mockRestore();
    });

    test('should check collisions between lander and terrain/pad', () => {
        mockCollides.mockReturnValue([]); // Simulate no collision
        CollisionSystem(mockEntities, { dispatch: mockDispatch });

        expect(mockCollides).toHaveBeenCalledWith(
            mockLanderBody,
            [mockTerrainBody, mockLandingPadBody]
        );
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    test('should dispatch "crashed" event on collision with terrain', () => {
        // Use helper to create mock collision
        mockCollides.mockReturnValue([createMockCollision(mockLanderBody, mockTerrainBody)]);
        CollisionSystem(mockEntities, { dispatch: mockDispatch });

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'collision', outcome: 'crashed-terrain' });
    });

    test('should dispatch "landed" event on safe collision with landing pad', () => {
        // Recreate lander with safe speed/angle for this test
        mockLanderBody = createMockBody(1, 'lander', 0.5, 0.01);
        mockEntities.lander.body = mockLanderBody; // Update entities

        mockCollides.mockReturnValue([createMockCollision(mockLanderBody, mockLandingPadBody)]);
        CollisionSystem(mockEntities, { dispatch: mockDispatch });

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'collision', outcome: 'landed' });
    });

    test('should dispatch "crashed" event on hard landing (high speed)', () => {
        // Recreate lander with unsafe speed
        mockLanderBody = createMockBody(1, 'lander', 5, 0);
        mockEntities.lander.body = mockLanderBody;

        mockCollides.mockReturnValue([createMockCollision(mockLanderBody, mockLandingPadBody)]);
        CollisionSystem(mockEntities, { dispatch: mockDispatch });

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'collision', outcome: 'crashed-pad-speed' });
    });

    test('should dispatch "crashed" event on crooked landing (bad angle)', () => {
        // Recreate lander with unsafe angle
        mockLanderBody = createMockBody(1, 'lander', 0.5, 0.5);
        mockEntities.lander.body = mockLanderBody;

        mockCollides.mockReturnValue([createMockCollision(mockLanderBody, mockLandingPadBody)]);
        CollisionSystem(mockEntities, { dispatch: mockDispatch });

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'collision', outcome: 'crashed-pad-angle' });
    });

     test('should not check collisions or dispatch if game is not "playing"', () => {
        mockEntities.gameState.status = 'landed';
        mockCollides.mockReturnValue([createMockCollision(mockLanderBody, mockTerrainBody)]); // Simulate collision
        CollisionSystem(mockEntities, { dispatch: mockDispatch });

        expect(mockCollides).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();

        mockEntities.gameState.status = 'crashed';
        CollisionSystem(mockEntities, { dispatch: mockDispatch });
        expect(mockCollides).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
    });

     test('should return entities object unchanged', () => {
        mockCollides.mockReturnValue([]);
        const result = CollisionSystem(mockEntities, { dispatch: mockDispatch });
        expect(result).toBe(mockEntities);
    });

}); 