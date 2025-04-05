import React from 'react';
import { StyleSheet } from 'react-native';
import Matter from 'matter-js';
import Svg, { Polygon, Rect, G } from 'react-native-svg'; // Import Rect and G (Group)

// Define props including the testIDs from the test file
interface LanderProps {
    body: Matter.Body;
    size: number[];
    testID?: string; // For the Svg container
}

const Lander: React.FC<LanderProps> = ({ body, size, testID }) => {
    const width = size[0];
    const height = size[1];
    const { x: bodyX, y: bodyY } = body.position;
    const angle = body.angle; // Get angle for rotation

    // Calculate top-left position for the container Svg
    const topLeftX = bodyX - width / 2;
    const topLeftY = bodyY - height / 2;

    // Define LM parts relative to the center (0, 0) of the lander's local coordinates
    // Adjust these values to refine the shape
    const bodyWidth = width * 0.7;
    const bodyHeight = height * 0.5;
    const ascentStageHeight = height * 0.3;
    const ascentStageWidth = width * 0.4;
    const legSpread = width * 0.45;
    const legHeight = height * 0.4;
    const legTopAttach = bodyHeight * 0.3; // How far down the body legs attach
    const nozzleHeight = height * 0.15;
    const nozzleWidth = width * 0.2;

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
                    points={`${width / 2 - nozzleWidth / 2},${(height + bodyHeight) / 2} ${width / 2 + nozzleWidth / 2},${(height + bodyHeight) / 2} ${width / 2},${(height + bodyHeight) / 2 + nozzleHeight}`}
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