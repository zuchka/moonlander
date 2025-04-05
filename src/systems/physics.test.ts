import Matter from 'matter-js';
import { PhysicsSystem } from './physics'; // System to be tested

// Mock the engine's update method
const mockEngineUpdate = jest.fn();

describe('PhysicsSystem', () => {
    let mockEntities: any;

    beforeEach(() => {
        // Reset mocks and entities before each test
        mockEngineUpdate.mockClear();
        mockEntities = {
            physics: {
                engine: {
                    // Provide the mock function for the update method
                    update: mockEngineUpdate,
                    world: {}, // Minimal world mock
                    // Add timing property if needed by other engine methods, but likely not for this mock approach
                    // timing: { timestamp: Date.now() } 
                }
            }
        };
    });

    test('should call engine.update once', () => {
        PhysicsSystem(mockEntities, { time: { delta: 16.66 } });
        expect(mockEngineUpdate).toHaveBeenCalledTimes(1);
    });

    test('should call engine.update with correct arguments', () => {
        const mockTime = { delta: 16.66 };
        PhysicsSystem(mockEntities, { time: mockTime });
        // Check arguments: delta time (engine instance is implicitly 'this')
        expect(mockEngineUpdate).toHaveBeenCalledWith(mockTime.delta);
    });

    test('should return entities object unchanged', () => {
        const result = PhysicsSystem(mockEntities, { time: { delta: 16.66 } });
        expect(result).toBe(mockEntities); // Should return the same object reference
    });
}); 