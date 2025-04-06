import { Entities, GameState } from '../entities'; // Adjust path as needed

// Scoring Constants
const FUEL_SCORE_MULTIPLIER = 10;
const LEVEL_BONUS_MULTIPLIER = 100;

const ScoreSystem = (entities: Entities) => {
    const gameState = entities.gameState;

    if (!gameState) {
        return entities;
    }

    const currentStatus = gameState.status;
    const previousStatus = gameState.previousStatus;

    // Detect transition to 'landed' state
    if (currentStatus === 'landed' && previousStatus !== 'landed') {
        console.log('ScoreSystem: Landed detected!');
        
        // Calculate scores
        const fuelScore = Math.round(gameState.fuel * FUEL_SCORE_MULTIPLIER);
        const levelBonus = gameState.currentLevel * LEVEL_BONUS_MULTIPLIER;
        
        // Update gameState immediately (will be picked up by UI system)
        gameState.totalScore = (gameState.totalScore ?? 0) + fuelScore + levelBonus;
        gameState.justLandedFuelScore = fuelScore;
        gameState.justLandedLevelBonus = levelBonus;
        
        console.log(`Score updated: Fuel=${fuelScore}, Level=${levelBonus}, Total=${gameState.totalScore}`);
    }

    // Update previous status for next tick detection
    gameState.previousStatus = currentStatus;

    return entities;
};

export { ScoreSystem }; 