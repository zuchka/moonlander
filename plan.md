Plan: Using a Game Engine Library (react-native-game-engine + matter-js) to build a moonlander game

Assumptions:
Core Gameplay: Control a lander with main thruster and rotation (or side thrusters). Gravity constantly pulls down. Limited fuel. Goal is to land softly on a designated pad. Collision with terrain or landing too hard results in failure.

Visuals: Simple 2D representation: Lander sprite, line-based terrain, landing pad, basic UI (altitude, velocity, fuel gauge).

Controls: On-screen buttons for thrust and rotation/left/right movement.

This approach leverages existing libraries designed for game loops and physics simulation within React Native, treating the game elements as entities in a physics world.

Project Setup & Dependencies:

1. Initialize a standard React Native project.

- Install necessary libraries: react-native-game-engine, matter-js.
- Install potentially helpful libraries: react-native-svg (for drawing terrain/lander path), maybe a state management library if complexity grows (like Zustand or Redux Toolkit).

2. Physics World Setup (matter-js):

- Create a matter-js physics engine instance.
- Configure world settings: specifically, set gravity (e.g., world.gravity.y = 0.05).
- Define matter-js bodies:
  - Lander Body: A rectangular or polygonal body representing the lander. Give it appropriate mass, friction, etc.
  - Terrain Bodies: Create static matter-js bodies (rectangles, vertices) to represent the non-passable moon surface.
  - Landing Pad Body: A static matter-js body, similar to terrain but with a specific label (e.g., 'landingPad') for identification during collisions.

3. Game Engine Integration (react-native-game-engine):

- Set up the main <GameEngine> component.
- Define Entities: Javascript objects representing game elements (e.g., { physics: { engine, world }, lander: { body: landerBody, renderer: <Lander /> }, ... }). Include the physics engine/world as an entity.
- Define Systems: Functions that run on every game tick, receiving entities and dispatching events. Key systems:
  - Physics System: Calls Matter.Engine.update(engine, time.delta) to advance the physics simulation.
  - Lander Control System: Reads input state (button presses) and applies forces/torque to the landerBody using Matter.Body.applyForce. Decrements fuel when thrusting.
  - Collision System: Uses Matter.Events.on(engine, 'collisionStart', ...) to detect collisions. Checks pairs involving the lander. Determines if it's a crash (collision with terrain, or landing pad with excessive velocity/angle) or a successful landing (collision with landing pad within velocity/angle thresholds).
  - Game State System: Manages game status (playing, success, crash), fuel level, potentially scoring. Updates UI elements based on state.

4. Rendering:

- Create React components for each visual entity (e.g., <Lander>, <TerrainSegment>, <LandingPad>).
- These components receive the corresponding matter-js body data (position, angle) from the entities prop passed by react-native-game-engine.
- Use absolute positioning (position: 'absolute') and CSS transforms (transform: [{translateX}, {translateY}, {rotate}]) to place and orient the components based on the physics body data.
- react-native-svg could be used within renderers for more complex shapes like the terrain profile or drawing the lander's path.

5. UI & Controls:

- Implement standard React Native <View>, <Text>, <TouchableOpacity> components for UI overlays (fuel, velocity, altitude displays) and control buttons.
- Button presses update a shared state (could be component state, context, or a global state manager) that the Lander Control System reads to apply forces.
- Display game over/success messages based on the state managed by the Game State System.

6. Refinement:

- Tune physics parameters (gravity, thrust force, lander mass, friction).
- Add particle effects for thrusters (could be another entity/renderer).
- Implement level progression or different terrain maps.
- Add sound effects.