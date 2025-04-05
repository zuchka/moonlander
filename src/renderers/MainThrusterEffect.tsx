import React from 'react';
import { Canvas, useFrame, Group, Skia } from '@shopify/react-native-skia';
import { EffectEntity } from '@/src/entities'; // Import type

interface MainThrusterEffectProps extends EffectEntity {}

const MainThrusterEffect: React.FC<MainThrusterEffectProps> = ({ position, angle, isActive }) => {
    if (!isActive) {
        return null; // Don't render if not active
    }

    // TODO: Implement Skia particle effect logic here
    // For now, maybe just a placeholder shape

    return (
        <Canvas style={{ position: 'absolute', left: position.x - 10, top: position.y - 10, width: 20, height: 20 }} pointerEvents="none">
            <Group transform={[{ rotate: angle }]} origin={Skia.Point(10, 10)}>
                {/* Placeholder - replace with particle emitter */}
                 <Skia.Paint color="orange" />
            </Group>
        </Canvas>
    );
};

export default MainThrusterEffect; 