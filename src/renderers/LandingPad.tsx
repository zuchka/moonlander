import React from 'react';
import { StyleSheet } from 'react-native';
import Matter from 'matter-js';
import Svg, { Rect } from 'react-native-svg';

interface LandingPadProps {
    body: Matter.Body;
    size: number[];
    testID?: string; // For the Svg container
    rectTestID?: string; // For the Rect
}

const LandingPad: React.FC<LandingPadProps> = ({ body, size, testID, rectTestID }) => {
    const width = size[0];
    const height = size[1];
    const { x: bodyX, y: bodyY } = body.position;

    // Calculate top-left position
    const topLeftX = bodyX - width / 2;
    const topLeftY = bodyY - height / 2;

    return (
        <Svg
            testID={testID}
            width={width}
            height={height}
            style={[
                styles.landingPadSvg,
                {
                    left: topLeftX,
                    top: topLeftY,
                    width: width,
                    height: height,
                }
            ]}
        >
            <Rect
                testID={rectTestID}
                x="0" // Positioned relative to the Svg container's top-left
                y="0"
                width={width}
                height={height}
                fill="mediumseagreen" // Example color
            />
        </Svg>
    );
};

const styles = StyleSheet.create({
    landingPadSvg: {
        position: 'absolute',
        // backgroundColor: 'rgba(0, 0, 255, 0.1)', // Optional: debug bounds
    },
});

export default LandingPad; 