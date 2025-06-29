import Constants from "expo-constants";
import { isDevice } from "expo-device";
import {
  AndroidImportance,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  getExpoPushTokenAsync,
  getPermissionsAsync,
  type Notification,
  type NotificationResponse,
  requestPermissionsAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
} from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

const handleRegistrationError = (errorMessage: string) => {
  console.error(errorMessage);
  alert(errorMessage);
  if (Platform.OS !== "web") {
    throw new Error(errorMessage);
  }
};

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const usePushNotification = () => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const notificationListener = addNotificationReceivedListener((notification: Notification) => {
      console.log("通知を受信しました:", notification);
    });
    const responseListener = addNotificationResponseReceivedListener(handleNotificationResponse);

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  const handleNotificationResponse = (_: NotificationResponse) => {
    router.push("/(tabs)");
  };

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === "android") {
      setNotificationChannelAsync("default", {
        name: "default",
        importance: AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (isDevice) {
      const { status: existingStatus } = await getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted" && Platform.OS !== "web") {
        handleRegistrationError("Permission not granted to get push token for push notification!");
        return;
      }
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        handleRegistrationError("Project ID not found");
      }
      try {
        return (
          await getExpoPushTokenAsync({
            projectId,
          })
        ).data;
      } catch (e) {
        handleRegistrationError(`${e}`);
      }
    } else {
      handleRegistrationError("Must use physical device for push notifications");
    }
  };

  return {
    registerForPushNotificationsAsync,
    handleNotificationResponse,
  };
};
