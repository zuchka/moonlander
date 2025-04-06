import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, FadeIn, FadeOut } from 'react-native-reanimated';

interface ScoreTallyDisplayProps {
    fuelScore: number;
    levelBonus: number;
    totalScore: number;
    onDismiss?: () => void; // Optional: Callback when dismissed
}

const AnimatedNumber: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1000 }) => {
    const animatedValue = useSharedValue(0);

    useEffect(() => {
        animatedValue.value = withTiming(value, {
            duration: duration,
            easing: Easing.out(Easing.cubic), // Smooth easing
        });
    }, [value, duration, animatedValue]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            // Reanimated v3 requires accessing .value inside the style
            // No direct text manipulation, handle formatting in Text component
        };
    });

    // Use an Animated.Text if directly animating text content is needed and supported
    // For simplicity, we format the number in the Text component based on the animated value
    return (
        <Animated.View style={animatedStyle}>
            <Text style={styles.scoreValue}>
                {/* Format the number based on the animated value */}
                {/* Note: Reanimated focuses on style props; complex text animation might need other approaches */}
                {/* For a simple count-up, we can derive the text from the shared value */}
                {Math.round(animatedValue.value)}
            </Text>
        </Animated.View>
    );
};

const ScoreTallyDisplay: React.FC<ScoreTallyDisplayProps> = ({
    fuelScore,
    levelBonus,
    totalScore,
    onDismiss,
}) => {
    return (
        // Use Pressable to allow dismissing by tapping the background
        <Pressable style={styles.backdrop} onPress={onDismiss}>
            <Animated.View
                style={styles.cardContainer}
                // Prevent taps inside the card from dismissing
                onStartShouldSetResponder={() => true}
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(300)}
            >
                <Text style={styles.title}>Level Complete!</Text>

                <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Fuel Bonus:</Text>
                    <AnimatedNumber value={fuelScore} />
                </View>

                <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Level Bonus:</Text>
                    <AnimatedNumber value={levelBonus} />
                </View>

                <View style={[styles.scoreRow, styles.totalRow]}>
                    <Text style={styles.scoreLabel}>Total Score:</Text>
                    {/* Animate total score starting from previous total */}
                    <AnimatedNumber value={totalScore} duration={1500} />
                </View>

                {onDismiss && (
                    <Pressable style={styles.dismissButton} onPress={onDismiss}>
                        <Text style={styles.dismissText}>Tap to Continue</Text>
                    </Pressable>
                )}
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent backdrop
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50, // Ensure it's above other UI
    },
    cardContainer: {
        backgroundColor: '#333', // Dark card background
        borderRadius: 15,
        padding: 25,
        width: '85%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 25,
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#555',
    },
    totalRow: {
        borderBottomWidth: 0, // No border for the last row
        marginTop: 10,
    },
    scoreLabel: {
        fontSize: 18,
        color: '#ccc',
    },
    scoreValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        minWidth: 60, // Ensure space for numbers
        textAlign: 'right',
    },
    dismissButton: {
        marginTop: 30,
    },
    dismissText: {
        fontSize: 16,
        color: '#aaa',
        textDecorationLine: 'underline',
    },
});

export { ScoreTallyDisplay }; 