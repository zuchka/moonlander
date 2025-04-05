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

        // Always initialize a fresh physics instance.
        const physics = initializePhysics();
        physicsRef.current = physics; // Store the new instance in the ref
        const { engine, world } = physics;

        // 1. (Physics already initialized above)

        // Pre-calculate dimensions and landing pad info
        const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
        const landingPadWidth = GAME_CONSTANTS.PAD_WIDTH;

        // --- Randomize Landing Pad Position --- START
        const minPadX = landingPadWidth; // Keep some margin from left edge
        const maxPadX = screenWidth - landingPadWidth; // Keep some margin from right edge
        const landingPadX = Math.floor(Math.random() * (maxPadX - minPadX + 1)) + minPadX;
        // --- Randomize Landing Pad Position --- END

        // Y position calculation needs landingPadHeight (use constant)
        const landingPadY = screenHeight - 50 - (GAME_CONSTANTS.PAD_HEIGHT / 2); // Position relative to bottom margin
        const landingPadTopY = landingPadY - (GAME_CONSTANTS.PAD_HEIGHT / 2); // Top surface Y

        // 2. Create Physics Bodies (using the new world)
        const originalTerrainVertices = generateTerrainVertices(
            screenWidth,
            screenHeight,
            landingPadX, // Use randomized X
            landingPadWidth,
            landingPadTopY // Pass the calculated top Y
        );
        const landerBody = createLanderBody();
        const terrainBodies = createTerrainBodies(originalTerrainVertices);
        const landingPadBody = createLandingPadBody(landingPadX, landingPadY);

        // 3. Add Bodies to the new World
        Matter.World.add(world, [
            landerBody,
            ...terrainBodies,
            landingPadBody,
        ]);

        // 4. Create Initial Entities (using the new engine/world)
        const initialEntities = createInitialEntities(
            engine, // Pass the new engine
            world,  // Pass the new world
            landerBody,
            terrainBodies,
            originalTerrainVertices,
            landingPadBody,
            GAME_CONSTANTS
        );
        setEntities(initialEntities);
        console.log('New entities created with fresh physics world.');

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
        setGameKey(prevKey => prevKey + 1); // Increment key to force GameEngine remount

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

    // Reverted loading state handling
    if (!entities) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
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
