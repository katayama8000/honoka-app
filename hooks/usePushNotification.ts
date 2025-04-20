import Constants from "expo-constants";
import { isDevice } from "expo-device";
import {
  AndroidImportance,
  getExpoPushTokenAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  removeNotificationSubscription,
  Notification,
  NotificationResponse,
} from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform, Linking } from "react-native";
import { router } from "expo-router";

const handleRegistrationError = (errorMessage: string) => {
  alert(errorMessage);
  throw new Error(errorMessage);
};

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const usePushNotification = () => {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // listen for incoming notifications
    notificationListener.current = addNotificationReceivedListener((notification: Notification) => {
      console.log('通知を受信しました:', notification);
    });

    // listen for notification response (when user taps on the notification)
    responseListener.current = addNotificationResponseReceivedListener(handleNotificationResponse);

    // cleanup function to remove listeners
    return () => {
      if (notificationListener.current) {
        removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const openWiFiSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('App-Prefs:root=WIFI');
      } else if (Platform.OS === 'android') {
        await Linking.openSettings();
        // await Linking.openURL('android.settings.WIFI_SETTINGS');
      }
    } catch (error) {
      console.error('WiFi設定を開けませんでした:', error);
    }
  };

  const handleNotificationResponse = (response: NotificationResponse) => {
    const data = response.notification.request.content.data;
    console.log('通知がタップされました:', data);
    
    if (data.type === 'invoice') {
      router.push({
        pathname: '/past-invoice-details',
        params: { id: data.invoiceId }
      });
    } else if (data.type === 'payment') {
      router.push({
        pathname: '/(modal)/payment-modal',
        params: { id: data.paymentId }
      });
    } else if (data.type === 'wifi-settings') {
      openWiFiSettings();
    } else {
      // default action
      router.push('/(tabs)');
    }
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
      if (finalStatus !== "granted") {
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
      } catch (e: unknown) {
        handleRegistrationError(`${e}`);
      }
    } else {
      handleRegistrationError("Must use physical device for push notifications");
    }
  };

  return { 
    registerForPushNotificationsAsync,
    handleNotificationResponse,
    openWiFiSettings
  };
};
