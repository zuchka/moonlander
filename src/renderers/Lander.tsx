import React from 'react';
import { StyleSheet } from 'react-native';
import Matter from 'matter-js';
import Svg, { Polygon, Rect, G, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg'; // Ensure all needed elements are imported

// Define props including the testIDs from the test file
interface LanderProps {
    body: Matter.Body;
    size: number[];
    isThrusting?: boolean; // Added prop
    lateralDirection?: 'left' | 'right' | 'none'; // Added prop
    testID?: string; // For the Svg container
}

const Lander: React.FC<LanderProps> = ({ body, size, isThrusting, lateralDirection, testID }) => {
    const landerWidth = size[0];
    const landerHeight = size[1];
    const { x: bodyX, y: bodyY } = body.position;
    const angle = body.angle; // Angle in radians

    // Original coordinates/dimensions for the lander graphic itself
    const bodyWidth = landerWidth * 0.7;
    const bodyHeight = landerHeight * 0.5;
    const ascentStageHeight = landerHeight * 0.3;
    const ascentStageWidth = landerWidth * 0.4;
    const legSpread = landerWidth * 0.45;
    const legHeight = landerHeight * 0.4;
    const legTopAttach = bodyHeight * 0.3;
    const nozzleHeight = landerHeight * 0.15;
    const nozzleWidth = landerWidth * 0.2;
    // Nozzle bottom relative to the lander's *visual* top-left (0,0) within its box
    const nozzleBottomY_relative = (landerHeight + bodyHeight) / 2 + nozzleHeight;

    // --- Calculate required extra height for flame ---
    const baseFlameLength = landerHeight * 0.4;
    const flickerAmount = landerHeight * 0.15;
    const maxFlameLength = baseFlameLength + flickerAmount / 2; // Max deviation
    const flameBuffer = 10; // Add some extra buffer space
    // Calculate how much the flame extends below the lander's defined height
    const flameExtension = Math.max(0, (nozzleBottomY_relative + maxFlameLength) - landerHeight);
    const extraHeightForFlame = flameExtension + flameBuffer;

    // --- Calculate new SVG dimensions and positioning ---
    const svgHeight = landerHeight + extraHeightForFlame;
    const svgWidth = landerWidth; // Width remains the same

    // Original top-left based on body position and lander size
    const originalLanderTopLeftX = bodyX - landerWidth / 2;
    const originalLanderTopLeftY = bodyY - landerHeight / 2;

    // Adjust SVG container's top position to keep lander visually aligned
    // The lander graphic needs to start `svgTopOffset` pixels down from the SVG top
    const svgTopOffset = (svgHeight - landerHeight) / 2;
    const svgTopLeftX = originalLanderTopLeftX;
    const svgTopLeftY = originalLanderTopLeftY - svgTopOffset;

    // --- Calculate rotation origin relative to the new SVG container ---
    const landerCenterXInSvg = svgWidth / 2;
    const landerCenterYInSvg = svgTopOffset + (landerHeight / 2);
    const rotationOrigin = `${landerCenterXInSvg}, ${landerCenterYInSvg}`;

    // --- Recalculate flame points relative to the SVG container's coordinate system ---
    // The nozzle bottom Y needs to be offset by svgTopOffset
    const nozzleBottomY_inSvg = svgTopOffset + nozzleBottomY_relative;
    let flamePoints = '';
    if (isThrusting) {
        const flameLength = baseFlameLength + (Math.random() * flickerAmount) - (flickerAmount / 2);
        const flameWidth = nozzleWidth * 1.2;
        // Coordinates relative to SVG's top-left (0,0)
        flamePoints = `
            ${landerCenterXInSvg - nozzleWidth / 2},${nozzleBottomY_inSvg}
            ${landerCenterXInSvg + nozzleWidth / 2},${nozzleBottomY_inSvg}
            ${landerCenterXInSvg + flameWidth / 2},${nozzleBottomY_inSvg + flameLength * 0.7}
            ${landerCenterXInSvg},${nozzleBottomY_inSvg + flameLength}
            ${landerCenterXInSvg - flameWidth / 2},${nozzleBottomY_inSvg + flameLength * 0.7}
        `;
    }

    // --- Lateral Thruster Calculations (relative to SVG container) ---
    const puffBaseLength = landerWidth * 0.15;
    const puffFlicker = landerWidth * 0.05;
    const puffWidth = landerHeight * 0.1;
    const puffAttachY_inSvg = landerCenterYInSvg; // Attach mid-lander vertically
    const bodySideXLeft_inSvg = landerCenterXInSvg - bodyWidth / 2;
    const bodySideXRight_inSvg = landerCenterXInSvg + bodyWidth / 2;

    // Other calculations for details (relative to lander's visual box)
    const ascentStageX = (landerWidth - ascentStageWidth) / 2;
    const ascentStageY = (landerHeight - bodyHeight) / 2 - ascentStageHeight;
    const windowSize = ascentStageWidth * 0.3;
    const windowX = ascentStageX + ascentStageWidth * 0.6;
    const windowY = ascentStageY + ascentStageHeight * 0.2;
    const rcsSize = ascentStageWidth * 0.15;
    const rcsPositions = [
        { x: ascentStageX, y: ascentStageY }, // Top-Left
        { x: ascentStageX + ascentStageWidth - rcsSize, y: ascentStageY }, // Top-Right
    ];

    // Gradient IDs
    const goldGradientId = "landerGoldGradient";
    const silverGradientId = "landerSilverGradient";

    return (
        <Svg
            testID={testID}
            width={svgWidth} // Use new width
            height={svgHeight} // Use new height
            style={[
                styles.landerSvg,
                {
                    left: svgTopLeftX, // Use new position X
                    top: svgTopLeftY, // Use new position Y
                }
            ]}
        >
            {/* Gradients are defined once, can stay here */}
            <Defs>
                <LinearGradient id={goldGradientId} x1="0%" y1="0%" x2="0%" y2="100%"><Stop offset="0%" stopColor="#FFDF00" /><Stop offset="100%" stopColor="#B8860B" /></LinearGradient>
                <LinearGradient id={silverGradientId} x1="0%" y1="0%" x2="0%" y2="100%"><Stop offset="0%" stopColor="#E8E8E8" /><Stop offset="100%" stopColor="#A8A8A8" /></LinearGradient>
            </Defs>

            {/* Group all parts and apply rotation using new origin */}
            <G rotation={angle * (180 / Math.PI)} origin={rotationOrigin}>
                
                {/* Lander Graphic Group - Offset vertically within the larger SVG */}
                <G y={svgTopOffset}>
                    {/* Base Lander Shapes with Gradients (coordinates are relative to this group's 0,0) */}
                    <Rect x={(landerWidth - bodyWidth) / 2} y={(landerHeight - bodyHeight) / 2} width={bodyWidth} height={bodyHeight} fill={`url(#${goldGradientId})`} />
                    <Rect x={ascentStageX} y={ascentStageY} width={ascentStageWidth} height={ascentStageHeight} fill={`url(#${silverGradientId})`} />
                    <Polygon points={`${landerWidth / 2 - nozzleWidth / 2},${(landerHeight + bodyHeight) / 2} ${landerWidth / 2 + nozzleWidth / 2},${(landerHeight + bodyHeight) / 2} ${landerWidth / 2},${nozzleBottomY_relative}`} fill="darkgrey" />
                    <Polygon points={`${landerWidth / 2 - bodyWidth / 2},${(landerHeight - bodyHeight) / 2 + legTopAttach} ${landerWidth / 2 - legSpread},${landerHeight} ${landerWidth / 2 - legSpread + 5},${landerHeight}`} fill="grey" stroke="darkgrey" strokeWidth="1" />
                    <Polygon points={`${landerWidth / 2 + bodyWidth / 2},${(landerHeight - bodyHeight) / 2 + legTopAttach} ${landerWidth / 2 + legSpread},${landerHeight} ${landerWidth / 2 + legSpread - 5},${landerHeight}`} fill="grey" stroke="darkgrey" strokeWidth="1" />
                    {/* Window (coords relative to group 0,0) */}
                    <Rect x={windowX} y={windowY} width={windowSize} height={windowSize} fill="#222244" />
                    {/* RCS Thrusters (coords relative to group 0,0) */}
                    {rcsPositions.map((pos, index) => (
                        <Rect key={`rcs-${index}`} x={pos.x} y={pos.y} width={rcsSize} height={rcsSize} fill="#555555" />
                    ))}
                </G>

                {/* --- Render Main Flame --- (Coords are already relative to SVG center/top-left) */}
                {isThrusting && (
                    <Polygon points={flamePoints} fill="orange" stroke="yellow" strokeWidth="1" />
                )}

                {/* --- Render Lateral Thrusters --- (Coords relative to SVG center/top-left) */}
                {lateralDirection === 'right' && (() => {
                    const puffLength = puffBaseLength + (Math.random() * puffFlicker);
                    const leftPuffPoints = `
                        ${bodySideXLeft_inSvg},${puffAttachY_inSvg - puffWidth / 2}
                        ${bodySideXLeft_inSvg},${puffAttachY_inSvg + puffWidth / 2}
                        ${bodySideXLeft_inSvg - puffLength * 0.7},${puffAttachY_inSvg + puffWidth * 0.3}
                        ${bodySideXLeft_inSvg - puffLength},${puffAttachY_inSvg}
                        ${bodySideXLeft_inSvg - puffLength * 0.7},${puffAttachY_inSvg - puffWidth * 0.3}
                    `;
                    return (
                        <Polygon points={leftPuffPoints} fill="lightblue" stroke="white" strokeWidth="1" />
                    );
                })()}
                {lateralDirection === 'left' && (() => {
                    const puffLength = puffBaseLength + (Math.random() * puffFlicker);
                    const rightPuffPoints = `
                        ${bodySideXRight_inSvg},${puffAttachY_inSvg - puffWidth / 2}
                        ${bodySideXRight_inSvg},${puffAttachY_inSvg + puffWidth / 2}
                        ${bodySideXRight_inSvg + puffLength * 0.7},${puffAttachY_inSvg + puffWidth * 0.3}
                        ${bodySideXRight_inSvg + puffLength},${puffAttachY_inSvg}
                        ${bodySideXRight_inSvg + puffLength * 0.7},${puffAttachY_inSvg - puffWidth * 0.3}
                    `;
                    return (
                        <Polygon points={rightPuffPoints} fill="lightblue" stroke="white" strokeWidth="1" />
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