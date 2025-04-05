import Matter, { Vertices } from 'matter-js';
import decomp from 'poly-decomp';
import { Dimensions } from 'react-native';
import { IBodyDefinition } from 'matter-js';

// Register the decomposer with Matter.js
Matter.Common.setDecomp(decomp);

// Remove top-level dimension fetching
// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define type for vertices
export type Vec2D = { x: number; y: number };

// --- Constants for Terrain Generation ---
const TERRAIN_STEP_X = 20;         // Horizontal distance between points
const TERRAIN_MAX_DY = 15;         // Max vertical change per step
const TERRAIN_MIN_Y_FACTOR = 0.6;  // Min terrain height (fraction of screen height)
const TERRAIN_MAX_Y_FACTOR = 0.85; // Max terrain height (fraction of screen height)

// --- Physics Engine Setup ---

/**
 * Initializes the Matter.js physics engine and world.
 * @returns {{engine: Matter.Engine, world: Matter.World}} The physics engine and world instances.
 */
export const initializePhysics = () => {
  const engine = Matter.Engine.create();
  const world = engine.world;
  world.gravity.y = 0.05; // Adjust gravity as needed

  // Optional bounds - if uncommented, these would also need dynamic dimensions
  // const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  // Matter.World.add(world, [
  //   Matter.Bodies.rectangle(screenWidth / 2, -50, screenWidth, 100, { isStatic: true }),
  //   Matter.Bodies.rectangle(screenWidth / 2, screenHeight + 50, screenWidth, 100, { isStatic: true }),
  //   Matter.Bodies.rectangle(-50, screenHeight / 2, 100, screenHeight, { isStatic: true }),
  //   Matter.Bodies.rectangle(screenWidth + 50, screenHeight / 2, 100, screenHeight, { isStatic: true }),
  // ]);

  return { engine, world };
};

// --- Body Creation ---

// Constants for the lander size (don't depend on screen dimensions)
const LANDER_WIDTH = 40;
const LANDER_HEIGHT = 40;

/**
 * Creates the physics body for the lander.
 * @param {object} options - Additional Matter.js body options (mass, friction, etc.).
 * @returns {Matter.Body} The lander physics body.
 */
export const createLanderBody = (options = {}) => {
  // Get dimensions inside the function
  const { width: screenWidth } = Dimensions.get('window');
  const landerStartX = screenWidth / 2;
  const landerStartY = 50; // Start near the top

  return Matter.Bodies.rectangle(
    landerStartX,
    landerStartY,
    LANDER_WIDTH,
    LANDER_HEIGHT,
    {
      label: 'lander',
      frictionAir: 0.01, // Some air resistance
      density: 0.001,    // Adjust mass via density
      ...options,
    }
  );
};

// Function to generate example terrain based on current dimensions
export const getExampleTerrainVertices = (): Vec2D[][] => {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    return [
        // A simple flat ground segment
        [{ x: 0, y: screenHeight - 50 }, { x: screenWidth * 0.4, y: screenHeight - 50 }, { x: screenWidth * 0.4, y: screenHeight }, { x: 0, y: screenHeight }],
        // A small hill
        [{ x: screenWidth * 0.6, y: screenHeight - 100 }, { x: screenWidth, y: screenHeight - 100 }, { x: screenWidth, y: screenHeight }, { x: screenWidth * 0.6, y: screenHeight }],
    ];
}

// Landing Pad Size Constants
const LANDING_PAD_WIDTH = 80;
const LANDING_PAD_HEIGHT = 10;

/**
 * Creates the static physics body for the landing pad.
 * @param {number} x - The center X coordinate for the landing pad.
 * @param {number} y - The center Y coordinate for the landing pad.
 * @param {IBodyDefinition} [options={}] - Optional Matter.js body options.
 * @returns {Matter.Body} The landing pad physics body.
 */
export const createLandingPadBody = (x: number, y: number, options: IBodyDefinition = {}) => {
    // Use provided x, y for the center position
    return Matter.Bodies.rectangle(
        x,
        y,
        LANDING_PAD_WIDTH,
        LANDING_PAD_HEIGHT,
        {
            label: 'landing-pad',
            isStatic: true,
            isSensor: false, // Ensure it's solid
            friction: 0.8, // Give it some friction
            ...options,
        }
    );
};

/**
 * Generates vertex sets for jagged terrain segments, including a flat landing area.
 * @param screenWidth The width of the screen.
 * @param screenHeight The height of the screen.
 * @param landingPadX The center X coordinate of the landing pad.
 * @param landingPadWidth The width of the landing pad.
 * @param landingPadTopY The Y coordinate for the top surface of the landing pad.
 * @returns {Vec2D[][]} An array of vertex arrays, each defining a terrain segment polygon.
 */
export const generateTerrainVertices = (
    screenWidth: number,
    screenHeight: number,
    landingPadX: number,
    landingPadWidth: number,
    landingPadTopY: number // Add parameter for pad's Y coordinate
): Vec2D[][] => {

    const minY = screenHeight * TERRAIN_MIN_Y_FACTOR;
    const maxY = screenHeight * TERRAIN_MAX_Y_FACTOR;
    // Use the passed landingPadTopY instead of hardcoding
    // const landingPadTopY = screenHeight - 50 - (10 / 2); // REMOVED

    const padStartX = landingPadX - landingPadWidth / 2;
    const padEndX = landingPadX + landingPadWidth / 2;

    const topEdgePoints: Vec2D[] = [];
    let currentX = 0;
    let currentY = Math.min(maxY, landingPadTopY + Math.random() * 50);

    topEdgePoints.push({ x: currentX, y: currentY });

    while (currentX < screenWidth) {
        const nextX = Math.min(currentX + TERRAIN_STEP_X, screenWidth);
        let nextY = currentY;

        const isEnteringPad = currentX < padStartX && nextX >= padStartX;
        const isExitingPad = currentX < padEndX && nextX >= padEndX;
        const isInsidePad = currentX >= padStartX && nextX <= padEndX;

        if (isEnteringPad) {
            topEdgePoints.push({ x: padStartX, y: landingPadTopY });
            nextY = landingPadTopY;
        } else if (isInsidePad) {
            nextY = landingPadTopY;
        } else if (isExitingPad) {
            topEdgePoints.push({ x: padEndX, y: landingPadTopY });
            const dy = (Math.random() * 2 - 1) * TERRAIN_MAX_DY;
            nextY = Math.max(minY, Math.min(maxY, landingPadTopY + dy));
       } else {
            const dy = (Math.random() * 2 - 1) * TERRAIN_MAX_DY;
            nextY = Math.max(minY, Math.min(maxY, currentY + dy));
       }

       topEdgePoints.push({ x: nextX, y: nextY });
       currentX = nextX;
       currentY = nextY;
    }

    const segmentVerticesList: Vec2D[][] = [];
    for (let i = 0; i < topEdgePoints.length - 1; i++) {
        const p1 = topEdgePoints[i];
        const p2 = topEdgePoints[i+1];
        segmentVerticesList.push([
            { x: p1.x, y: p1.y },
            { x: p2.x, y: p2.y },
            { x: p2.x, y: screenHeight },
            { x: p1.x, y: screenHeight },
        ]);
    }

    return segmentVerticesList;
};

/**
 * Creates static physics bodies for the terrain.
 * @param {Vec2D[][]} [terrainVertices] - Optional array of vertex arrays defining terrain segments. Defaults to example terrain.
 * @param {IBodyDefinition} [options] - Optional Matter.js body options.
 * @returns {Array<Matter.Body>} An array of terrain physics bodies.
 */
export const createTerrainBodies = (terrainVertices?: Vec2D[][], options: IBodyDefinition = {}) => {
    let verticesToUse: Vec2D[][];
    if (terrainVertices) {
        verticesToUse = terrainVertices;
    } else {
        const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
        const landingPadX = screenWidth / 2;
        const landingPadWidth = 80; // Use constant - should ideally come from shared constants
        verticesToUse = generateTerrainVertices(screenWidth, screenHeight, landingPadX, landingPadWidth, 0);
    }

    return verticesToUse.map((vertices: Vec2D[]) => {
        const centre = Matter.Vertices.centre(vertices);
        const body = Matter.Bodies.fromVertices(
            centre.x,
            centre.y,
            [vertices],
            {
                label: 'terrain',
                isStatic: true,
                ...options,
                render: { visible: false, ...(options.render || {}) }
            }
        );

        if (options.friction !== undefined) {
            body.friction = options.friction;
        }
        return body;
    });
}; 