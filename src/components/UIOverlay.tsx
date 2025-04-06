import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Pressable, GestureResponderEvent } from 'react-native';
import Svg, { Polygon, Rect, G } from 'react-native-svg'; // Import SVG components

// Get screen dimensions for positioning
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define the props the component expects (Modified)
export interface UIOverlayProps {
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
    // Thruster states
    isThrusting?: boolean;
    isLeftThrusterActive?: boolean;
    isRightThrusterActive?: boolean;
    // Action callbacks
    onStartThrust: () => void;
    onStopThrust: () => void;
    onStartMoveLeft: () => void;
    onStopMoveLeft: () => void;
    onStartMoveRight: () => void;
    onStopMoveRight: () => void;
    onRestart: () => void;
    onNextLevel: () => void;
    onNewGame: () => void;
    canShowRewardedAd?: boolean;
    onShowRewardedAd?: () => void;
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

// --- RE-ADD Original Lander Icon Component --- START
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

    // Use darker fill colors
    const bodyFill = "#616161"; // Darker Grey
    const ascentFill = "#757575"; // Medium-Dark Grey
    const nozzleFill = "#424242"; // Very Dark Grey
    const legFill = "#757575"; // Medium-Dark Grey

    return (
        <Svg width={width} height={height * 1.1} viewBox={`0 0 ${width} ${height * 1.1}`}>
            <G>
                <Rect x={(width - bodyWidth) / 2} y={bodyY} width={bodyWidth} height={bodyHeight} fill={bodyFill} />
                <Rect x={ascentStageX} y={ascentStageY} width={ascentStageWidth} height={ascentStageHeight} fill={ascentFill} />
                <Polygon points={`${width / 2 - nozzleWidth / 2},${nozzleY} ${width / 2 + nozzleWidth / 2},${nozzleY} ${width / 2},${nozzleY + nozzleHeight}`} fill={nozzleFill} />
                <Polygon points={`${width / 2 - bodyWidth / 2},${legsY} ${width / 2 - legSpread},${height} ${width / 2 - legSpread + 5},${height}`} fill={legFill} />
                <Polygon points={`${width / 2 + bodyWidth / 2},${legsY} ${width / 2 + legSpread},${height} ${width / 2 + legSpread - 5},${height}`} fill={legFill} />
            </G>
        </Svg>
    );
};
// --- RE-ADD Original Lander Icon Component --- END

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
    lives,
    isFinalGameOver,
    isThrusting,
    isLeftThrusterActive,
    isRightThrusterActive,
    onStartThrust,
    onStopThrust,
    onStartMoveLeft,
    onStopMoveLeft,
    onStartMoveRight,
    onStopMoveRight,
    onRestart,
    onNextLevel,
    onNewGame,
    canShowRewardedAd,
    onShowRewardedAd,
}) => {

    // Format displayed values, handling null for velocities
    const formatNumber = (num: number | null | undefined, placeholder = '--') => {
        if (num === null || typeof num === 'undefined') {
            return placeholder;
        }
        return num.toFixed(2);
    };

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

    // Determine button styles based on state (Modified)
    const thrustButtonStyle = isThrusting ? styles.buttonActive : styles.buttonInactive;
    const leftButtonStyle = isLeftThrusterActive ? styles.buttonActive : styles.buttonInactive;
    const rightButtonStyle = isRightThrusterActive ? styles.buttonActive : styles.buttonInactive;

    // --- Direct Touch Handling Logic (Mobile) ---
    const controlsAreaRef = useRef<View>(null);

    // Define button areas based on styles (Corrected Calculation)
    const controlsAreaHeight = styles.controlsArea.height ?? 120; // Get height from style
    const buttonWidth = styles.controlButton.width ?? 60;
    const buttonHeight = styles.controlButton.height ?? 60;
    
    // Get positioning from styles, providing defaults
    const thrustBottom = styles.thrustButton.bottom ?? 30;
    const thrustLeft = styles.thrustButton.left ?? 30;
    const rightButtonBottom = styles.rightButton.bottom ?? 30;
    const rightButtonRight = styles.rightButton.right ?? 30;
    const leftButtonBottom = styles.leftButton.bottom ?? 30;
    const leftButtonRight = styles.leftButton.right ?? (rightButtonRight + buttonWidth + 15);

    const thrustArea = { 
        x1: thrustLeft, 
        y1: controlsAreaHeight - thrustBottom - buttonHeight, // Relative to controlsArea top 
        x2: thrustLeft + buttonWidth,
        y2: controlsAreaHeight - thrustBottom // Relative to controlsArea top
    };
    const rightArea = { 
        x1: SCREEN_WIDTH - rightButtonRight - buttonWidth, // Relative to screen/controlsArea left
        y1: controlsAreaHeight - rightButtonBottom - buttonHeight, 
        x2: SCREEN_WIDTH - rightButtonRight, // Relative to screen/controlsArea left
        y2: controlsAreaHeight - rightButtonBottom 
    };
    const leftArea = { 
        x1: SCREEN_WIDTH - leftButtonRight - buttonWidth, 
        y1: controlsAreaHeight - leftButtonBottom - buttonHeight, 
        x2: SCREEN_WIDTH - leftButtonRight,
        y2: controlsAreaHeight - leftButtonBottom 
    };

    const checkTouches = useCallback((event: GestureResponderEvent) => {
        const touches = event.nativeEvent.touches;
        let isTouchingThrust = false;
        let isTouchingLeft = false;
        let isTouchingRight = false;

        // Add console log for debugging touches and areas
        // console.log('--- Touch Event ---');
        // console.log('Areas:', JSON.stringify({ thrustArea, leftArea, rightArea }));

        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            const { locationX: x, locationY: y } = touch;
            
            // Log touch coordinates
            // console.log(`Touch ${i}: x=${x.toFixed(1)}, y=${y.toFixed(1)}`);

            // Check Thrust Area
            if (x >= thrustArea.x1 && x <= thrustArea.x2 && y >= thrustArea.y1 && y <= thrustArea.y2) {
                isTouchingThrust = true;
                // console.log(` -> Hit THRUST area`);
            }
            // Check Left Area
            if (x >= leftArea.x1 && x <= leftArea.x2 && y >= leftArea.y1 && y <= leftArea.y2) {
                isTouchingLeft = true;
                // console.log(` -> Hit LEFT area`);
            }
            // Check Right Area
            if (x >= rightArea.x1 && x <= rightArea.x2 && y >= rightArea.y1 && y <= rightArea.y2) {
                isTouchingRight = true;
                // console.log(` -> Hit RIGHT area`);
            }
        }
        
        // console.log(`Result: Thrust=${isTouchingThrust}, Left=${isTouchingLeft}, Right=${isTouchingRight}`);
        // console.log(`Current State: Thrust=${isThrusting}, Left=${isLeftThrusterActive}, Right=${isRightThrusterActive}`);

        // Update state based on current touches
        if (isTouchingThrust !== isThrusting) {
            // console.log(` -> Toggling Thrust: ${isTouchingThrust}`);
            isTouchingThrust ? onStartThrust() : onStopThrust();
        }
        if (isTouchingLeft !== isLeftThrusterActive) {
            // console.log(` -> Toggling Left: ${isTouchingLeft}`);
            isTouchingLeft ? onStartMoveLeft() : onStopMoveLeft();
        }
        if (isTouchingRight !== isRightThrusterActive) {
            // console.log(` -> Toggling Right: ${isTouchingRight}`);
            isTouchingRight ? onStartMoveRight() : onStopMoveRight();
        }

    }, [
        isThrusting, isLeftThrusterActive, isRightThrusterActive, 
        onStartThrust, onStopThrust, onStartMoveLeft, onStopMoveLeft, 
        onStartMoveRight, onStopMoveRight,
        thrustArea, leftArea, rightArea // Include areas in dependencies
    ]);

    const handleTouchStart = (event: GestureResponderEvent) => {
        checkTouches(event);
    };

    const handleTouchEnd = (event: GestureResponderEvent) => {
        checkTouches(event); // Re-check remaining touches
    };
    // --- End Direct Touch Handling Logic ---

    return (
        <View style={styles.overlayContainer} pointerEvents="box-none">
            
            {/* Platform-Specific Info Display */}
            {Platform.OS === 'web' ? (
                // --- WEB LAYOUT (Bottom Bar with Neo Style) --- 
                <View style={styles.webInfoWrapper}>
                    <View style={styles.webInfoContainer}> 
                        {/* Refactored Web Stats */}
                        <View style={styles.statItemWeb}>
                            <Text style={styles.statLabelWeb}>Level:</Text>
                            <Text style={styles.statValueWeb}>{currentLevel}</Text>
                        </View>
                        <View style={styles.statItemWeb}>
                            <Text style={styles.statLabelWeb}>Fuel:</Text>
                            <Text style={styles.statValueWeb}>{formatNumber(fuel)}</Text>
                        </View>
                        <View style={styles.statItemWeb}>
                            <Text style={styles.statLabelWeb}>Alt:</Text>
                            <Text style={styles.statValueWeb}>{formatNumber(altitude)}</Text>
                        </View>
                        <View style={styles.statItemWeb}>
                            <Text style={styles.statLabelWeb}>HVel:</Text>
                            <Text style={styles.statValueWeb}>{formatNumber(hVel)}</Text>
                        </View>
                        <View style={styles.statItemWeb}>
                            <Text style={styles.statLabelWeb}>VVel:</Text>
                            <Text style={styles.statValueWeb}>{formatNumber(vVel)}</Text>
                        </View>
                    </View>
                    <View style={styles.webInfoShadow} />
                </View>
            ) : (
                // --- MOBILE LAYOUT (Top-Left Card) --- 
                <View style={styles.infoCardContainer}>
                    <View style={styles.infoCardContent}>
                        {/* Level stat item REMOVED from here */}
                        <View style={styles.statItemMobile}>
                            <Text style={styles.statLabelMobile}>Fuel:</Text>
                            <Text style={styles.statValueMobile}>{formatNumber(fuel)}</Text>
                        </View>
                        <View style={styles.statItemMobile}>
                            <Text style={styles.statLabelMobile}>Alt:</Text>
                            <Text style={styles.statValueMobile}>{formatNumber(altitude)}</Text>
                        </View>
                        <View style={styles.statItemMobile}>
                            <Text style={styles.statLabelMobile}>HVel:</Text>
                            <Text style={styles.statValueMobile}>{formatNumber(hVel)}</Text>
                        </View>
                         <View style={styles.statItemMobile}>
                            <Text style={styles.statLabelMobile}>VVel:</Text>
                            <Text style={styles.statValueMobile}>{formatNumber(vVel)}</Text>
                        </View>
                    </View>
                    <View style={styles.infoCardShadow} />
                </View>
            )}

            {/* Lives Display (Top Right) - Apply Card Style - Add Level for Mobile */}
            <View style={styles.livesCardContainer}>
                 <View style={styles.livesCardContent}> 
                     {/* <<< Add Level Stat Here (Only Rendered on Mobile via Platform check) >>> */} 
                     {Platform.OS !== 'web' && (
                        <View style={[styles.statItemMobile, styles.levelInLivesCard]}> 
                            <Text style={styles.statLabelMobile}>Level:</Text>
                            <Text style={styles.statValueMobile}>{currentLevel}</Text>
                        </View>
                     )}
                     {/* <<< Wrap Icons in a Row >>> */} 
                     <View style={styles.iconRow}> 
                         {typeof lives === 'number' && lives > 0 && Array.from({ length: lives }).map((_, index) => (
                             <LanderIcon key={index} size={18} />
                         ))}
                     </View>
                 </View>
                 <View style={styles.livesCardShadow} />
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

            {/* Controls (Bottom) - Use Direct Touch Handling on Mobile */}
            {!isGameOver && Platform.OS !== 'web' && (
                 <View 
                     ref={controlsAreaRef}
                     style={styles.controlsArea} // New container for touch handling
                     onTouchStart={handleTouchStart}
                     onTouchMove={handleTouchStart} // Handle move same as start to catch dragging onto button
                     onTouchEnd={handleTouchEnd}
                     onTouchCancel={handleTouchEnd} // Handle cancellation same as end
                     pointerEvents="box-only" // Capture touches only on this view
                 >
                     {/* Visual Representation of Buttons (Not Touchable) */}
                      <View style={[styles.controlButton, styles.leftButton, leftButtonStyle]} pointerEvents="none">
                          <Text style={styles.controlText}>{'<'}</Text>
                      </View>
                      <View style={[styles.controlButton, styles.rightButton, rightButtonStyle]} pointerEvents="none">
                          <Text style={styles.controlText}>{'>'}</Text>
                      </View>
                      <View style={[styles.controlButton, styles.thrustButton, thrustButtonStyle]} pointerEvents="none">
                          <Text style={styles.controlText}>^</Text>
                      </View>
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
    },
    // --- Styles for MOBILE Card Layout ---
    infoCardContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },
    infoCardContent: {
        backgroundColor: neoStyles.mainBg,
        borderWidth: neoStyles.borderWidth,
        borderColor: neoStyles.border,
        borderRadius: neoStyles.borderRadius,
        paddingVertical: 10,
        paddingHorizontal: 8,
        position: 'relative',
        zIndex: 2,
        width: 85,
    },
    infoCardShadow: {
        position: 'absolute',
        top: neoStyles.shadowOffset,
        left: neoStyles.shadowOffset,
        right: -neoStyles.shadowOffset,
        bottom: -neoStyles.shadowOffset,
        backgroundColor: neoStyles.shadow,
        borderRadius: neoStyles.borderRadius,
        zIndex: 1,
    },
    // --- Styles for WEB Bottom Bar Layout ---
    webInfoWrapper: { // New wrapper for positioning
        position: 'absolute',
        bottom: 15, 
        left: 15,
        right: 15,
        zIndex: 10,
    },
    webInfoContainer: { 
        backgroundColor: neoStyles.mainBg, 
        borderWidth: neoStyles.borderWidth,
        borderColor: neoStyles.border,
        borderRadius: neoStyles.borderRadius,
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8, 
        paddingHorizontal: 15,
        position: 'relative', 
        zIndex: 2, 
    },
    webInfoShadow: { // Shadow element for web bar
        position: 'absolute',
        top: neoStyles.shadowOffset,
        left: neoStyles.shadowOffset,
        right: -neoStyles.shadowOffset,
        bottom: -neoStyles.shadowOffset,
        backgroundColor: neoStyles.shadow,
        borderRadius: neoStyles.borderRadius,
        zIndex: 1, 
    },

    // --- NEW Stat Item Styles ---
    statItemWeb: { // Container for each stat pair (Label + Value) on Web
        flexDirection: 'row', // Arrange label and value horizontally
        alignItems: 'baseline', // Align text nicely
        marginHorizontal: 5, // Add some space between stat items
    },
    statLabelWeb: { // Style for the text label (e.g., "Fuel:") on Web
        color: neoStyles.text,
        fontSize: 14,
        fontWeight: '600',
        marginRight: 4, // Space between label and value
    },
    statValueWeb: { // Style for the numeric value on Web
        color: neoStyles.text,
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'monospace', // <<<< Apply Monospaced Font
        minWidth: 50, // <<<< Add minimum width to stabilize
        textAlign: 'right', // <<<< Align numbers to the right
    },
    statItemMobile: { // Container for each stat pair (Label + Value) on Mobile
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    statLabelMobile: { // Style for the text label on Mobile
        color: neoStyles.text,
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    statValueMobile: { // Style for the numeric value on Mobile
        color: neoStyles.text,
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'monospace',
    },

    // --- Styles for Lives Card (Top Right) ---
    livesCardContainer: { // Wrapper for positioning lives card + shadow
        position: 'absolute',
        top: 50, 
        right: 20,
        zIndex: 10,
    },
    livesCardContent: { 
        // flexDirection: 'row', // <<< Remove row direction
        alignItems: 'center', // <<< Center items horizontally
        backgroundColor: neoStyles.mainBg,
        borderWidth: neoStyles.borderWidth,
        borderColor: neoStyles.border,
        borderRadius: neoStyles.borderRadius,
        paddingVertical: 8, // <<< Adjust padding
        paddingHorizontal: 12, // <<< Adjust padding
        position: 'relative', 
        zIndex: 2, 
        minWidth: 60, // Ensure minimum width for content
    },
    livesCardShadow: { // Shadow for lives card
        position: 'absolute',
        top: neoStyles.shadowOffset,
        left: neoStyles.shadowOffset,
        right: -neoStyles.shadowOffset,
        bottom: -neoStyles.shadowOffset,
        backgroundColor: neoStyles.shadow,
        borderRadius: neoStyles.borderRadius,
        zIndex: 1, // Below content
    },
    levelInLivesCard: { // Specific style for the level stat when inside the lives card
        marginBottom: 6, // Add space below the level stat
        alignSelf: 'stretch', // Make the level row take full width for centering text
        alignItems: 'center', // Center label/value if needed, adjust as preferred
    },
    iconRow: { // Style for the row containing icons
        flexDirection: 'row', 
        // marginTop: 4, // Add space above the icon row (already handled by level marginBottom)
    },
    // --- Styles for Status Card (Center) ---
    statusCardContainer: { 
        position: 'absolute',
        top: '35%', 
        width: '80%', 
        maxWidth: 350, 
        alignSelf: 'center', 
        zIndex: 20, // Ensure status is above other UI elements
    },
    statusCardContent: { 
        backgroundColor: neoStyles.mainBg,
        borderWidth: neoStyles.borderWidth,
        borderColor: neoStyles.border,
        borderRadius: neoStyles.borderRadius,
        padding: 20, 
        alignItems: 'center',
        zIndex: 2, 
        position: 'relative', 
    },
    statusCardShadow: { 
        position: 'absolute',
        top: neoStyles.shadowOffset,
        left: neoStyles.shadowOffset,
        right: -neoStyles.shadowOffset,
        bottom: -neoStyles.shadowOffset,
        backgroundColor: neoStyles.shadow,
        borderRadius: neoStyles.borderRadius,
        zIndex: 1, 
    },
    statusText: {
        color: neoStyles.text, 
        fontSize: 22, 
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20, 
    },
    actionButton: {
        backgroundColor: neoStyles.mainBg,
        borderWidth: neoStyles.borderWidth,
        borderColor: neoStyles.border,
        borderRadius: neoStyles.borderRadius,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 15,
        shadowColor: neoStyles.shadow,
        shadowOffset: { width: neoStyles.shadowOffset / 2, height: neoStyles.shadowOffset / 2 },
        shadowOpacity: 1, 
        shadowRadius: 0, 
        elevation: 3, 
    },
    actionText: {
        color: neoStyles.text, 
        fontSize: 16, 
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // --- Styles for Mobile Controls (Bottom) ---
    controlsContainer: {
        position: 'absolute',
        top: 0, 
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10, // Ensure controls are on top
    },
    controlButton: {
        position: 'absolute', 
        width: 60, 
        height: 60,
        borderRadius: 30, 
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    buttonInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    buttonActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)', 
    },
    controlText: {
        color: '#fff',
        fontSize: 30, 
        fontWeight: 'bold',
    },
    thrustButton: {
        left: 30,
        bottom: 30, 
    },
    leftButton: {
        right: 30 + 60 + 15, 
        bottom: 30, 
    },
    rightButton: {
        right: 30, 
        bottom: 30, 
    },
    controlsArea: { // New style for mobile touch handling area
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120, // Adjust height to cover button areas comfortably
        // backgroundColor: 'rgba(255, 0, 0, 0.1)', // Optional: for debugging touch area
        zIndex: 10, // Ensure it's high enough but check relative to status overlay
    },
});

export default UIOverlay; 