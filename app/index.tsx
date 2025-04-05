import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Dimensions, AppState, Platform } from 'react-native';
import Matter from 'matter-js';
import { GameEngine } from 'react-native-game-engine';

// Import level manager functions
import { getLevelConfig, getTotalLevels } from '@/src/levels/levelManager';
import { LevelConfig } from '@/src/entities'; // Import LevelConfig type

// Physics Setup (Step 2)
import {
    initializePhysics,
    createLanderBody,
    createTerrainBodies,
    createLandingPadBody,
    generateTerrainVertices,
    Vec2D,
} from '@/src/physics/setup';

// Entities Setup (Step 3.B-1)
import { createInitialEntities } from '@/src/entities';

// Systems Setup (Step 3.B-2)
import systems from '@/src/systems'; // The array of systems from src/systems/index.ts

// UI Component
import UIOverlay from '@/src/components/UIOverlay'; // Import the UI component
import StaticStarfield from '@/src/components/StaticStarfield'; // Import starfield

// Define types for our refs/state - Ideally share these from entities/index.ts
interface PhysicsHandles {
    engine: Matter.Engine;
    world: Matter.World;
}
// Basic entity structure for typing state/ref
interface BasicEntities { [key: string]: any; }

// Game Constants (example values, define appropriately)
const GAME_CONSTANTS = {
    LANDER_WIDTH: 40,
    LANDER_HEIGHT: 40,
    PAD_HEIGHT: 10,
};

export default function GameScreen() {
    const [running, setRunning] = useState(true);
    const [entities, setEntities] = useState<BasicEntities | null>(null);
    const [gameKey, setGameKey] = useState(0);
    const [currentLevel, setCurrentLevel] = useState(1);
    const gameEngineRef = useRef<GameEngine>(null);

    // Refs for physics objects
    const physicsRef = useRef<PhysicsHandles | null>(null);
    // Note: We don't need refs for individual bodies here anymore if restart re-initializes everything

    // State for UI Data
    const [uiData, setUiData] = useState({
        fuel: 0,
        altitude: 0,
        hVel: 0,
        vVel: 0,
        status: 'playing',
    });

    // State for Player Input Actions
    const [isThrusting, setIsThrusting] = useState(false);
    const [lateralInput, setLateralInput] = useState<'left' | 'right' | 'none'>('none');

    // --- Game Setup/Restart Logic ---
    const setupGame = useCallback(() => {
        console.log(`Setting up / Restarting game for Level ${currentLevel}...`);

        // Load the current level config using the manager
        const levelConfig = getLevelConfig(currentLevel);

        if (!levelConfig) {
            console.error(`Could not load config for level ${currentLevel}`);
            setRunning(false);
            return;
        }

        // Always initialize a fresh physics instance.
        const physics = initializePhysics();
        physicsRef.current = physics;
        const { engine, world } = physics;

        // 1. (Physics already initialized above)
        const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
        const landingPadWidth = levelConfig.landingPad.width;
        const landingPadX = screenWidth * levelConfig.landingPad.xPositionFactor;
        const landingPadY = screenHeight - 50 - (GAME_CONSTANTS.PAD_HEIGHT / 2);
        const landingPadTopY = landingPadY - (GAME_CONSTANTS.PAD_HEIGHT / 2);

        // 2. Create Physics Bodies (using the new world)
        const originalTerrainVertices = generateTerrainVertices(
            screenWidth,
            screenHeight,
            landingPadX,
            landingPadWidth,
            landingPadTopY
        );
        const landerBody = createLanderBody();
        const terrainBodies = createTerrainBodies(originalTerrainVertices);
        const landingPadBody = createLandingPadBody(landingPadX, landingPadY, landingPadWidth);

        // 3. Add Bodies to the new World
        Matter.World.add(world, [
            landerBody,
            ...terrainBodies,
            landingPadBody,
        ]);

        // 4. Create Initial Entities
        const initialEntities = createInitialEntities(
            engine,
            world,
            landerBody,
            terrainBodies,
            originalTerrainVertices,
            landingPadBody,
            levelConfig
        );
        // Set the entities AFTER they are created
        setEntities(initialEntities);
        console.log('New entities created with fresh physics world and level config.');

        // Reset Input State
        setIsThrusting(false);
        setLateralInput('none');

        // Reset UI State & Running State
        setUiData({
            fuel: levelConfig.lander.initialFuel,
            altitude: 0,
            hVel: 0,
            vVel: 0,
            status: 'playing',
        });
        setRunning(true);

    }, [currentLevel]);

    // --- Level Advancement Logic ---
    const handleNextLevel = useCallback(() => {
        const totalLevels = getTotalLevels();
        if (currentLevel < totalLevels) {
            // Update level first
            setCurrentLevel(prevLevel => prevLevel + 1);
            // Then trigger remount via key
            setGameKey(prevKey => prevKey + 1);
        } else {
            console.log('All levels completed!');
            // Optionally reset:
            // setCurrentLevel(1);
            // setGameKey(prevKey => prevKey + 1);
        }
    }, [currentLevel]);

    // --- Restart Current Level Logic ---
    const handleRestart = useCallback(() => {
        console.log(`Restarting Level ${currentLevel}...`);
        // Trigger remount via key, setupGame will use the existing currentLevel
        setGameKey(prevKey => prevKey + 1);
    }, [currentLevel]);

    // --- Initial Setup and Reset Effect (triggered by gameKey) ---
    useEffect(() => {
        console.log(`Effect triggered by gameKey change: ${gameKey}`);
        // Explicitly clear entities to ensure GameEngine gets null initially on remount
        setEntities(null);

        // Use a minimal timeout to allow the state update and remount to process
        // before setting up the new game state.
        const timer = setTimeout(() => {
            setupGame(); // Call setup AFTER clearing entities
        }, 0); // Timeout 0 pushes execution to the next event loop tick

        // App State Handling (Pause/Resume)
        const handleAppStateChange = (nextAppState: any) => {
            // Only set running based on app state if the game *should* be running
            // (i.e. not already in a game over state managed by game logic)
            if (uiData.status === 'playing') {
                setRunning(nextAppState === 'active');
            }
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            clearTimeout(timer); // Clean up timer
            subscription.remove();
            // Cleanup physics engine on unmount or before next setup
            if (physicsRef.current?.engine) {
                Matter.Engine.clear(physicsRef.current.engine);
                physicsRef.current = null; // Clear the ref
                console.log('Cleared physics engine.');
            }
        };
        // This effect now ONLY depends on gameKey
    }, [gameKey, setupGame]); // Include setupGame because it's called inside

    // --- Event Handling from Game Engine ---
    const handleEvent = useCallback((event: any) => {
        if (event.type === 'ui-update') {
            const newStatus = event.payload.status;
            // Only log the status change when it transitions from playing
            if (uiData.status === 'playing' && (newStatus === 'landed' || newStatus.startsWith('crashed'))) {
                console.log(`Game ended with status: ${newStatus}`);
            }
            setUiData(event.payload);
            // If the game has ended, stop the engine
            if (newStatus !== 'playing') {
                setRunning(false);
            }
        }
    }, [uiData.status]); // Depend on uiData.status to get the latest value

    // --- Action Handlers for UI Controls (Now update state) ---
    const handleStartThrust = useCallback(() => setIsThrusting(true), []);
    const handleStopThrust = useCallback(() => setIsThrusting(false), []);
    const handleStartMoveLeft = useCallback(() => setLateralInput('left'), []);
    const handleStartMoveRight = useCallback(() => setLateralInput('right'), []);
    const handleStopMove = useCallback(() => setLateralInput('none'), []);

    // --- Keyboard Event Handling --- (New Section)
    useEffect(() => {
        // Only add keyboard listeners on web platforms
        if (Platform.OS !== 'web') {
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return; // Ignore repeated events from holding key down

            switch (e.key) {
                case 'ArrowUp':
                    handleStartThrust();
                    break;
                case 'ArrowLeft':
                    handleStartMoveLeft();
                    break;
                case 'ArrowRight':
                    handleStartMoveRight();
                    break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp':
                    handleStopThrust();
                    break;
                case 'ArrowLeft':
                    // Only stop if moving left was the last input
                    if (lateralInput === 'left') {
                       handleStopMove();
                    }
                    break;
                case 'ArrowRight':
                    // Only stop if moving right was the last input
                    if (lateralInput === 'right') {
                       handleStopMove();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Cleanup function
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
        // Re-run if handlers change identity (they shouldn't with useCallback)
        // Also include lateralInput to ensure keyup logic uses latest state
    }, [handleStartThrust, handleStopThrust, handleStartMoveLeft, handleStartMoveRight, handleStopMove, lateralInput]);

    // --- Prepare Entities for Current Frame ---
    const currentFrameEntities = entities ? { ...entities } : null;
    if (currentFrameEntities) {
        // Update input state for ControlSystem
        if (currentFrameEntities.gameState?.inputState) {
            currentFrameEntities.gameState.inputState.thrusting = isThrusting;
            currentFrameEntities.gameState.inputState.lateral = lateralInput;
        }
        // Update lander entity for Renderer
        if (currentFrameEntities.lander) {
            currentFrameEntities.lander.isThrusting = isThrusting;
            currentFrameEntities.lander.lateralDirection = lateralInput;
        }
    }

    // Loading state handled by entities being null
    // Reverted loading state handling
    if (!entities) {
        return (
            <View style={styles.container}>
                <StaticStarfield />
                <Text style={styles.loadingText}>Loading Level {currentLevel}...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StaticStarfield />
            <GameEngine
                key={gameKey}
                ref={gameEngineRef}
                style={styles.gameContainer}
                systems={systems}
                entities={entities}
                running={running}
                onEvent={handleEvent}
            />

            <UIOverlay
                fuel={uiData.fuel}
                altitude={uiData.altitude}
                hVel={uiData.hVel}
                vVel={uiData.vVel}
                status={uiData.status}
                isThrusting={isThrusting}
                lateralDirection={lateralInput}
                currentLevel={currentLevel}
                totalLevels={getTotalLevels()}
                onStartThrust={handleStartThrust}
                onStopThrust={handleStopThrust}
                onStartMoveLeft={handleStartMoveLeft}
                onStartMoveRight={handleStartMoveRight}
                onStopMove={handleStopMove}
                onRestart={handleRestart}
                onNextLevel={handleNextLevel}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    gameContainer: {
        flex: 1,
    },
    loadingText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 100,
    },
});
