/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#ac76f1ff";
const tintColorDark = "#fff";
export const primaryColor = "#ac76f1ff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#ac76f1ff",
    tabIconDefault: "#ac76f1ff",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#ac76f1ff",
    tabIconDefault: "#ac76f1ff",
    tabIconSelected: tintColorDark,
  },
  primary: primaryColor,
  secondary: "#f44336",
  white: "#fff",
  black: "#000",
  gray: "#f0f0f0",
  required: "#f44336",
} as const;
