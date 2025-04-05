// import { level1Config } from './level_1';
// import { level2Config } from './level_2';
import { LevelConfig } from '@/src/entities'; // Import the type

// Helper function for random factor within range
const randomFactor = (min: number, max: number) => Math.random() * (max - min) + min;

// --- Define Level Configurations Directly --- START

const level1: LevelConfig = {
  landingPad: {
    width: 80,
    xPositionFactor: 0.5,
  },
  lander: {
    initialFuel: 100,
    maxLandingSpeed: 2.0,
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
    maxLandingSpeed: 1.9,
  },
  terrain: {},
};

// Levels 3-10: Gentle decrease in fuel/width, slightly off-center pad
const level3: LevelConfig = { landingPad: { width: 58, xPositionFactor: randomFactor(0.4, 0.6) }, lander: { initialFuel: 78, maxLandingSpeed: 1.85 }, terrain: {} };
const level4: LevelConfig = { landingPad: { width: 56, xPositionFactor: randomFactor(0.35, 0.65) }, lander: { initialFuel: 76, maxLandingSpeed: 1.8 }, terrain: {} };
const level5: LevelConfig = { landingPad: { width: 54, xPositionFactor: randomFactor(0.3, 0.7) }, lander: { initialFuel: 74, maxLandingSpeed: 1.75 }, terrain: {} };
const level6: LevelConfig = { landingPad: { width: 52, xPositionFactor: randomFactor(0.3, 0.7) }, lander: { initialFuel: 71, maxLandingSpeed: 1.7 }, terrain: {} };
const level7: LevelConfig = { landingPad: { width: 50, xPositionFactor: randomFactor(0.25, 0.75) }, lander: { initialFuel: 68, maxLandingSpeed: 1.65 }, terrain: {} };
const level8: LevelConfig = { landingPad: { width: 48, xPositionFactor: randomFactor(0.25, 0.75) }, lander: { initialFuel: 65, maxLandingSpeed: 1.6 }, terrain: {} };
const level9: LevelConfig = { landingPad: { width: 46, xPositionFactor: randomFactor(0.2, 0.8) }, lander: { initialFuel: 62, maxLandingSpeed: 1.55 }, terrain: {} };
const level10: LevelConfig = { landingPad: { width: 45, xPositionFactor: randomFactor(0.2, 0.8) }, lander: { initialFuel: 59, maxLandingSpeed: 1.5 }, terrain: {} };

// Levels 11-18: Moderate decrease, wider pad position range
const level11: LevelConfig = { landingPad: { width: 44, xPositionFactor: randomFactor(0.2, 0.8) }, lander: { initialFuel: 57, maxLandingSpeed: 1.48 }, terrain: {} };
const level12: LevelConfig = { landingPad: { width: 43, xPositionFactor: randomFactor(0.15, 0.85) }, lander: { initialFuel: 55, maxLandingSpeed: 1.46 }, terrain: {} };
const level13: LevelConfig = { landingPad: { width: 42, xPositionFactor: randomFactor(0.15, 0.85) }, lander: { initialFuel: 53, maxLandingSpeed: 1.44 }, terrain: {} };
const level14: LevelConfig = { landingPad: { width: 41, xPositionFactor: randomFactor(0.15, 0.85) }, lander: { initialFuel: 50, maxLandingSpeed: 1.42 }, terrain: {} };
const level15: LevelConfig = { landingPad: { width: 40, xPositionFactor: randomFactor(0.1, 0.9) }, lander: { initialFuel: 48, maxLandingSpeed: 1.40 }, terrain: {} };
const level16: LevelConfig = { landingPad: { width: 38, xPositionFactor: randomFactor(0.1, 0.9) }, lander: { initialFuel: 46, maxLandingSpeed: 1.38 }, terrain: {} };
const level17: LevelConfig = { landingPad: { width: 36, xPositionFactor: randomFactor(0.1, 0.9) }, lander: { initialFuel: 44, maxLandingSpeed: 1.36 }, terrain: {} };
const level18: LevelConfig = { landingPad: { width: 35, xPositionFactor: randomFactor(0.1, 0.9) }, lander: { initialFuel: 42, maxLandingSpeed: 1.34 }, terrain: {} };

// Levels 19-27: Steeper decrease, pad near edges
const level19: LevelConfig = { landingPad: { width: 34, xPositionFactor: randomFactor(0.1, 0.3) }, lander: { initialFuel: 40, maxLandingSpeed: 1.32 }, terrain: {} }; // Force left
const level20: LevelConfig = { landingPad: { width: 33, xPositionFactor: randomFactor(0.7, 0.9) }, lander: { initialFuel: 38, maxLandingSpeed: 1.30 }, terrain: {} }; // Force right
const level21: LevelConfig = { landingPad: { width: 32, xPositionFactor: randomFactor(0.1, 0.9) }, lander: { initialFuel: 36, maxLandingSpeed: 1.28 }, terrain: {} };
const level22: LevelConfig = { landingPad: { width: 31, xPositionFactor: randomFactor(0.1, 0.35) }, lander: { initialFuel: 34, maxLandingSpeed: 1.26 }, terrain: {} }; // Tend left
const level23: LevelConfig = { landingPad: { width: 30, xPositionFactor: randomFactor(0.65, 0.9) }, lander: { initialFuel: 32, maxLandingSpeed: 1.24 }, terrain: {} }; // Tend right
const level24: LevelConfig = { landingPad: { width: 29, xPositionFactor: randomFactor(0.1, 0.9) }, lander: { initialFuel: 30, maxLandingSpeed: 1.22 }, terrain: {} };
const level25: LevelConfig = { landingPad: { width: 28, xPositionFactor: randomFactor(0.05, 0.25) }, lander: { initialFuel: 28, maxLandingSpeed: 1.20 }, terrain: {} }; // Far left
const level26: LevelConfig = { landingPad: { width: 27, xPositionFactor: randomFactor(0.75, 0.95) }, lander: { initialFuel: 26, maxLandingSpeed: 1.18 }, terrain: {} }; // Far right
const level27: LevelConfig = { landingPad: { width: 26, xPositionFactor: randomFactor(0.05, 0.95) }, lander: { initialFuel: 25, maxLandingSpeed: 1.15 }, terrain: {} }; // Max random, very tight speed

// --- Define Level Configurations Directly --- END

// Array holding all level configurations in order
export const levels: LevelConfig[] = [
    level1,
    level2,
    level3,
    level4,
    level5,
    level6,
    level7,
    level8,
    level9,
    level10,
    level11,
    level12,
    level13,
    level14,
    level15,
    level16,
    level17,
    level18,
    level19,
    level20,
    level21,
    level22,
    level23,
    level24,
    level25,
    level26,
    level27,
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