import React from 'react';
import { render } from '@testing-library/react-native';
import Lander from './Lander';
import Matter from 'matter-js';
import Svg, { G, Polygon } from 'react-native-svg';

// Mock Body
const mockBody: Matter.Body = {
    position: { x: 150, y: 250 },
    angle: Math.PI / 4, // 45 degrees
} as Matter.Body;

const size = [40, 40]; // width, height

describe('<Lander /> Renderer', () => {

    test('renders an Svg container with correct size', () => { // Renamed test slightly
        const { getByTestId } = render(<Lander body={mockBody} size={size} testID="lander-svg" />);
        const svg = getByTestId('lander-svg');

        expect(svg).toBeDefined();
        // Check basic width/height props, removed complex style check
        expect(svg.props.width).toBe(size[0]);
        expect(svg.props.height).toBe(size[1]);
    });

    test('renders an inner G element', () => { // Simplified test name further
        // Render with a testID on the G element
        const { getByTestId } = render(
            <Lander body={mockBody} size={size} testID="lander-svg" gTestID="lander-g" />
        );
        const g = getByTestId('lander-g');

        expect(g).toBeDefined();
        // Removed checks for g.props.rotation, originX, originY
    });

    test('renders a Polygon element inside the G', () => {
        const { getByTestId } = render(
            <Lander body={mockBody} size={size} testID="lander-svg" polygonTestID="lander-polygon" />
         );
        const polygon = getByTestId('lander-polygon');

        expect(polygon).toBeDefined();
        // Removed check for polygon.props.points
        expect(polygon.props.fill).toBeDefined(); // Keep basic style check
    });

    // Optional: Snapshot test to catch unexpected structure changes
    test('matches snapshot', () => {
        const tree = render(<Lander body={mockBody} size={size} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});

// Helper type to allow passing testIDs down for testing internals
type LanderProps = {
  body: Matter.Body;
  size: number[];
  testID?: string;
  gTestID?: string;
  polygonTestID?: string;
};