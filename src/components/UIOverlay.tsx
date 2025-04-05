import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

// Get screen dimensions for positioning
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define the props the component expects
interface UIOverlayProps {
    fuel: number;
    altitude: number;
    hVel: number;
    vVel: number;
    status: string;
    currentLevel: number;
    totalLevels: number;
    // Optional props for button styling
    isThrusting?: boolean;
    lateralDirection?: 'left' | 'right' | 'none';
    // Action callbacks
    onStartThrust: () => void;
    onStopThrust: () => void;
    onStartMoveLeft: () => void;
    onStartMoveRight: () => void;
    onStopMove: () => void;
    onRestart: () => void;
    onNextLevel: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({
    fuel,
    altitude,
    hVel,
    vVel,
    status,
    currentLevel,
    totalLevels,
    isThrusting,
    lateralDirection,
    onStartThrust,
    onStopThrust,
    onStartMoveLeft,
    onStartMoveRight,
    onStopMove,
    onRestart,
    onNextLevel,
}) => {

    // Format displayed values
    const formatNumber = (num: number) => num.toFixed(2);

    const isGameOver = status !== 'playing';
    let statusMessage = '';
    // Update status message logic for detailed crash reasons
    switch (status) {
        case 'landed':
            statusMessage = 'Landed Safely!';
            break;
        case 'crashed-fuel':
            statusMessage = 'Out of Fuel!';
            break;
        case 'crashed-pad-speed':
            statusMessage = 'Crashed! Too fast.';
            break;
        case 'crashed-pad-angle':
            statusMessage = 'Crashed! Bad angle.';
            break;
        case 'crashed-terrain':
            statusMessage = 'Crashed! Hit terrain.';
            break;
        default:
            // Fallback for any unknown crash status
            if (status.startsWith('crashed')) {
                statusMessage = 'Crashed!';
            }
            break;
    }

    const showNextLevelButton = status === 'landed' && currentLevel < totalLevels;
    const showRestartButton = isGameOver && !showNextLevelButton;
    const restartButtonText = status === 'landed' ? 'Replay Level' : 'Retry?';

    // Determine button styles based on state
    const thrustButtonStyle = isThrusting ? styles.buttonActive : styles.buttonInactive;
    const leftButtonStyle = lateralDirection === 'left' ? styles.buttonActive : styles.buttonInactive;
    const rightButtonStyle = lateralDirection === 'right' ? styles.buttonActive : styles.buttonInactive;

    return (
        <View style={styles.overlayContainer} pointerEvents="box-none"> 
            {/* Info Display (Top Left) */}
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>Level: {currentLevel}</Text>
                <Text style={styles.infoText}>Fuel: {formatNumber(fuel)}</Text>
                <Text style={styles.infoText}>Alt: {formatNumber(altitude)}</Text>
                <Text style={styles.infoText}>HVel: {formatNumber(hVel)}</Text>
                <Text style={styles.infoText}>VVel: {formatNumber(vVel)}</Text>
            </View>

            {/* Game Status Display (Top Center) */}
            {isGameOver && (
                <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>{statusMessage}</Text>
                    {showNextLevelButton && (
                        <TouchableOpacity onPress={onNextLevel} style={styles.restartButton}>
                            <Text style={styles.restartText}>Next Level</Text>
                        </TouchableOpacity>
                    )}
                    {showRestartButton && (
                        <TouchableOpacity onPress={onRestart} style={styles.restartButton}>
                            <Text style={styles.restartText}>{restartButtonText}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Controls (Bottom) - Only active if game is playing */}
            {!isGameOver && (
                 <View style={styles.controlsContainer} pointerEvents="box-none"> 
                    <TouchableOpacity
                        style={[styles.controlButton, styles.leftButton, leftButtonStyle]}
                        onPressIn={onStartMoveLeft}
                        onPressOut={onStopMove}
                    >
                        <Text style={styles.controlText}>{'<'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.controlButton, styles.thrustButton, thrustButtonStyle]}
                        onPressIn={onStartThrust}
                        onPressOut={onStopThrust}
                    >
                        <Text style={styles.controlText}>^</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.controlButton, styles.rightButton, rightButtonStyle]}
                        onPressIn={onStartMoveRight}
                        onPressOut={onStopMove}
                    >
                        <Text style={styles.controlText}>{'>'}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    overlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // backgroundColor: 'rgba(0, 0, 255, 0.1)', // Debug layout
    },
    infoContainer: {
        position: 'absolute',
        top: 50, // Adjust as needed
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 5,
    },
    infoText: {
        color: 'white',
        fontSize: 14,
        marginBottom: 3,
    },
    statusContainer: {
        position: 'absolute',
        top: SCREEN_HEIGHT * 0.3,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    statusText: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    restartButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    restartText: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 40, // Adjust as needed
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 30,
        // backgroundColor: 'rgba(255, 0, 0, 0.1)', // Debug layout
    },
    controlButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlText: {
        color: 'black',
        fontSize: 24,
        fontWeight: 'bold',
    },
    buttonActive: {
        backgroundColor: 'rgba(0, 255, 0, 0.5)',
    },
    buttonInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    leftButton: {
        // Add left button styles if needed
    },
    rightButton: {
        // Add right button styles if needed
    },
    thrustButton: {
        // Add thrust button styles if needed
    },
});

export default UIOverlay; 