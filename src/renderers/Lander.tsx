import React from 'react';
import { View, StyleSheet } from 'react-native';
import Matter from 'matter-js';
import Svg, { G, Polygon } from 'react-native-svg';

// Define props including the testIDs from the test file
interface LanderProps {
    body: Matter.Body;
    size: number[];
    testID?: string; // For the Svg container
    gTestID?: string; // For the G element
    polygonTestID?: string; // For the Polygon
}

const Lander: React.FC<LanderProps> = ({ body, size, testID, gTestID, polygonTestID }) => {
    const width = size[0];
    const height = size[1];
    const { x: bodyX, y: bodyY } = body.position;
    const angleRad = body.angle;
    const angleDeg = angleRad * 180 / Math.PI; // Convert to degrees for SVG transform

    // Calculate top-left position for the Svg container
    const topLeftX = bodyX - width / 2;
    const topLeftY = bodyY - height / 2;

    // Define the shape of the lander relative to its center (0,0 within the G element)
    // Simple triangular shape for example:
    const points = [
        `${0},${-height / 2}`,         // Top point
        `${-width / 2},${height / 2}`, // Bottom left
        `${width / 2},${height / 2}`   // Bottom right
    ].join(' ');

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
            // viewBox might be useful if shape coordinates are complex
            // viewBox={`0 0 ${width} ${height}`}
        >
            <G
                testID={gTestID} // Pass down testID
                rotation={angleDeg}
                originX={width / 2} // Rotate around the center of the SVG container
                originY={height / 2}
                // Apply translation to center the shape within the G element before rotation
                translateX={width / 2}
                translateY={height / 2}
            >
                <Polygon
                    testID={polygonTestID} // Pass down testID
                    points={points}
                    fill="lightblue" // Example color
                    stroke="white"
                    strokeWidth="1"
                />
                {/* Add thruster elements here later */}
            </G>
        </Svg>
    );
};

const styles = StyleSheet.create({
    landerSvg: {
        position: 'absolute',
        // backgroundColor: 'rgba(255, 0, 0, 0.1)', // Optional: for debugging bounds
    },
});

export default Lander; 