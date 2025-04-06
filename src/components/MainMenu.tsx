import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

// Define or import shared neobrutalist styles
// (Duplicating for now, ideally extract to a shared file)
const neoStyles = {
    mainBg: '#FFFFFF',      
    border: '#111827',    
    shadow: '#111827',    
    text: '#111827',      
    shadowOffset: 4,       
    borderRadius: 8,       
    borderWidth: 2,
};

interface MainMenuProps {
    onStartGame: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
    return (
        // Container to center the card
        <View style={styles.screenContainer}>
            {/* Wrapper for positioning card + shadow */}
            <View style={styles.menuCardContainer}>
                {/* Visible card content */}
                <View style={styles.menuCardContent}>
                    <Text style={styles.titleText}>Moon Lander</Text>
                    <TouchableOpacity style={styles.menuButton} onPress={onStartGame}>
                        <Text style={styles.menuButtonText}>Start Game</Text>
                    </TouchableOpacity>
                    {/* Add other buttons here later if needed */}
                </View>
                {/* Shadow element */}
                <View style={styles.menuCardShadow} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: { // Fills the screen and centers content
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000', // Assuming black background
    },
    menuCardContainer: { // Positions the card and its shadow
        width: '80%', 
        maxWidth: 300, // Max width for the menu card
        alignSelf: 'center', 
    },
    menuCardContent: { // Styles for the visible card
        backgroundColor: neoStyles.mainBg,
        borderWidth: neoStyles.borderWidth,
        borderColor: neoStyles.border,
        borderRadius: neoStyles.borderRadius,
        padding: 30, // More padding for menu card
        alignItems: 'center',
        zIndex: 2, 
        position: 'relative', 
    },
    menuCardShadow: { // Shadow element
        position: 'absolute',
        top: neoStyles.shadowOffset,
        left: neoStyles.shadowOffset,
        right: -neoStyles.shadowOffset, 
        bottom: -neoStyles.shadowOffset,
        backgroundColor: neoStyles.shadow,
        borderRadius: neoStyles.borderRadius,
        zIndex: 1,
    },
    titleText: { // Style for the game title
        fontSize: 36,
        fontWeight: 'bold',
        color: neoStyles.text,
        marginBottom: 40, // Space below title
    },
    menuButton: { // Adapting actionButton styles
        backgroundColor: neoStyles.mainBg,
        borderWidth: neoStyles.borderWidth,
        borderColor: neoStyles.border,
        borderRadius: neoStyles.borderRadius,
        paddingVertical: 12,
        paddingHorizontal: 25,
        marginTop: 15,
        shadowColor: neoStyles.shadow,
        shadowOffset: { width: neoStyles.shadowOffset / 2, height: neoStyles.shadowOffset / 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3, 
    },
    menuButtonText: { // Adapting actionText styles
        color: neoStyles.text,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default MainMenu; 