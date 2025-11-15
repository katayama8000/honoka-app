/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

type Theme = "purple" | "autumn";
const CURRENT_THEME: Theme = "autumn";

const themes = {
  purple: {
    tintColorLight: "#9575CD",
    tintColorDark: "#B39DDB",
    primaryColor: "#9575CD",
    light: {
      text: "#4A148C",
      background: "#F3E5F5",
      card: "#FDFBFF",
      icon: "#9575CD",
    },
    dark: {
      text: "#F3E5F5",
      background: "#311B92",
      card: "#4A148C",
      icon: "#B39DDB",
    },
    secondary: "#7E57C2",
    gray: "#E1BEE7",
    required: "#7E57C2",
    textOnPrimary: "#FFFFFF",
  },
  autumn: {
    tintColorLight: "#D2691E",
    tintColorDark: "#FFD700",
    primaryColor: "#D2691E",
    light: {
      text: "#5D4037",
      background: "#FFF8E1",
      card: "#FFFDF3",
      icon: "#D2691E",
    },
    dark: {
      text: "#FFF8E1",
      background: "#3E2723",
      card: "#4E342E",
      icon: "#FFD700",
    },
    secondary: "#E65100",
    gray: "#D7CCC8",
    required: "#E65100",
    textOnPrimary: "#FFF8E1",
  },
};

const selectedTheme = themes[CURRENT_THEME];
const tintColorLight = selectedTheme.tintColorLight;
const tintColorDark = selectedTheme.tintColorDark;
export const primaryColor = selectedTheme.primaryColor;

export const Colors = {
  light: {
    text: selectedTheme.light.text,
    background: selectedTheme.light.background,
    card: selectedTheme.light.card,
    tint: tintColorLight,
    icon: selectedTheme.light.icon,
    tabIconDefault: selectedTheme.light.icon,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: selectedTheme.dark.text,
    background: selectedTheme.dark.background,
    card: selectedTheme.dark.card,
    tint: tintColorDark,
    icon: selectedTheme.dark.icon,
    tabIconDefault: selectedTheme.dark.icon,
    tabIconSelected: tintColorDark,
  },
  primary: primaryColor,
  secondary: selectedTheme.secondary,
  white: "#fff",
  black: "#000",
  gray: selectedTheme.gray,
  required: selectedTheme.required,
  gold: "#FFD700",
  textOnPrimary: selectedTheme.textOnPrimary,
} as const;
