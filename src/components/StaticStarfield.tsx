import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, View, useWindowDimensions } from 'react-native';

const NUM_STARS = 250; // Adjust number of stars as needed for performance/look
const MAX_STAR_SIZE = 2.0;
const MIN_STAR_SIZE = 0.5;
const MIN_STAR_OPACITY = 0.3;
const MAX_STAR_OPACITY = 1.0;

// Generate stars with random positions, sizes, and opacity
const generateStars = (screenWidth: number, screenHeight: number) => {
  const stars = [];
  for (let i = 0; i < NUM_STARS; i++) {
    const size = Math.random() * (MAX_STAR_SIZE - MIN_STAR_SIZE) + MIN_STAR_SIZE;
    const opacity = Math.random() * (MAX_STAR_OPACITY - MIN_STAR_OPACITY) + MIN_STAR_OPACITY;
    stars.push({
      id: `star-${i}`, // Add unique key
      x: Math.random() * screenWidth,
      y: Math.random() * screenHeight,
      size: size,
      opacity: opacity,
    });
  }
  return stars;
};

const StaticStarfield: React.FC = () => {
  // Get dimensions using the hook
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Memoize stars based on dimensions
  const stars = useMemo(() => generateStars(screenWidth, screenHeight), [screenWidth, screenHeight]);

  return (
    <View style={styles.container} pointerEvents="none">
      {stars.map((star) => (
        <View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2, // Make it round
              backgroundColor: `rgba(255, 255, 255, ${star.opacity})`, // White stars
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, // Fill parent completely
  },
  star: {
    position: 'absolute',
  },
});

export default StaticStarfield; 