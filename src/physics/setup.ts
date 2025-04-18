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

// --- Landing Constants ---
export const MAX_LANDING_ANGLE = 0.1; // Radians (~5.7 degrees) - Export this

// --- Physics Engine Setup ---

/**
 * Initializes the Matter.js physics engine and world.
 * @returns {{engine: Matter.Engine, world: Matter.World}} The physics engine and world instances.
 */
export const initializePhysics = () => {
  const engine = Matter.Engine.create();
  const world = engine.world;
  // Adjust gravity for Moon (~1/6th Earth)
  // Earth baseline often ~1.0, so Moon ~0.167
  world.gravity.y = 0.16; // Increased from 0.05

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
 * Creates the landing pad physics body.
 * @param {number} x - Center X position.
 * @param {number} y - Center Y position.
 * @param {number} width - Width of the pad.
 * @param {IBodyDefinition} [options] - Optional Matter.js body options.
 * @returns {Matter.Body}
 */
export const createLandingPadBody = (x: number, y: number, width: number, options: IBodyDefinition = {}) => {
    // Use the constant for height for now
    const height = 10; // Assuming PAD_HEIGHT is 10, ideally get from config/constants

    return Matter.Bodies.rectangle(
        x,
        y,
        width, // Use the passed width
        height, // Use the height
        {
            label: 'landingPad',
            isStatic: true,
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

    const LANDER_WIDTH = 40; // Hardcode lander width for safety check
    // Ensure the physical flat area is wide enough for the lander
    const physicalPadWidth = Math.max(landingPadWidth, LANDER_WIDTH + 4); // Add small buffer (4px)

    const minY = screenHeight * TERRAIN_MIN_Y_FACTOR;
    const maxY = screenHeight * TERRAIN_MAX_Y_FACTOR;

    // Calculate the start/end of the *required physical flat zone*
    const physicalPadStartX = landingPadX - physicalPadWidth / 2;
    const physicalPadEndX = landingPadX + physicalPadWidth / 2;

    const topEdgePoints: Vec2D[] = [];
    let currentX = 0;
    let currentY = Math.min(maxY, landingPadTopY + Math.random() * 50);

    topEdgePoints.push({ x: currentX, y: currentY });

    while (currentX < screenWidth) {
        const nextX = Math.min(currentX + TERRAIN_STEP_X, screenWidth);
        let nextY = currentY;

        // Use physical pad boundaries for determining flat terrain
        const isEnteringPad = currentX < physicalPadStartX && nextX >= physicalPadStartX;
        const isExitingPad = currentX < physicalPadEndX && nextX >= physicalPadEndX;
        const isInsidePad = currentX >= physicalPadStartX && nextX <= physicalPadEndX;

        if (isEnteringPad) {
            // Ensure flat terrain starts exactly at the physical boundary
            topEdgePoints.push({ x: physicalPadStartX, y: landingPadTopY });
            nextY = landingPadTopY;
        } else if (isInsidePad) {
            // Keep terrain flat inside the physical boundary
            nextY = landingPadTopY;
        } else if (isExitingPad) {
            // Ensure flat terrain ends exactly at the physical boundary
            topEdgePoints.push({ x: physicalPadEndX, y: landingPadTopY });
            // Resume jagged terrain after the physical boundary
            const dy = (Math.random() * 2 - 1) * TERRAIN_MAX_DY;
            nextY = Math.max(minY, Math.min(maxY, landingPadTopY + dy));
        } else {
            // Normal jagged terrain outside the physical boundary
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

    // Use map to attempt creation, then filter out failures
    const bodies = verticesToUse.map((vertices: Vec2D[], index: number) => {
        // --- Existing debug logs for index 6 --- 
        if (index === 6) { 
            const centre = Matter.Vertices.centre(vertices);
            console.log(`DEBUG: createTerrainBodies - Index 6 - Centre: ${JSON.stringify(centre)}`);
            try {
                console.log(`DEBUG: createTerrainBodies - Index 6 - Vertices: ${JSON.stringify(vertices)}`);
            } catch (e) {
                console.log('DEBUG: createTerrainBodies - Index 6 - Vertices: Error stringifying vertices');
            }
        }
        // --- 

        // Attempt to create the body
        let body: Matter.Body | undefined;
        try {
            const centre = Matter.Vertices.centre(vertices);
            // Check if centre calculation was valid and vertices have some area
            if (centre.x === null || centre.y === null || vertices.length < 3) {
                 console.warn(`Skipping terrain body creation at index ${index} due to invalid vertices/centre.`);
                 return undefined; // Explicitly return undefined for filtering
            }

            body = Matter.Bodies.fromVertices(
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
        } catch (error) {
            console.warn(`Error creating terrain body at index ${index}:`, error);
            return undefined; // Return undefined on error for filtering
        }
        

        // --- Existing debug logs for index 6 --- 
        if (index === 6) {
            console.log(`DEBUG: createTerrainBodies - Index 6 - Body created: typeof=${typeof body}, id=${body?.id}, label=${body?.label}`);
             try {
                console.log(`DEBUG: createTerrainBodies - Index 6 - Body keys: ${body ? Object.keys(body).join(', ') : 'null/undefined'}`);
            } catch(e) {
                console.log('DEBUG: createTerrainBodies - Index 6 - Body: Error getting keys')
            }
        }
        // --- 

        // Check if body creation failed silently (returned undefined)
        if (!body) {
             console.warn(`Skipping terrain body at index ${index} because creation failed.`);
             return undefined;
        }

        if (options.friction !== undefined) {
            body.friction = options.friction;
        }
        return body; // Return the valid body
    });

    // Filter out any undefined results before returning
    const validBodies = bodies.filter(b => b !== undefined) as Matter.Body[];
    console.log(`DEBUG: createTerrainBodies - Created ${validBodies.length} valid bodies out of ${verticesToUse.length} segments.`);
    return validBodies;
}; 