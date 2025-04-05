import React from 'react';
import { Canvas, Group, Skia } from '@shopify/react-native-skia';
import { LateralEffectEntity } from '@/src/entities'; // Import type

interface LateralThrusterEffectProps extends LateralEffectEntity {}

const LateralThrusterEffect: React.FC<LateralThrusterEffectProps> = ({ position, angle, isActive, direction }) => {
    if (!isActive || direction === 'none') {
        return null;
    }

    // TODO: Implement Skia particle effect logic here
    // May need different particle behavior based on 'direction'

    return (
         <Canvas style={{ position: 'absolute', left: position.x - 10, top: position.y - 10, width: 20, height: 20 }} pointerEvents="none">
            <Group transform={[{ rotate: angle }]} origin={Skia.Point(10, 10)}>
                {/* Placeholder - replace with particle emitter */}
                 <Skia.Paint color="lightblue" />
            </Group>
        </Canvas>
    );
};

export default LateralThrusterEffect; 