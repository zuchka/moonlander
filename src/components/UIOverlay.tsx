import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Svg, { Polygon, Rect, G } from 'react-native-svg'; // Import SVG components
import LunarModuleLineartSvg from './LunarModuleLineartSvg'; // Adjust path if needed

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

// --- Neobrutalist Style Constants (Example)
const neoStyles = {
    mainBg: '#FFFFFF',      // Card/Button Background
    border: '#111827',    // Dark border
    shadow: '#111827',    // Dark shadow
    text: '#111827',      // Default text
    accent: '#3B82F6',    // Example accent for primary button?
    shadowOffset: 4,       // Offset for the shadow effect
    borderRadius: 8,       // Consistent border radius
    borderWidth: 2,
};

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

    // Determine button styles based on state (for the controls, not action buttons yet)
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
                {/* Render LunarModuleLineartSvg components based on lives count */}
                {typeof lives === 'number' && lives > 0 && Array.from({ length: lives }).map((_, index) => (
                    // Replace LanderIcon with LunarModuleLineartSvg
                    <LunarModuleLineartSvg 
                        key={index} 
                        width={18} // Keep similar size to old icon
                        height={18 * 1.2} // Maintain aspect ratio (approx)
                        strokeColor="#FFFFFF" // Use white lines for visibility
                        strokeWidth={1} // Adjust stroke width for small size if needed
                    />
                ))}
            </View>

            {/* Game Status Display (Top Center) - Apply Card Style */}
            {isGameOver && (
                <View style={styles.statusCardContainer}> 
                    <View style={styles.statusCardContent}>
                        <Text style={styles.statusText}>{statusMessage}</Text>
                        {/* Action Buttons - Apply Button Style */} 
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
                    {/* Shadow element for neobrutalist effect */} 
                    <View style={styles.statusCardShadow} />
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
        // Add alignItems: 'center' to allow alignSelf to work on children
        // but this centers everything... let's try alignSelf on the child first.
    },
    infoContainer: {
        position: 'absolute',
        top: 50, // Adjust as needed
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 5,
        zIndex: 10, // Ensure info is above potential card shadow
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
        zIndex: 10, // Ensure lives are above potential card shadow
    },
    infoText: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 3,
    },
    statusCardContainer: { // Container for positioning the card + shadow
        position: 'absolute',
        top: '35%', // Adjust vertical position
        width: '80%', // Card width
        maxWidth: 350, // Max card width
        alignSelf: 'center', // Center the container itself horizontally
        zIndex: 5, // Ensure status is above game, below controls if necessary
    },
    statusCardContent: { // The actual visible card content
        backgroundColor: neoStyles.mainBg,
        borderWidth: neoStyles.borderWidth,
        borderColor: neoStyles.border,
        borderRadius: neoStyles.borderRadius,
        padding: 20, // Similar to p-6
        alignItems: 'center',
        zIndex: 2, // Content above shadow
        position: 'relative', // Needed for zIndex
    },
    statusCardShadow: { // Separate view to mimic the offset shadow
        position: 'absolute',
        top: neoStyles.shadowOffset,
        left: neoStyles.shadowOffset,
        right: -neoStyles.shadowOffset,
        bottom: -neoStyles.shadowOffset,
        backgroundColor: neoStyles.shadow,
        borderRadius: neoStyles.borderRadius,
        zIndex: 1, // Shadow behind content
    },
    statusText: {
        color: neoStyles.text, // Use neo color
        fontSize: 22, // Adjust size
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20, // Increase spacing
        // Remove text shadow if using card background
        // textShadowColor: ...
    },
    actionButton: {
        // Apply neobrutalist button style
        backgroundColor: neoStyles.mainBg,
        borderWidth: neoStyles.borderWidth,
        borderColor: neoStyles.border,
        borderRadius: neoStyles.borderRadius,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 15,
        // Add shadow properties (React Native standard shadow)
        shadowColor: neoStyles.shadow,
        shadowOffset: { width: neoStyles.shadowOffset / 2, height: neoStyles.shadowOffset / 2 },
        shadowOpacity: 1, // Solid shadow
        shadowRadius: 0, // Hard shadow edge
        elevation: 3, // Basic elevation for Android shadow
        // We can't easily replicate the exact translate+shadow-none effect on press
        // A simple opacity change or background change might be better for RN
    },
    actionText: {
        color: neoStyles.text, // Use neo color
        fontSize: 16, // Adjust size
        fontWeight: 'bold',
        textAlign: 'center',
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
        zIndex: 10, // Ensure controls are on top
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