import { GameStateSystem } from './gameState'; // System to be tested

describe('GameStateSystem', () => {
    let mockEntities: any;
    let mockDispatch: any;

    beforeEach(() => {
        // Reset entities for each test
        mockEntities = {
            gameState: {
                status: 'playing',
                fuel: 50,
            }
            // Add other entities if the system interacts with them
        };
        // Mock dispatch is not typically passed TO GameStateSystem,
        // but it might be used *by* it if it dispatches new events.
        // For testing purposes, we might check its calls if needed.
        mockDispatch = jest.fn();
    });

    test('should change status to "crashed-fuel" if fuel is zero or less', () => {
        mockEntities.gameState.fuel = 0;
        const updatedEntities = GameStateSystem(mockEntities, { dispatch: mockDispatch });
        expect(updatedEntities.gameState.status).toBe('crashed-fuel');

        mockEntities.gameState.fuel = -10; // Also check negative
        mockEntities.gameState.status = 'playing'; // Reset status
        const updatedEntitiesNegative = GameStateSystem(mockEntities, { dispatch: mockDispatch });
        expect(updatedEntitiesNegative.gameState.status).toBe('crashed-fuel');
    });

    test('should not change status if fuel is positive', () => {
        mockEntities.gameState.fuel = 1;
        const initialStatus = mockEntities.gameState.status;
        const updatedEntities = GameStateSystem(mockEntities, { dispatch: mockDispatch });
        expect(updatedEntities.gameState.status).toBe(initialStatus);
    });

    test('should update status based on "collision" event', () => {
        const collisionEventLanded = { type: 'collision', outcome: 'landed' };
        const updatedEntitiesLanded = GameStateSystem(mockEntities, { events: [collisionEventLanded] });
        expect(updatedEntitiesLanded.gameState.status).toBe('landed');

        // Reset status for next check
        mockEntities.gameState.status = 'playing';

        const collisionEventCrashed = { type: 'collision', outcome: 'crashed-terrain' };
        const updatedEntitiesCrashed = GameStateSystem(mockEntities, { events: [collisionEventCrashed] });
        expect(updatedEntitiesCrashed.gameState.status).toBe('crashed-terrain');
    });

    test('should ignore irrelevant events', () => {
        const irrelevantEvent = { type: 'other-event', data: 'abc' };
        const initialStatus = mockEntities.gameState.status;
        const updatedEntities = GameStateSystem(mockEntities, { events: [irrelevantEvent] });
        expect(updatedEntities.gameState.status).toBe(initialStatus);
    });

    test('should not change status if already landed or crashed', () => {
        mockEntities.gameState.status = 'landed';
        mockEntities.gameState.fuel = 0; // Fuel check shouldn't override final state
        let updatedEntities = GameStateSystem(mockEntities, { events: [] });
        expect(updatedEntities.gameState.status).toBe('landed');

        const collisionEventCrashed = { type: 'collision', outcome: 'crashed-terrain' };
        updatedEntities = GameStateSystem(mockEntities, { events: [collisionEventCrashed] });
        expect(updatedEntities.gameState.status).toBe('landed'); // Should stay landed

        mockEntities.gameState.status = 'crashed-fuel';
        const collisionEventLanded = { type: 'collision', outcome: 'landed' };
        updatedEntities = GameStateSystem(mockEntities, { events: [collisionEventLanded] });
        expect(updatedEntities.gameState.status).toBe('crashed-fuel'); // Should stay crashed
    });

     test('should return entities object', () => {
        const result = GameStateSystem(mockEntities, { events: [] });
        expect(result).toBe(mockEntities);
    });

}); 