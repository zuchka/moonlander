import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Define GameStatus locally (or import if moved to a central types file)
type GameStatus = 
    | 'playing' 
    | 'landed' 
    | 'crashed' 
    | 'crashed-fuel' 
    | 'crashed-pad-speed' 
    | 'crashed-pad-angle' 
    | 'crashed-terrain' 
    | string;

interface StatusOverlayProps {
    status: GameStatus;
    crashSpeed: number | null;
    crashSpeedLimit: number | null;
    onRestart: () => void;
    onNextLevel: () => void;
}

// Minimal placeholder component
const StatusOverlay: React.FC<StatusOverlayProps> = ({
    status,
    // ... other props (unused for now)
    onRestart,
    onNextLevel,
}) => {
    if (status === 'playing') {
        return null; // Don't show anything during play
    }

    let message = '';
    if (status === 'landed') {
        message = 'Landed!';
        // Add Next Level button logic here later
    } else if (status.startsWith('crashed')) {
        message = 'Crashed!';
        // Add Restart button logic here later
    }

    return (
        <View style={styles.container} pointerEvents="auto">
            <Text style={styles.text}>{message}</Text>
            {/* Buttons will be added later */} 
            {status === 'landed' && <Text style={styles.buttonPlaceholder}>[Next Level]</Text>} 
            {status.startsWith('crashed') && <Text style={styles.buttonPlaceholder}>[Restart]</Text>} 
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: '40%',
        left: '10%',
        right: '10%',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    buttonPlaceholder: {
        color: '#aaa',
        marginTop: 10,
    }
});

export { StatusOverlay }; 