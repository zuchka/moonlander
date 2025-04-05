import React from 'react';
import { StyleSheet } from 'react-native';
import Matter from 'matter-js';
import Svg, { Polygon } from 'react-native-svg';
// Assuming Vec2D is exported from setup or a types file
import { Vec2D } from '@/src/physics/setup';

interface TerrainSegmentProps {
    body: Matter.Body;
    vertices?: Vec2D[]; // Get vertices from props
    testID?: string; // For the Svg container
    polygonTestID?: string; // For the Polygon
}

const TerrainSegment: React.FC<TerrainSegmentProps> = ({ vertices, testID, polygonTestID }) => {
    // Use the vertices passed in props, not from body.vertices
    if (!vertices || vertices.length === 0) {
        // Optionally log body ID if vertices are missing for debugging
        // console.warn('TerrainSegment missing vertices prop for body:', body?.id);
        return null;
    }

    // Format vertices for the SVG Polygon points attribute
    const points = vertices.map(v => `${v.x},${v.y}`).join(' ');

    // Terrain vertices are often in world coordinates.
    // The Svg container covers the whole screen, and the Polygon uses the direct vertex coordinates.
    return (
        <Svg
            testID={testID}
            style={styles.terrainSvg} // Covers the whole area
            // No specific width/height needed if covering screen and using world coords
        >
            <Polygon
                testID={polygonTestID}
                points={points}
                fill="darkgrey"
                stroke="grey"
                strokeWidth="1"
            />
        </Svg>
    );
};

const styles = StyleSheet.create({
    terrainSvg: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        // backgroundColor: 'rgba(0, 255, 0, 0.05)', // Optional: debug bounds
    },
});

export default TerrainSegment; 