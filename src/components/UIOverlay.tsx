import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Svg, { Polygon, Rect, G } from 'react-native-svg'; // Import SVG components

// Get screen dimensions for positioning
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define the props the component expects
interface UIOverlayProps {
    fuel: number;
    altitude: number;
    hVel: number;
    vVel: number;
    status: string;
    crashSpeed?: number;
    crashSpeedLimit?: number;
    currentLevel: number;
    totalLevels: number;
    // Add props for lives system
    lives: number;
    isFinalGameOver: boolean;
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
    onNewGame: () => void; // Add callback for new game
}

// --- Reusable Lander Icon Component --- START
interface LanderIconProps {
    size: number;
}

const LanderIcon: React.FC<LanderIconProps> = ({ size }) => {
    const width = size;
    const height = size;

    // Simplified relative dimensions from Lander.tsx
    const bodyWidth = width * 0.7;
    const bodyHeight = height * 0.5;
    const ascentStageHeight = height * 0.3;
    const ascentStageWidth = width * 0.4;
    const legSpread = width * 0.45;
    const legTopAttach = bodyHeight * 0.3;
    const nozzleHeight = height * 0.15;
    const nozzleWidth = width * 0.2;
    const nozzleBottomY = (height + bodyHeight) / 2 + nozzleHeight;
    const ascentStageX = (width - ascentStageWidth) / 2;
    const ascentStageY = (height - bodyHeight) / 2 - ascentStageHeight;

    // Simplified geometry - adjust Y offsets slightly for icon clarity if needed
    const bodyY = (height - bodyHeight) / 2;
    const legsY = bodyY + legTopAttach;
    const nozzleY = (height + bodyHeight) / 2;

    return (
        <Svg width={width} height={height * 1.1} viewBox={`0 0 ${width} ${height * 1.1}`}>
            <G>
                <Rect x={(width - bodyWidth) / 2} y={bodyY} width={bodyWidth} height={bodyHeight} fill="#BDBDBD" />
                <Rect x={ascentStageX} y={ascentStageY} width={ascentStageWidth} height={ascentStageHeight} fill="#E0E0E0" />
                <Polygon points={`${width / 2 - nozzleWidth / 2},${nozzleY} ${width / 2 + nozzleWidth / 2},${nozzleY} ${width / 2},${nozzleY + nozzleHeight}`} fill="#616161" />
                <Polygon points={`${width / 2 - bodyWidth / 2},${legsY} ${width / 2 - legSpread},${height} ${width / 2 - legSpread + 5},${height}`} fill="#9E9E9E" />
                <Polygon points={`${width / 2 + bodyWidth / 2},${legsY} ${width / 2 + legSpread},${height} ${width / 2 + legSpread - 5},${height}`} fill="#9E9E9E" />
            </G>
        </Svg>
    );
};
// --- Reusable Lander Icon Component --- END

const UIOverlay: React.FC<UIOverlayProps> = ({
    fuel,
    altitude,
    hVel,
    vVel,
    status,
    crashSpeed,
    crashSpeedLimit,
    currentLevel,
    totalLevels,
    // Add new props
    lives,
    isFinalGameOver,
    isThrusting,
    lateralDirection,
    onStartThrust,
    onStopThrust,
    onStartMoveLeft,
    onStartMoveRight,
    onStopMove,
    onRestart,
    onNextLevel,
    onNewGame, // Add callback
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
            // Append speed details if available
            if (typeof crashSpeed === 'number' && typeof crashSpeedLimit === 'number') {
                statusMessage += `\nSpeed: ${formatNumber(crashSpeed)}, Limit: ${formatNumber(crashSpeedLimit)}`;
            }
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

    // Override status message if it's the final game over
    if (isFinalGameOver) {
        // Include the reached level in the game over message
        statusMessage = `Game Over!\nReached Level: ${currentLevel}`;
    }

    const showNextLevelButton = status === 'landed' && currentLevel < totalLevels && !isFinalGameOver;
    const showRestartButton = isGameOver && !showNextLevelButton && !isFinalGameOver;
    const showNewGameButton = isFinalGameOver;
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

            {/* Lives Display (Top Right) */}
            <View style={styles.livesContainer}>
                {/* Render LanderIcon components based on lives count, with check */}
                {typeof lives === 'number' && lives > 0 && Array.from({ length: lives }).map((_, index) => (
                    <LanderIcon key={index} size={18} />
                ))}
            </View>

            {/* Game Status Display (Top Center) */}
            {isGameOver && (
                <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>{statusMessage}</Text>
                    {showNextLevelButton && (
                        <TouchableOpacity onPress={onNextLevel} style={styles.actionButton}>
                            <Text style={styles.actionText}>Next Level</Text>
                        </TouchableOpacity>
                    )}
                    {showRestartButton && (
                        <TouchableOpacity onPress={onRestart} style={styles.actionButton}>
                            <Text style={styles.actionText}>{restartButtonText}</Text>
                        </TouchableOpacity>
                    )}
                    {showNewGameButton && (
                        <TouchableOpacity onPress={onNewGame} style={styles.actionButton}>
                            <Text style={styles.actionText}>New Game</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Controls (Bottom) - Only active if game is playing and not on web */}
            {!isGameOver && Platform.OS !== 'web' && (
                 <View style={styles.controlsContainer} pointerEvents="box-none">
                    {/* Left/Rotation Thruster (Now on the right, stacked) */}
                     <TouchableOpacity
                         style={[styles.controlButton, styles.leftButton, leftButtonStyle]}
                         onPressIn={onStartMoveLeft}
                         onPressOut={onStopMove}
                     >
                         <Text style={styles.controlText}>{'<'}</Text>
                     </TouchableOpacity>
                     <TouchableOpacity
                         style={[styles.controlButton, styles.rightButton, rightButtonStyle]}
                         onPressIn={onStartMoveRight}
                         onPressOut={onStopMove}
                     >
                         <Text style={styles.controlText}>{'>'}</Text>
                     </TouchableOpacity>

                    {/* Main Thruster (Now on the left) */}
                    <TouchableOpacity
                        style={[styles.controlButton, styles.thrustButton, thrustButtonStyle]}
                        onPressIn={onStartThrust}
                        onPressOut={onStopThrust}
                    >
                        <Text style={styles.controlText}>^</Text>
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
        // Ensure it doesn't capture touches unless a child does
        // pointerEvents: 'box-none', // Already set on the View
    },
    infoContainer: {
        position: 'absolute',
        top: 50, // Adjust as needed
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 5,
    },
    livesContainer: {
        position: 'absolute',
        top: 50, // Align with info container
        right: 20,
        flexDirection: 'row', // Arrange icons horizontally
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    infoText: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 3,
    },
    statusContainer: {
        position: 'absolute',
        top: '40%', // Position higher up
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    statusText: {
        color: 'yellow',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10
    },
    actionButton: {
        backgroundColor: 'rgba(100, 100, 255, 0.8)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10, // Space between message and button, or buttons
    },
    actionText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    controlsContainer: {
        position: 'absolute',
        top: 0, // Take full overlay space
        left: 0,
        right: 0,
        bottom: 0,
        // Remove flex properties, buttons are absolutely positioned
        // flexDirection: 'row',
        // justifyContent: 'space-between',
        // alignItems: 'flex-end',
        // paddingHorizontal: 20,
        // paddingBottom: 30, // Remove bottom padding
    },
    controlButton: {
        position: 'absolute', // Use absolute positioning
        width: 60, // Make slightly smaller
        height: 60,
        borderRadius: 30, // Adjust radius for circular shape (width / 2)
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    buttonInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    buttonActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)', // Brighter when active
    },
    controlText: {
        color: '#fff',
        fontSize: 30, // Larger symbol
        fontWeight: 'bold',
    },
    thrustButton: {
        // Position bottom left
        left: 30,
        // top: SCREEN_HEIGHT / 2 - 35, // Center vertically (adjust for button height)
        bottom: 30, // Position from bottom
    },
    leftButton: {
        // Position bottom right, left of the right button
        right: 30 + 60 + 15, // Base padding + rightButton width (new) + spacing
        // top: SCREEN_HEIGHT / 2 - 35, // Center vertically
        bottom: 30, // Position from bottom
    },
    rightButton: {
        // Position bottom right, rightmost button
        right: 30, // Base padding from edge
        // top: SCREEN_HEIGHT / 2 - 35, // Center vertically
        bottom: 30, // Position from bottom
    },
    // Remove buttonGroup and groupedButton styles if they exist (they weren't fully shown)
    // buttonGroup: { ... },
    // groupedButton: { ... },
});

export default UIOverlay; 