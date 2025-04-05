import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, AppState } from 'react-native';
import Matter from 'matter-js';
import { GameEngine } from 'react-native-game-engine';

// Physics Setup (Step 2)
import {
    initializePhysics,
    createLanderBody,
    createTerrainBodies,
    createLandingPadBody,
} from '@/src/physics/setup';

// Entities Setup (Step 3.B-1)
import { createInitialEntities } from '@/src/entities';

// Systems Setup (Step 3.B-2)
import systems from '@/src/systems'; // The array of systems from src/systems/index.ts

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
    const [running, setRunning] = useState(true); // Game loop state
    const [entities, setEntities] = useState<BasicEntities | null>(null);
    const gameEngineRef = useRef<GameEngine>(null);

    // Use refs for physics objects to avoid recreating on re-renders
    const physicsRef = useRef<PhysicsHandles | null>(null);
    const landerBodyRef = useRef<Matter.Body | null>(null);
    const terrainBodiesRef = useRef<Matter.Body[]>([]);
    const landingPadBodyRef = useRef<Matter.Body | null>(null);

    // --- Initialization Effect ---
    useEffect(() => {
        // 1. Initialize Physics Engine and World
        const physics = initializePhysics();
        physicsRef.current = physics;
        const { engine, world } = physics;

        // 2. Create Physics Bodies
        landerBodyRef.current = createLanderBody({ /* options if needed */ });
        terrainBodiesRef.current = createTerrainBodies(); // Using default terrain
        landingPadBodyRef.current = createLandingPadBody({ /* options if needed */ });

        // 3. Add Bodies to World
        Matter.World.add(world, [
            landerBodyRef.current,
            ...terrainBodiesRef.current,
            landingPadBodyRef.current,
        ]);

        // 4. Create Initial Entities for GameEngine
        const initialEntities = createInitialEntities(
            engine,
            world,
            landerBodyRef.current,
            terrainBodiesRef.current,
            landingPadBodyRef.current,
            GAME_CONSTANTS
        );
        setEntities(initialEntities);

        // --- App State Handling (Pause/Resume) ---
        const handleAppStateChange = (nextAppState: any) => {
            setRunning(nextAppState === 'active');
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // --- Cleanup ---
        return () => {
            subscription.remove();
            // Remove bodies from the world
            if (world && landerBodyRef.current) {
                Matter.World.remove(world, [
                    landerBodyRef.current,
                    ...terrainBodiesRef.current,
                    landingPadBodyRef.current as Matter.Body, // Type assertion might be needed
                ]);
            }
            // Clear the engine
            if (engine) {
                Matter.Engine.clear(engine);
            }
            // Clear refs
            physicsRef.current = null;
            landerBodyRef.current = null;
            terrainBodiesRef.current = [];
            landingPadBodyRef.current = null;
        };
    }, []); // Run only once on mount

    // --- Render Game Engine ---
    if (!entities) {
        // Show loading or placeholder while entities are initializing
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <GameEngine
                ref={gameEngineRef}
                style={styles.gameContainer}
                systems={systems} // Pass the imported systems array
                entities={entities} // Pass the initial entities
                running={running} // Control the game loop
                onEvent={(e: any) => {
                    // Handle specific events dispatched by systems if needed at this level
                    if (e.type === 'game-over' || e.type === 'landed' || e.type === 'crashed-terrain') {
                         console.log('Game Event:', e.type);
                         // setRunning(false); // Example: Stop game on game-over
                    }
                }}
            >
                {/* Status Bar or other overlays can go here if needed outside the engine */}
            </GameEngine>
            {/* UI Controls (Buttons, etc.) will go here in Step 5 */}
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
