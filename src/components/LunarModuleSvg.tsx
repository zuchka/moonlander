import React from 'react';
import Svg, { G, Polygon, Rect, Path, Circle } from 'react-native-svg';

interface LunarModuleSvgProps {
    width: number | string;
    height: number | string;
    color?: string;
}

const LunarModuleSvg: React.FC<LunarModuleSvgProps> = ({ width, height, color = 'black' }) => {
    // Using a viewBox allows us to define coordinates in a relative system
    // and scale the SVG using width/height props.
    // Let's define a 100x120 box (approx aspect ratio)
    const viewBoxWidth = 100;
    const viewBoxHeight = 120;

    return (
        <Svg
            width={width}
            height={height}
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        >
            <G fill={color}>
                {/* Descent Stage (Approximate box shape) */}
                <Polygon points="25,55 75,55 80,65 75,80 25,80 20,65" />

                {/* Ascent Stage (More complex polygon) */}
                <Polygon points="40,10 60,10 65,20 70,30 70,45 65,55 35,55 30,45 30,30 35,20" />
                {/* Inner structures/windows of ascent stage (using Paths or Polygons) */}
                <Polygon points="42,25 58,25 58,40 62,50 38,50 42,40" fill="white" /> // Example inner detail (inverted)
                <Rect x="45" y="12" width="10" height="8" fill="white" />

                {/* Top Antenna */}
                <Rect x="48" y="0" width="4" height="8" />
                <Circle cx="50" cy="4" r="3" fill="white" />
                <Path d="M 48 8 L 45 10 L 55 10 L 52 8 Z" />

                {/* Side Radar Dish (Approximate) */}
                <Circle cx="20" cy="35" r="8" />
                <Rect x="10" y="34" width="10" height="2" />
                <Circle cx="20" cy="35" r="4" fill="white" />


                {/* Legs (Four symmetrical polygons - simplified) */}
                {/* Front Left */}
                <Polygon points="25,80 10,110 15,115 30,85" />
                {/* Front Right */}
                <Polygon points="75,80 90,110 85,115 70,85" />
                 {/* Rear Left (implied - drawing slightly offset) */}
                {/* <Polygon points="30,80 15,110 20,115 35,85" /> */}
                {/* Rear Right (implied - drawing slightly offset) */}
                {/* <Polygon points="70,80 85,110 80,115 65,85" /> */}

                {/* Footpads (Circles/Paths) */}
                <Circle cx="12.5" cy="112.5" r="5" />
                <Circle cx="87.5" cy="112.5" r="5" />
                {/* <Circle cx="17.5" cy="112.5" r="5" /> */}
                {/* <Circle cx="82.5" cy="112.5" r="5" /> */}

                {/* Nozzle */}
                <Rect x="45" y="80" width="10" height="10" />
                <Polygon points="45,90 55,90 60,100 40,100" />
                <Circle cx="50" cy="102" r="4" />

            </G>
        </Svg>
    );
};

export default LunarModuleSvg; 