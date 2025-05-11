import { AuthProvider } from "@/context/auth";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import "react-native-reanimated";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) hideAsync();
  }, [loaded]);

  if (!loaded) return <Slot />;

  return (
    <ThemeProvider value={DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
