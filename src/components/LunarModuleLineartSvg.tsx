import React from 'react';
import Svg, { G, Polyline, Line, Rect, Circle, Path } from 'react-native-svg';

interface LunarModuleLineartSvgProps {
    width: number | string;
    height: number | string;
    strokeColor?: string;
    strokeWidth?: number;
}

const LunarModuleLineartSvg: React.FC<LunarModuleLineartSvgProps> = ({
    width,
    height,
    strokeColor = '#DAA520', /* Gold-ish color */
    strokeWidth = 0.5, /* Thin lines for line art */
}) => {
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
            <G fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
                <Polyline points="20,65 25,55 75,55 80,65 75,80 25,80 20,65" />
                <Rect x="46" y="55" width="8" height="25" />
                <Line x1="46" y1="60" x2="54" y2="60" />
                <Line x1="46" y1="65" x2="54" y2="65" />
                <Line x1="46" y1="70" x2="54" y2="70" />
                <Line x1="46" y1="75" x2="54" y2="75" />
                <Polyline points="35,20 40,10 60,10 65,20 70,30 70,45 65,55 35,55 30,45 30,30 35,20" />
                <Circle cx="50" cy="35" r="22" />
                <Rect x="42" y="40" width="16" height="10" />
                <Circle cx="45" cy="30" r="2" />
                <Circle cx="50" cy="28" r="2" />
                <Circle cx="55" cy="30" r="2" />
                <Line x1="50" y1="0" x2="50" y2="10" />
                <Circle cx="50" cy="4" r="3" />
                <Line x1="47" y1="4" x2="53" y2="4" />
                <Line x1="50" y1="1" x2="50" y2="7" />
                <Circle cx="20" cy="35" r="8" />
                <Line x1="12" y1="35" x2="28" y2="35" />
                <Line x1="20" y1="27" x2="20" y2="43" />
                <Line x1="28" y1="35" x2="32" y2="38" />
                <Rect x="32" y="37" width="3" height="3" />
                <Polyline points="70,35 75,38 75,42 70,45" />
                <Line x1="75" y1="38" x2="78" y2="38" />
                <Line x1="75" y1="42" x2="78" y2="42" />
                <Polyline points="30,55 25,80 15,105 10,110" />
                <Line x1="15" y1="105" x2="18" y2="108" />
                <Polyline points="70,55 75,80 85,105 90,110" />
                <Line x1="85" y1="105" x2="82" y2="108" />
                <Line x1="35" y1="80" x2="15" y2="105" />
                <Line x1="65" y1="80" x2="85" y2="105" />
                <Path d="M 5 110 A 8 8 0 0 1 20 110" />
                <Path d="M 80 110 A 8 8 0 0 1 95 110" />
                <Polyline points="45,80 40,90 60,90 55,80" />
                <Polyline points="42,90 40,100 60,100 58,90" />
                <Path d="M 45 100 A 5 5 0 0 1 55 100" />
            </G>
        </Svg>
    );
};

export default LunarModuleLineartSvg; 