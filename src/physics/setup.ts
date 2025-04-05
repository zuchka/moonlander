import Matter from 'matter-js';
import decomp from 'poly-decomp';
import { Dimensions } from 'react-native';
import { IBodyDefinition } from 'matter-js';

// Register the decomposer with Matter.js
Matter.Common.setDecomp(decomp);

// Remove top-level dimension fetching
// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define type for vertices
type Vec2D = { x: number; y: number };

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
const getExampleTerrainVertices = (): Vec2D[][] => {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    return [
        // A simple flat ground segment
        [{ x: 0, y: screenHeight - 50 }, { x: screenWidth * 0.4, y: screenHeight - 50 }, { x: screenWidth * 0.4, y: screenHeight }, { x: 0, y: screenHeight }],
        // A small hill
        [{ x: screenWidth * 0.6, y: screenHeight - 100 }, { x: screenWidth, y: screenHeight - 100 }, { x: screenWidth, y: screenHeight }, { x: screenWidth * 0.6, y: screenHeight }],
    ];
}

/**
 * Creates static physics bodies for the terrain.
 * @param {Vec2D[][]} [terrainVertices] - Optional array of vertex arrays defining terrain segments. Defaults to example terrain.
 * @param {IBodyDefinition} [options] - Optional Matter.js body options.
 * @returns {Array<Matter.Body>} An array of terrain physics bodies.
 */
export const createTerrainBodies = (terrainVertices?: Vec2D[][], options: IBodyDefinition = {}) => {
    // Use provided vertices or generate default ones
    const verticesToUse = terrainVertices ?? getExampleTerrainVertices();

    return verticesToUse.map((vertices: Vec2D[]) => {
        const body = Matter.Bodies.fromVertices(
            0, // x position
            0, // y position
            [vertices],
            {
                label: 'terrain',
                isStatic: true,
                // Spread base options, excluding friction and potentially complex ones like render
                ...options,
                render: { visible: false, ...(options.render || {}) }
            }
        );

        // Explicitly set properties that might be ignored for static bodies during creation
        if (options.friction !== undefined) {
            body.friction = options.friction;
        }
        // Add other properties here if needed

        return body;
    });
};


// Landing Pad Size Constants
const LANDING_PAD_WIDTH = 80;
const LANDING_PAD_HEIGHT = 10;

/**
 * Creates the static physics body for the landing pad.
 * @param {IBodyDefinition} [options] - Optional Matter.js body options.
 * @returns {Matter.Body} The landing pad physics body.
 */
export const createLandingPadBody = (options: IBodyDefinition = {}) => {
  // Get dimensions inside the function
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const landingPadX = screenWidth / 2;
  const landingPadY = screenHeight - 50 - (LANDING_PAD_HEIGHT / 2);

  const body = Matter.Bodies.rectangle(
    landingPadX,
    landingPadY,
    LANDING_PAD_WIDTH,
    LANDING_PAD_HEIGHT,
    {
      label: 'landingPad',
      isStatic: true,
      isSensor: false, // Set default base properties
      // Spread base options, excluding ones we'll set explicitly
      ...options,
      render: { visible: false, ...(options.render || {}) }, // Merge render options
    }
  );

  // Explicitly set properties after creation
  if (options.friction !== undefined) {
      body.friction = options.friction;
  }
  if (options.isSensor !== undefined) {
      body.isSensor = options.isSensor;
  }
  // Add other properties here if needed

  return body;
}; 