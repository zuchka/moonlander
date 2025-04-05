import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Dimensions, AppState, Platform } from 'react-native';
import Matter from 'matter-js';
import { GameEngine } from 'react-native-game-engine';

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
    PAD_WIDTH: 80,
    PAD_HEIGHT: 10,
    INITIAL_FUEL: 100,
};

export default function GameScreen() {
    const [running, setRunning] = useState(true);
    const [entities, setEntities] = useState<BasicEntities | null>(null);
    const [gameKey, setGameKey] = useState(0);
    const gameEngineRef = useRef<GameEngine>(null);

    // Refs for physics objects
    const physicsRef = useRef<PhysicsHandles | null>(null);
    // Note: We don't need refs for individual bodies here anymore if restart re-initializes everything

    // State for UI Data
    const [uiData, setUiData] = useState({
        fuel: GAME_CONSTANTS.INITIAL_FUEL,
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
        console.log('Setting up / Restarting game...');
        // Clear previous engine if exists
        if (physicsRef.current?.engine) {
            Matter.Engine.clear(physicsRef.current.engine);
        }

        // 1. Initialize Physics Engine and World
        const physics = initializePhysics();
        physicsRef.current = physics;
        const { engine, world } = physics;

        // Pre-calculate dimensions and landing pad info
        const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
        const landingPadX = screenWidth / 2;
        const landingPadWidth = GAME_CONSTANTS.PAD_WIDTH;

        // 2. Create Physics Bodies
        const originalTerrainVertices = generateTerrainVertices(
            screenWidth,
            screenHeight,
            landingPadX,
            landingPadWidth
        );
        const landerBody = createLanderBody(); // No need for ref if only used here
        const terrainBodies = createTerrainBodies(originalTerrainVertices);
        const landingPadBody = createLandingPadBody();

        // 3. Add Bodies to World
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
            GAME_CONSTANTS
        );
        setEntities(initialEntities);
        console.log('New entities created:', Object.keys(initialEntities));

        // Reset Input State on setup/restart
        setIsThrusting(false);
        setLateralInput('none');

        // Reset UI State & Running State
        setUiData({
            fuel: GAME_CONSTANTS.INITIAL_FUEL,
            altitude: 0,
            hVel: 0,
            vVel: 0,
            status: 'playing',
        });
        setRunning(true);
        setGameKey(prevKey => prevKey + 1);

    }, []); // useCallback with empty dependency array

    // --- Initial Setup Effect ---
    useEffect(() => {
        setupGame(); // Call setup on initial mount

        // App State Handling (Pause/Resume)
        const handleAppStateChange = (nextAppState: any) => {
            setRunning(nextAppState === 'active');
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
            // Cleanup engine on unmount (already handled in setupGame on remount)
             if (physicsRef.current?.engine) {
                 Matter.Engine.clear(physicsRef.current.engine);
             }
        };
    }, [setupGame]); // Rerun if setupGame function identity changes (it shouldn't)

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

    // --- Render Game Engine & UI ---
    if (!entities) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    // --- Create entities object for this render frame ---
    // Start with the current entities state
    const currentFrameEntities = { ...entities }; 
    // Ensure gameState and inputState exist before modifying
    if (currentFrameEntities.gameState && currentFrameEntities.gameState.inputState) {
        // Update the inputState within the entities object for this frame
        currentFrameEntities.gameState.inputState.thrusting = isThrusting;
        currentFrameEntities.gameState.inputState.lateral = lateralInput;
    }
    // --- IMPORTANT: This direct mutation isn't ideal for state management paradigms
    // but is a common pattern when bridging external state into react-native-game-engine.

    return (
        <View style={styles.container}>
            <GameEngine
                key={gameKey}
                ref={gameEngineRef}
                style={styles.gameContainer}
                systems={systems} // Ensure InputSystem is NOT in here
                entities={currentFrameEntities} // Pass potentially updated entities
                running={running}
                onEvent={handleEvent} // Use the memoized handler
            >
                {/* Status Bar */}
            </GameEngine>

            {/* Render UI Overlay - pass action handlers */}
            <UIOverlay
                fuel={uiData.fuel}
                altitude={uiData.altitude}
                hVel={uiData.hVel}
                vVel={uiData.vVel}
                status={uiData.status}
                isThrusting={isThrusting}
                lateralDirection={lateralInput}
                onStartThrust={handleStartThrust}
                onStopThrust={handleStopThrust}
                onStartMoveLeft={handleStartMoveLeft}
                onStartMoveRight={handleStartMoveRight}
                onStopMove={handleStopMove}
                onRestart={setupGame}
            />
        </View>
    );
}

// Basic styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    gameContainer: {
        flex: 1, // Make engine fill the container
    },
    loadingText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 100,
    },
});
