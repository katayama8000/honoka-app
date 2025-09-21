/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#D2691E"; // Chocolate
const tintColorDark = "#FFD700"; // Gold
export const primaryColor = "#D2691E"; // Chocolate

export const Colors = {
  light: {
    text: "#5D4037", // Dark Brown
    background: "#FFF8E1", // Light Beige
    card: "#FFFDF3", // Off-white for cards
    tint: tintColorLight,
    icon: "#D2691E",
    tabIconDefault: "#D2691E",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#FFF8E1", // Light Beige
    background: "#3E2723", // Darkest Brown
    card: "#4E342E", // Darker Brown for cards
    tint: tintColorDark,
    icon: "#FFD700",
    tabIconDefault: "#FFD700",
    tabIconSelected: tintColorDark,
  },
  primary: primaryColor,
  secondary: "#E65100", // Deep Orange
  white: "#fff",
  black: "#000",
  gray: "#D7CCC8", // Light Brownish Gray
  required: "#E65100", // Deep Orange
  gold: "#FFD700",
  textOnPrimary: "#FFF8E1",
} as const;