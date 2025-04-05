import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Dimensions, AppState } from 'react-native';
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
    const [rotationInput, setRotationInput] = useState<'left' | 'right' | 'none'>('none');

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
        setRotationInput('none');

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

    // --- Event Handler for UI Updates ---
    const handleEvent = useCallback((e: any) => {
        if (e.type === 'ui-update') {
            setUiData(e.payload);
        }
        // Optionally handle game over state change here too to stop engine
        if (e.payload?.status && e.payload.status !== 'playing'){
             console.log('Game ended with status:', e.payload.status);
             // setRunning(false); // Optionally stop engine immediately
        }
    }, []);

    // --- Action Handlers for UI Controls (Now update state) ---
    const handleStartThrust = useCallback(() => setIsThrusting(true), []);
    const handleStopThrust = useCallback(() => setIsThrusting(false), []);
    const handleStartRotateLeft = useCallback(() => setRotationInput('left'), []);
    const handleStartRotateRight = useCallback(() => setRotationInput('right'), []);
    const handleStopRotate = useCallback(() => setRotationInput('none'), []);

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
        currentFrameEntities.gameState.inputState.rotation = rotationInput;
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
                entities={currentFrameEntities} // Pass the modified entities
                running={running}
                onEvent={handleEvent}
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
                rotationDirection={rotationInput}
                onStartThrust={handleStartThrust}
                onStopThrust={handleStopThrust}
                onStartRotateLeft={handleStartRotateLeft}
                onStartRotateRight={handleStartRotateRight}
                onStopRotate={handleStopRotate}
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
