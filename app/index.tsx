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
    MAX_LANDING_ANGLE, // Import the constant
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
    // Add state for lives and final game over
    const [lives, setLives] = useState(3);
    const [isFinalGameOver, setIsFinalGameOver] = useState(false);

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
        // Initialize crash speed details
        crashSpeed: undefined as number | undefined,
        crashSpeedLimit: undefined as number | undefined,
    });

    // State for Player Input Actions (Modified)
    const [isThrusting, setIsThrusting] = useState(false);
    const [isLeftThrusterActive, setIsLeftThrusterActive] = useState(false); // <<< New state
    const [isRightThrusterActive, setIsRightThrusterActive] = useState(false); // <<< New state

    // --- Game Setup/Restart Logic ---
    const setupGame = useCallback(() => {
        console.log(`Setting up / Restarting game for Level ${currentLevel}...`);

        // Load the current level config using the manager
        const levelConfig = getLevelConfig(currentLevel);
        console.log('DEBUG: After getLevelConfig'); // Log 1

        if (!levelConfig) {
            console.error(`Could not load config for level ${currentLevel}`);
            setRunning(false);
            return;
        }

        // Always initialize a fresh physics instance.
        const physics = initializePhysics();
        physicsRef.current = physics;
        const { engine, world } = physics;
        console.log('DEBUG: After initializePhysics'); // Log 2

        // Capture necessary config values for the event listener closure
        const maxLandingSpeed = levelConfig.lander.maxLandingSpeed;

        // --- Collision Event Handling ---
        Matter.Events.on(engine, 'collisionStart', (event) => {
            const pairs = event.pairs;
            let didCollideWithPad = false;
            let didCollideWithTerrain = false;
            let landerBodyForCheck: Matter.Body | null = null;

            // Step 1: Iterate through all pairs to identify collision types
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i];
                let currentLanderBody: Matter.Body | null = null;
                let otherBody: Matter.Body | null = null;

                if (pair.bodyA.label === 'lander') {
                    currentLanderBody = pair.bodyA;
                    otherBody = pair.bodyB;
                } else if (pair.bodyB.label === 'lander') {
                    currentLanderBody = pair.bodyB;
                    otherBody = pair.bodyA;
                }

                if (currentLanderBody && otherBody) {
                    landerBodyForCheck = currentLanderBody; // Store ref to lander body
                    if (otherBody.label === 'landingPad') {
                        didCollideWithPad = true;
                    } else if (otherBody.label === 'terrain') {
                        didCollideWithTerrain = true;
                    }
                }

                // Optimization: If we've found both types, no need to check further pairs
                if (didCollideWithPad && didCollideWithTerrain) {
                    break;
                }
            }

            // Step 2: Prioritize and dispatch based on findings
            if (didCollideWithPad && landerBodyForCheck) {
                // Prioritize pad collision: Check landing conditions
                const landedSafely = landerBodyForCheck.speed < maxLandingSpeed &&
                                   Math.abs(landerBodyForCheck.angle) < MAX_LANDING_ANGLE;

                if (landedSafely) {
                    (gameEngineRef.current as any)?.dispatch({ type: 'collision', outcome: 'landed' });
                } else {
                    const reason = landerBodyForCheck.speed >= maxLandingSpeed ? 'speed' : 'angle';
                    // Dispatch speed details if the reason is speed
                    const payload: any = { type: 'collision', outcome: `crashed-pad-${reason}` };
                    if (reason === 'speed') {
                        payload.speed = landerBodyForCheck.speed;
                        payload.limit = maxLandingSpeed;
                    }
                    (gameEngineRef.current as any)?.dispatch(payload);
                }
            } else if (didCollideWithTerrain) {
                // Only dispatch terrain crash if NO pad collision occurred
                (gameEngineRef.current as any)?.dispatch({ type: 'collision', outcome: 'crashed-terrain' });
            }
            // If neither, do nothing (e.g., collision between two terrain parts)
        });
        console.log('DEBUG: After Matter.Events.on'); // Log 3
        // --- End Collision Event Handling ---

        // 1. (Physics already initialized above)
        const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
        console.log('DEBUG: After Dimensions.get'); // Log 4
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
        console.log('DEBUG: After generateTerrainVertices'); // Log 5
        const landerBody = createLanderBody();
        console.log('DEBUG: After createLanderBody'); // Log 6
        const terrainBodies = createTerrainBodies(originalTerrainVertices);
        console.log('DEBUG: After createTerrainBodies'); // Log 7
        const landingPadBody = createLandingPadBody(landingPadX, landingPadY, landingPadWidth);
        console.log('DEBUG: After createLandingPadBody'); // Log 8

        // --- Log terrainBodies before adding ---
        console.log(`DEBUG: terrainBodies before add: typeof=${typeof terrainBodies}, isArray=${Array.isArray(terrainBodies)}, length=${terrainBodies?.length}`);
        try {
            if (Array.isArray(terrainBodies)) {
                const bodyInfo = terrainBodies.map((b, i) => `[${i}]: ${b?.label || 'No Label'}(id:${b?.id})`);
                console.log(`DEBUG: terrainBodies content: [${bodyInfo.join(', ')}]`);
                // Log properties of the first body if it exists
                if (terrainBodies.length > 0 && terrainBodies[0]) {
                    console.log(`DEBUG: First terrain body keys: ${Object.keys(terrainBodies[0]).join(', ')}`);
                }
            }
        } catch (e) {
            console.log('DEBUG: Error inspecting terrainBodies:', e);
        }
        // --- End Log ---

        // 3. Add Bodies to the new World
        Matter.World.add(world, [
            landerBody,
            ...terrainBodies,
            landingPadBody,
        ]);
        console.log('DEBUG: After Matter.World.add'); // Log 9

        // DEBUG LOGGING START
        // console.log('--- Debugging arguments for createInitialEntities ---');
        // ... other argument logs ...
        // console.log('--- End Debugging arguments ---');
        // DEBUG LOGGING END

        // 4. Create Initial Entities
        console.log('DEBUG: BEFORE createInitialEntities call'); // Log 10
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
        setIsLeftThrusterActive(false);
        setIsRightThrusterActive(false);

        // Reset UI State & Running State
        setUiData({
            fuel: levelConfig.lander.initialFuel,
            altitude: 0,
            hVel: 0,
            vVel: 0,
            status: 'playing',
            // Initialize crash speed details
            crashSpeed: undefined,
            crashSpeedLimit: undefined,
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
        // Only allow restart if not final game over
        if (!isFinalGameOver) {
            console.log(`Restarting Level ${currentLevel}...`);
            // Trigger remount via key, setupGame will use the existing currentLevel
            setGameKey(prevKey => prevKey + 1);
        } else {
            console.log('Cannot restart, final game over.');
        }
    }, [currentLevel, isFinalGameOver]); // Add isFinalGameOver dependency

    // --- Start New Game Logic ---
    const handleNewGame = useCallback(() => {
        console.log('Starting New Game...');
        setLives(3);              // Reset lives
        setCurrentLevel(1);       // Reset to level 1
        setIsFinalGameOver(false); // Clear final game over flag
        setGameKey(prevKey => prevKey + 1); // Trigger remount/setup
    }, []); // No dependencies needed

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
            const previousStatus = uiData.status; 
            setUiData(event.payload); 

            // Check for transition to any crash state
            if (previousStatus === 'playing' && newStatus.startsWith('crashed')) {
                console.log(`Crash detected with status: ${newStatus}. Lives left: ${lives}`);
                
                // Handle lives deduction
                if (lives > 0) { 
                    const newLives = lives - 1;
                    setLives(newLives);
                    console.log(`Lives decremented to: ${newLives}`);
                    if (newLives === 0) {
                        console.log('Final life lost. Setting final game over.');
                        setIsFinalGameOver(true);
                        // Optional: Stop engine ONLY on final game over
                        // setRunning(false); 
                    }
                }
                // REMOVED: Stop the engine for any crash
                // setRunning(false); 

            } else if (newStatus === 'landed') {
                console.log(`Landed detected. Status: ${newStatus}`);
                // Stop engine on successful landing
                setRunning(false); 
            }
        }
    }, [uiData.status, lives]);

    // --- Action Handlers for UI Controls (Modified) ---
    const handleStartThrust = useCallback(() => setIsThrusting(true), []);
    const handleStopThrust = useCallback(() => setIsThrusting(false), []);
    
    // New individual handlers for lateral thrusters
    const handleStartMoveLeft = useCallback(() => setIsLeftThrusterActive(true), []);
    const handleStopMoveLeft = useCallback(() => setIsLeftThrusterActive(false), []);
    const handleStartMoveRight = useCallback(() => setIsRightThrusterActive(true), []);
    const handleStopMoveRight = useCallback(() => setIsRightThrusterActive(false), []);

    // --- Keyboard Event Handling (Modified) ---
    useEffect(() => {
        if (Platform.OS !== 'web') return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;
            switch (e.key) {
                case 'ArrowUp': handleStartThrust(); break;
                case 'ArrowLeft': handleStartMoveLeft(); break; // Use new handler
                case 'ArrowRight': handleStartMoveRight(); break; // Use new handler
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp': handleStopThrust(); break;
                case 'ArrowLeft': handleStopMoveLeft(); break; // Use new handler
                case 'ArrowRight': handleStopMoveRight(); break; // Use new handler
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleStartThrust, handleStopThrust, handleStartMoveLeft, handleStopMoveLeft, handleStartMoveRight, handleStopMoveRight]);

    // --- Prepare Entities for Current Frame (Modified) ---
    const currentFrameEntities = entities ? { ...entities } : null;
    if (currentFrameEntities) {
        // Determine lateral input based on independent states
        let lateral: 'left' | 'right' | 'none' = 'none';
        if (isLeftThrusterActive && !isRightThrusterActive) {
            lateral = 'left';
        } else if (isRightThrusterActive && !isLeftThrusterActive) {
            lateral = 'right';
        } // If both are active, lateral remains 'none' (no net lateral thrust)
        
        // Update input state for ControlSystem
        if (currentFrameEntities.gameState?.inputState) {
            currentFrameEntities.gameState.inputState.thrusting = isThrusting;
            currentFrameEntities.gameState.inputState.lateral = lateral; // Use derived lateral value
        }
        // Update lander entity for Renderer
        if (currentFrameEntities.lander) {
            currentFrameEntities.lander.isThrusting = isThrusting;
            currentFrameEntities.lander.lateralDirection = lateral; // Use derived lateral value
        }
    }

    // --- Rendering --- 
    if (!entities) {
        return (
            <View style={styles.container}>
                {/* Render Starfield last in loading view */}
                <Text style={styles.loadingText}>Loading Level {currentLevel}...</Text>
                <StaticStarfield />
            </View>
        );
    }

    return (
        <View style={styles.container}>
             {/* Render GameEngine and UI first */}
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
                crashSpeed={uiData.crashSpeed}
                crashSpeedLimit={uiData.crashSpeedLimit}
                lives={lives}
                isFinalGameOver={isFinalGameOver}
                isThrusting={isThrusting}
                isLeftThrusterActive={isLeftThrusterActive}
                isRightThrusterActive={isRightThrusterActive}
                onStartThrust={handleStartThrust}
                onStopThrust={handleStopThrust}
                onStartMoveLeft={handleStartMoveLeft}
                onStopMoveLeft={handleStopMoveLeft}
                onStartMoveRight={handleStartMoveRight}
                onStopMoveRight={handleStopMoveRight}
                onRestart={handleRestart}
                onNextLevel={handleNextLevel}
                onNewGame={handleNewGame}
            />
            {/* Render Starfield last so it potentially draws over the black background */}
            <StaticStarfield />
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
