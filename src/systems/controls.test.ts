import Matter from 'matter-js';
import { ControlSystem } from './controls'; // System to be tested

// --- Mocks ---
// Mock the instance methods we expect the system to call
const mockApplyForce = jest.fn();
const mockSetAngularVelocity = jest.fn();

// Lander body mock needs the methods we will call
const createMockLanderBody = (angle = 0, angularVelocity = 0) => ({
    angle,
    position: { x: 100, y: 100 },
    angularVelocity,
    applyForce: mockApplyForce,
    setAngularVelocity: mockSetAngularVelocity,
} as unknown as Matter.Body);

// Constants from the system (or shared location)
const THRUST_FORCE_MAGNITUDE = 0.0005;
const ROTATION_TORQUE = 0.005;

describe('ControlSystem', () => {
    let mockEntities: any;
    let mockLanderBody: Matter.Body;

    beforeEach(() => {
        // Clear instance mocks
        mockApplyForce.mockClear();
        mockSetAngularVelocity.mockClear();

        // Create a fresh mock body
        mockLanderBody = createMockLanderBody();

        mockEntities = {
            physics: { engine: {} }, // Keep placeholder
            lander: {
                body: mockLanderBody
            },
            gameState: {
                fuel: 100,
                status: 'playing'
            }
        };
    });

    // No afterAll needed for instance mocks

    // --- Input Handling Tests ---

    test('should call body.applyForce when "start-thrust" input received', () => {
        const inputPayload = [{ name: 'dispatch-input', events: [{ type: 'start-thrust' }] }];
        ControlSystem(mockEntities, { input: inputPayload });

        expect(mockApplyForce).toHaveBeenCalledTimes(1);
        const expectedForce = { x: 0, y: -THRUST_FORCE_MAGNITUDE }; // Negative Y is up
        // applyForce on instance doesn't take body as first arg
        expect(mockApplyForce).toHaveBeenCalledWith(mockLanderBody.position, expectedForce);
        expect(mockEntities.gameState.fuel).toBeLessThan(100);
    });

    test('should not call applyForce if fuel is zero', () => {
        mockEntities.gameState.fuel = 0;
        const inputPayload = [{ name: 'dispatch-input', events: [{ type: 'start-thrust' }] }];
        ControlSystem(mockEntities, { input: inputPayload });
        expect(mockApplyForce).not.toHaveBeenCalled();
        expect(mockEntities.gameState.fuel).toBe(0);
    });

    test('should not call applyForce or setAngularVelocity if game status is not "playing"', () => {
         mockEntities.gameState.status = 'crashed';
         const inputPayload = [{ name: 'dispatch-input', events: [{ type: 'start-thrust' }, { type: 'rotate-left' }] }];
         ControlSystem(mockEntities, { input: inputPayload });
         expect(mockApplyForce).not.toHaveBeenCalled();
         expect(mockSetAngularVelocity).not.toHaveBeenCalled();

         mockEntities.gameState.status = 'landed';
         ControlSystem(mockEntities, { input: inputPayload });
         expect(mockApplyForce).not.toHaveBeenCalled();
         expect(mockSetAngularVelocity).not.toHaveBeenCalled();
     });

    test('should call body.setAngularVelocity when "rotate-left" input received', () => {
        const initialVelocity = mockLanderBody.angularVelocity;
        const inputPayload = [{ name: 'dispatch-input', events: [{ type: 'rotate-left' }] }];
        ControlSystem(mockEntities, { input: inputPayload });

        expect(mockSetAngularVelocity).toHaveBeenCalledTimes(1);
        const expectedVelocity = initialVelocity - ROTATION_TORQUE;
        // setAngularVelocity on instance doesn't take body as first arg
        expect(mockSetAngularVelocity).toHaveBeenCalledWith(expectedVelocity);
        expect(mockApplyForce).not.toHaveBeenCalled();
    });

    test('should call body.setAngularVelocity when "rotate-right" input received', () => {
         const initialVelocity = mockLanderBody.angularVelocity;
         const inputPayload = [{ name: 'dispatch-input', events: [{ type: 'rotate-right' }] }];
         ControlSystem(mockEntities, { input: inputPayload });

         expect(mockSetAngularVelocity).toHaveBeenCalledTimes(1);
         const expectedVelocity = initialVelocity + ROTATION_TORQUE;
         expect(mockSetAngularVelocity).toHaveBeenCalledWith(expectedVelocity);
         expect(mockApplyForce).not.toHaveBeenCalled();
     });

    test('should handle multiple inputs correctly (thrust + rotate)', () => {
         const initialAngVelocity = mockLanderBody.angularVelocity;
         const inputPayload = [{ name: 'dispatch-input', events: [{ type: 'start-thrust' }, { type: 'rotate-right' }] }];
         ControlSystem(mockEntities, { input: inputPayload });

         // Check thrust call
         expect(mockApplyForce).toHaveBeenCalledTimes(1);
         const expectedForce = { x: 0, y: -THRUST_FORCE_MAGNITUDE };
         expect(mockApplyForce).toHaveBeenCalledWith(mockLanderBody.position, expectedForce);

         // Check rotation call
         expect(mockSetAngularVelocity).toHaveBeenCalledTimes(1);
         const expectedAngVelocity = initialAngVelocity + ROTATION_TORQUE;
         expect(mockSetAngularVelocity).toHaveBeenCalledWith(expectedAngVelocity);

         expect(mockEntities.gameState.fuel).toBeLessThan(100);
     });

    test('should ignore irrelevant inputs or names', () => {
         const inputPayload = [
             { name: 'other-input', events: [{ type: 'start-thrust'}] },
             { name: 'dispatch-input', events: [{ type: 'some-other-event'}] }
         ];
         ControlSystem(mockEntities, { input: inputPayload });
         expect(mockApplyForce).not.toHaveBeenCalled();
         expect(mockSetAngularVelocity).not.toHaveBeenCalled();
         expect(mockEntities.gameState.fuel).toBe(100);
     });

     test('should return entities object', () => {
         const result = ControlSystem(mockEntities, { input: [] });
         expect(result).toBe(mockEntities);
     });

}); 