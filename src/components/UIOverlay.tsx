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
    // Optional props for button styling
    isThrusting?: boolean;
    rotationDirection?: 'left' | 'right' | 'none';
    // Action callbacks
    onStartThrust: () => void;
    onStopThrust: () => void;
    onStartRotateLeft: () => void;
    onStartRotateRight: () => void;
    onStopRotate: () => void;
    onRestart: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({
    fuel,
    altitude,
    hVel,
    vVel,
    status,
    isThrusting,
    rotationDirection,
    onStartThrust,
    onStopThrust,
    onStartRotateLeft,
    onStartRotateRight,
    onStopRotate,
    onRestart,
}) => {

    // Format displayed values
    const formatNumber = (num: number) => num.toFixed(2);

    const isGameOver = status !== 'playing';
    let statusMessage = '';
    if (status === 'landed') statusMessage = 'Landed Safely!';
    else if (status === 'crashed-fuel') statusMessage = 'Out of Fuel!';
    else if (status.startsWith('crashed')) statusMessage = 'Crashed!';

    return (
        <View style={styles.overlayContainer} pointerEvents="box-none"> 
            {/* Info Display (Top Left) */}
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>Fuel: {formatNumber(fuel)}</Text>
                <Text style={styles.infoText}>Alt: {formatNumber(altitude)}</Text>
                <Text style={styles.infoText}>HVel: {formatNumber(hVel)}</Text>
                <Text style={styles.infoText}>VVel: {formatNumber(vVel)}</Text>
            </View>

            {/* Game Status Display (Top Center) */}
            {isGameOver && (
                <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>{statusMessage}</Text>
                    <TouchableOpacity onPress={onRestart} style={styles.restartButton}>
                        <Text style={styles.restartText}>Restart</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Controls (Bottom) - Only active if game is playing */}
            {!isGameOver && (
                 <View style={styles.controlsContainer} pointerEvents="box-none"> 
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPressIn={onStartRotateLeft}
                        onPressOut={onStopRotate}
                    >
                        <Text style={styles.controlText}>{'<'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPressIn={onStartThrust}
                        onPressOut={onStopThrust}
                    >
                        <Text style={styles.controlText}>^</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPressIn={onStartRotateRight}
                        onPressOut={onStopRotate}
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
});

export default UIOverlay; 