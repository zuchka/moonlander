import Matter from 'matter-js';
import { Entities, EffectEntity, LateralEffectEntity } from '@/src/entities';

// Helper function to rotate a point around an origin
const rotatePoint = (point: {x: number, y: number}, origin: {x: number, y: number}, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = point.x - origin.x;
    const dy = point.y - origin.y;
    return {
        x: origin.x + dx * cos - dy * sin,
        y: origin.y + dx * sin + dy * cos,
    };
};

const EffectsSystem = (entities: Entities) => {
    const lander = entities.lander;
    const gameState = entities.gameState;
    const mainThruster = entities.mainThrusterEffect;
    const lateralThruster = entities.lateralThrusterEffect;

    if (!lander || !lander.body || !gameState || !mainThruster || !lateralThruster) {
        return entities;
    }

    const landerBody = lander.body;
    const landerPosition = landerBody.position;
    const landerAngle = landerBody.angle; // Angle in radians
    const isThrusting = gameState.inputState.thrusting;
    const lateralDirection = gameState.inputState.lateral;

    // --- Main Thruster ---
    mainThruster.isActive = isThrusting && gameState.fuel > 0;
    if (mainThruster.isActive) {
        // Calculate position below the nozzle, relative to lander center
        // Note: Assumes lander size is available and reasonably accurate
        const nozzleOffsetX = 0; // Nozzle is centered horizontally
        const landerHeight = lander.size?.[1] ?? 40; // Use size or default
        const nozzleOffsetY = (landerHeight / 2) * 0.8; // Approx position below center
        const relativeNozzlePos = { x: nozzleOffsetX, y: nozzleOffsetY }; // Point below center

        // Rotate this relative position by lander angle around lander center (0,0 in local coords)
        // then add lander's world position
        const worldNozzlePos = rotatePoint(relativeNozzlePos, {x: 0, y: 0}, landerAngle);

        mainThruster.position.x = landerPosition.x + worldNozzlePos.x;
        mainThruster.position.y = landerPosition.y + worldNozzlePos.y;
        mainThruster.angle = landerAngle; // Align emitter with lander
    }

    // --- Lateral Thruster ---
    lateralThruster.isActive = lateralDirection !== 'none';
    lateralThruster.direction = lateralDirection; // Pass direction to renderer

    if (lateralThruster.isActive) {
        // Calculate position on the side of the body, relative to lander center
        const landerWidth = lander.size?.[0] ?? 40; // Use size or default
        const bodyWidthRatio = 0.7; // Match visual approx.
        const attachOffsetY = 0; // Attach halfway down vertically (local 0)
        // Position emitter slightly outside the main body visual
        const attachOffsetX = (landerWidth * bodyWidthRatio / 2 + 5) * (lateralDirection === 'left' ? -1 : 1);

        const relativeAttachPos = { x: attachOffsetX, y: attachOffsetY };
        const worldAttachPos = rotatePoint(relativeAttachPos, {x: 0, y: 0}, landerAngle);

        lateralThruster.position.x = landerPosition.x + worldAttachPos.x;
        lateralThruster.position.y = landerPosition.y + worldAttachPos.y;

        // Point emitter outward, relative to lander angle
        lateralThruster.angle = landerAngle + (lateralDirection === 'left' ? -Math.PI / 2 : Math.PI / 2);

    }

    return entities;
};

export { EffectsSystem }; 