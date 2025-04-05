// import { level1Config } from './level_1';
// import { level2Config } from './level_2';
import { LevelConfig } from '@/src/entities'; // Import the type

// --- Define Level Configurations Directly --- START

const level1: LevelConfig = {
  landingPad: {
    width: 80,
    xPositionFactor: 0.5,
  },
  lander: {
    initialFuel: 100,
  },
  terrain: {},
};

const level2: LevelConfig = {
  landingPad: {
    width: 60,
    xPositionFactor: 0.5,
  },
  lander: {
    initialFuel: 80,
  },
  terrain: {},
};

// --- Define Level Configurations Directly --- END

// Array holding all level configurations in order
export const levels: LevelConfig[] = [
    level1, // Use the constant defined above
    level2, // Use the constant defined above
    // Add future level constants here
];

/**
 * Gets the configuration for a specific level number.
 * @param levelNumber The 1-based level number.
 * @returns The level configuration object, or undefined if the level doesn't exist.
 */
export const getLevelConfig = (levelNumber: number): LevelConfig | undefined => {
    const index = levelNumber - 1; // Convert to 0-based index
    if (index >= 0 && index < levels.length) {
        return levels[index];
    }
    return undefined; // Level number out of bounds
};

/**
 * Gets the total number of available levels.
 * @returns The total number of levels.
 */
export const getTotalLevels = (): number => {
    return levels.length;
}; 