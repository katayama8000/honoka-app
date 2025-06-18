import { supabase } from "@/lib/supabase";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, Stack, useRouter } from "expo-router";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import "react-native-reanimated";
import { usePushNotification } from "@/hooks/usePushNotification";
import { useUser } from "@/hooks/useUser";
import { userAtom } from "@/state/user.state";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

preventAutoHideAsync();

export default function RootLayout() {
  const { fetchUser, updateExpoPushToken } = useUser();
  const [_, setUser] = useAtom(userAtom);
  const { registerForPushNotificationsAsync } = usePushNotification();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { push } = useRouter();

  useEffect(() => {
    if (loaded) hideAsync();
  }, [loaded]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data || !data.user) {
        push({ pathname: "/sign-in" });
        setIsLoggedIn(false);
        return;
      }
      setIsLoggedIn(true);

      supabase.auth.onAuthStateChange((event, _session) => {
        switch (event) {
          case "SIGNED_IN":
            push({ pathname: "/" });
            break;
          case "SIGNED_OUT":
            push({ pathname: "/sign-in" });
            break;
        }
      });
    })();
  }, [push]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    (async () => {
      const token = await registerForPushNotificationsAsync();

      const uid = (await supabase.auth.getSession())?.data.session?.user?.id;
      if (!uid) {
        push({ pathname: "/sign-in" });
        return;
      }
      const user = await fetchUser(uid);
      if (!user) {
        push({ pathname: "/sign-in" });
        return;
      }

      setUser(user);

      if (token) updateExpoPushToken(uid, token);
    })();
  }, []);

  if (!loaded) return <Slot />;

  return (
    <ThemeProvider value={DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          <Stack.Protected guard={isLoggedIn}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(modal)/payment-modal" options={{ presentation: "modal" }} />
            <Stack.Screen name="(modal)/subscription-modal" options={{ presentation: "modal" }} />
            <Stack.Screen name="past-invoice-details" options={{ title: "請求書詳細" }} />
          </Stack.Protected>
          <Stack.Protected guard={!isLoggedIn}>
            <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack.Protected>
        </Stack>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
