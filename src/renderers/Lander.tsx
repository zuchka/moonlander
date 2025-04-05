import React from 'react';
import { StyleSheet } from 'react-native';
import Matter from 'matter-js';
import Svg, { Polygon, Rect, G } from 'react-native-svg'; // Import Rect and G (Group)

// Define props including the testIDs from the test file
interface LanderProps {
    body: Matter.Body;
    size: number[];
    isThrusting?: boolean; // Added prop
    lateralDirection?: 'left' | 'right' | 'none'; // Added prop
    testID?: string; // For the Svg container
}

const Lander: React.FC<LanderProps> = ({ body, size, isThrusting, lateralDirection, testID }) => {
    const width = size[0];
    const height = size[1];
    const { x: bodyX, y: bodyY } = body.position;
    const angle = body.angle; // Get angle for rotation

    // Calculate top-left position for the container Svg
    const topLeftX = bodyX - width / 2;
    const topLeftY = bodyY - height / 2;

    // Define LM parts relative to the center (0, 0) of the lander's local coordinates
    const bodyWidth = width * 0.7;
    const bodyHeight = height * 0.5;
    const ascentStageHeight = height * 0.3;
    const ascentStageWidth = width * 0.4;
    const legSpread = width * 0.45;
    const legHeight = height * 0.4;
    const legTopAttach = bodyHeight * 0.3; // How far down the body legs attach
    const nozzleHeight = height * 0.15;
    const nozzleWidth = width * 0.2;
    // Calculate nozzle bottom Y for flame attachment
    const nozzleBottomY = (height + bodyHeight) / 2 + nozzleHeight;

    // --- Main Flame Calculation (only if thrusting) ---
    let flamePoints = '';
    if (isThrusting) {
        const baseFlameLength = height * 0.4; // Base length of the flame
        const flickerAmount = height * 0.15; // Max amount of flicker
        const flameLength = baseFlameLength + (Math.random() * flickerAmount) - (flickerAmount / 2);
        const flameWidth = nozzleWidth * 1.2; // Slightly wider than nozzle
        flamePoints = `
            ${width / 2 - nozzleWidth / 2},${nozzleBottomY}
            ${width / 2 + nozzleWidth / 2},${nozzleBottomY}
            ${width / 2 + flameWidth / 2},${nozzleBottomY + flameLength * 0.7}
            ${width / 2},${nozzleBottomY + flameLength}
            ${width / 2 - flameWidth / 2},${nozzleBottomY + flameLength * 0.7}
        `;
    }
    // --- End Main Flame Calculation ---

    // --- Lateral Thruster Constants ---
    const puffBaseLength = width * 0.15;
    const puffFlicker = width * 0.05;
    const puffWidth = height * 0.1;
    const bodySideXLeft = (width - bodyWidth) / 2;
    const bodySideXRight = (width + bodyWidth) / 2;
    const puffAttachY = (height / 2);
    // --- End Lateral Thruster Constants ---

    return (
        <Svg
            testID={testID}
            width={width}
            height={height}
            style={[
                styles.landerSvg,
                {
                    left: topLeftX,
                    top: topLeftY,
                }
            ]}
        >
            {/* Group all parts and apply rotation */}
            <G rotation={angle * (180 / Math.PI)} origin={`${width / 2}, ${height / 2}`}>
                {/* Main Body (Descent Stage) - Centered */}
                <Rect
                    x={(width - bodyWidth) / 2}
                    y={(height - bodyHeight) / 2}
                    width={bodyWidth}
                    height={bodyHeight}
                    fill="gold" // Or silver/grey
                />
                {/* Ascent Stage - On top of main body */}
                <Rect
                    x={(width - ascentStageWidth) / 2}
                    y={(height - bodyHeight) / 2 - ascentStageHeight}
                    width={ascentStageWidth}
                    height={ascentStageHeight}
                    fill="silver"
                />
                {/* Nozzle - Below main body */}
                <Polygon
                    points={`${width / 2 - nozzleWidth / 2},${(height + bodyHeight) / 2} ${width / 2 + nozzleWidth / 2},${(height + bodyHeight) / 2} ${width / 2},${nozzleBottomY}`}
                    fill="darkgrey"
                />
                 {/* Landing Legs (example using polygons) */}
                 {/* Leg 1 (Left) */}
                 <Polygon
                     points={`${width / 2 - bodyWidth / 2},${(height - bodyHeight) / 2 + legTopAttach} ${width / 2 - legSpread},${height} ${width / 2 - legSpread + 5},${height}`}
                     fill="grey"
                     stroke="darkgrey"
                     strokeWidth="1"
                 />
                 {/* Leg 2 (Right) */}
                 <Polygon
                     points={`${width / 2 + bodyWidth / 2},${(height - bodyHeight) / 2 + legTopAttach} ${width / 2 + legSpread},${height} ${width / 2 + legSpread - 5},${height}`}
                     fill="grey"
                     stroke="darkgrey"
                     strokeWidth="1"
                 />

                 {/* --- Render Main Flame --- */}
                 {isThrusting && (
                     <Polygon points={flamePoints} fill="orange" stroke="yellow" strokeWidth="1" />
                 )}

                 {/* --- Render Lateral Thrusters (Reversed & Calculation Moved) --- */}
                 {/* Show LEFT puff when moving RIGHT */}
                 {lateralDirection === 'right' && (() => {
                     // Calculate points for the LEFT puff inside this block
                     const puffLength = puffBaseLength + (Math.random() * puffFlicker);
                     const leftPuffPoints = `
                         ${bodySideXLeft},${puffAttachY - puffWidth / 2}
                         ${bodySideXLeft},${puffAttachY + puffWidth / 2}
                         ${bodySideXLeft - puffLength * 0.7},${puffAttachY + puffWidth * 0.3}
                         ${bodySideXLeft - puffLength},${puffAttachY}
                         ${bodySideXLeft - puffLength * 0.7},${puffAttachY - puffWidth * 0.3}
                     `;
                     return (
                         <Polygon
                             points={leftPuffPoints}
                             fill="lightblue"
                             stroke="white"
                             strokeWidth="1"
                         />
                     );
                 })()}

                 {/* Show RIGHT puff when moving LEFT */}
                 {lateralDirection === 'left' && (() => {
                     // Calculate points for the RIGHT puff inside this block
                     const puffLength = puffBaseLength + (Math.random() * puffFlicker);
                     const rightPuffPoints = `
                         ${bodySideXRight},${puffAttachY - puffWidth / 2}
                         ${bodySideXRight},${puffAttachY + puffWidth / 2}
                         ${bodySideXRight + puffLength * 0.7},${puffAttachY + puffWidth * 0.3}
                         ${bodySideXRight + puffLength},${puffAttachY}
                         ${bodySideXRight + puffLength * 0.7},${puffAttachY - puffWidth * 0.3}
                     `;
                     return (
                         <Polygon
                             points={rightPuffPoints}
                             fill="lightblue"
                             stroke="white"
                             strokeWidth="1"
                         />
                     );
                 })()}
                 {/* --- End Lateral Thrusters --- */}
            </G>
        </Svg>
    );
};

const styles = StyleSheet.create({
    landerSvg: {
        position: 'absolute',
    },
});

export default Lander; 