# Moon Lander RN

![image](https://github.com/user-attachments/assets/99e303e3-8d99-42ed-91fa-813e46e29201)


A classic lunar lander game built with React Native and Expo.

## Goal

Pilot your lunar module safely onto the designated landing pads on the moon's surface. Manage your fuel, control your descent speed, and maintain a proper angle to achieve a successful landing. Watch out for rough terrain!

## Controls

### Mobile (iOS / Android)

*   **Main Thruster (Bottom Left):** Press and hold the bottom-left button (^) to apply upward thrust and slow your descent.
*   **Rotation Thrusters (Bottom Right):**
    *   Press and hold the left button (<) to rotate counter-clockwise.
    *   Press and hold the right button (>) to rotate clockwise.
    *   You can use the main thruster and a rotation thruster simultaneously.

### Web / Keyboard

*   **Up Arrow (`↑`):** Apply main thrust.
*   **Left Arrow (`←`):** Rotate counter-clockwise.
*   **Right Arrow (`→`):** Rotate clockwise.

## Landing & Crashing

*   **Successful Landing:** You must land on the flat landing pad with:
    *   Vertical and horizontal speed below the level's limit.
    *   Lander angle close to vertical (within the allowed range).
*   **Crash Conditions:**
    *   Landing too fast on the pad.
    *   Landing on the pad with too much angle.
    *   Hitting any other part of the terrain.
    *   Running out of fuel before landing.

## Lives & Game Over

*   You start with 3 lives.
*   Each crash costs one life.
*   Losing all lives results in a Game Over.
*   On the Game Over screen, you may have the option to watch a rewarded ad (if available) to gain 3 more lives and continue the current level.


## Tips for Success

*   Use short bursts of the main thruster to control your descent – don't burn fuel unnecessarily!
*   Keep an eye on both your vertical speed (`VVel`) and horizontal speed (`HVel`).
*   Make small rotational adjustments well before landing.
*   Approach the landing pad slowly and maintain a near-vertical angle.

---

## Development Setup

This is an [Expo](https://expo.dev) project.

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Start the Development Server**

    ```bash
    npx expo start
    ```

    Follow the prompts to open the app in:
    *   An iOS simulator (`i`)
    *   An Android emulator (`a`)
    *   A web browser (`w`)
    *   A custom [development build](https://docs.expo.dev/develop/development-builds/introduction/) on your device (scan the QR code after building with EAS).

---

Happy Landing!
