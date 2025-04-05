/**
 * The GameStateSystem updates the overall game state based on fuel and events.
 *
 * @param entities The current state of all game entities.
 * @param events An object containing the events payload (array of events).
 * @returns The updated entities state.
 */
const GameStateSystem = (entities: any, { events }: any) => {
    const gameState = entities.gameState;

    // Don't update state if game is already finished
    if (gameState.status !== 'playing') {
        return entities;
    }

    // Check for out of fuel condition first
    if (gameState.fuel <= 0) {
        gameState.status = 'crashed-fuel';
        return entities; // Game over, no need to process other events for state change
    }

    // Process events that might change the game state
    if (events && events.length > 0) {
        events.forEach((event: any) => {
            if (event.type === 'collision') {
                // Clear previous crash details on any new collision outcome
                delete gameState.crashSpeed;
                delete gameState.crashSpeedLimit;

                switch (event.outcome) {
                    case 'landed':
                        gameState.status = 'landed';
                        break;
                    case 'crashed-terrain':
                    case 'crashed-pad-angle':
                        gameState.status = event.outcome;
                        break;
                    case 'crashed-pad-speed':
                        gameState.status = event.outcome;
                        // Store speed details if available in the event payload
                        if (typeof event.speed === 'number' && typeof event.limit === 'number') {
                            gameState.crashSpeed = event.speed;
                            gameState.crashSpeedLimit = event.limit;
                        }
                        break;
                }
                // Once a collision changes status, we might ignore subsequent events in the same tick
                // For simplicity here, we process all, but the first 'landed' or 'crashed' will stick
                // due to the check at the beginning of the function.
            }
        });
    }

    return entities;
};

export { GameStateSystem }; 