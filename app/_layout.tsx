import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, Stack, useRouter } from "expo-router";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import { supabase } from "@/lib/supabase";
import "react-native-reanimated";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUser } from "@/hooks/useUser";
import { userAtom } from "@/state/user.state";

preventAutoHideAsync();

export default function RootLayout() {
  const { fetchUser } = useUser();
  const [_, setUser] = useAtom(userAtom);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const router = useRouter();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) hideAsync();
  }, [loaded]);

  // 認証状態の初期化を統合
  // biome-ignore lint/correctness/useExhaustiveDependencies: 初期化時のみ実行したいため
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session?.user) {
          setIsLoggedIn(false);
          setIsInitialized(true);
          return;
        }

        const uid = data.session.user.id;

        // ユーザー情報を取得
        const user = await fetchUser(uid);
        if (!user) {
          setIsLoggedIn(false);
          setIsInitialized(true);
          return;
        }

        setUser(user);
        setIsLoggedIn(true);
        setIsInitialized(true);
        // 認証済みの場合は明示的に遷移しない（Stack.Protectedに任せる）
      } catch (error) {
        console.error("Authentication initialization error:", error);
        setIsLoggedIn(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      switch (event) {
        case "SIGNED_IN":
          if (session?.user) {
            setIsLoggedIn(true);
            // 既にログイン済みの場合は遷移しない
            if (!isLoggedIn) {
              router.replace("/(tabs)");
            }
          }
          break;
        case "SIGNED_OUT":
          setIsLoggedIn(false);
          router.replace("/(auth)/sign-in");
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // フォントがロードされていない、または認証状態が初期化されていない場合はスプラッシュスクリーンを表示
  if (!loaded || !isInitialized) return <Slot />;

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
