import type { ExpoConfig } from "expo/config";
import type { WithAndroidWidgetsParams } from "react-native-android-widget";
import { version } from "./package.json";

const allAppEnvs = ["production", "preview", "development"] as const;
type AppEnv = (typeof allAppEnvs)[number];

type Theme = "purple" | "autumn";
const CURRENT_THEME: Theme = "purple";

const themeColors = {
  purple: {
    primaryColor: "#9575CD",
  },
  autumn: {
    primaryColor: "#D2691E",
  },
} as const;

const primaryColor = themeColors[CURRENT_THEME].primaryColor;

const envConfigs: Record<AppEnv, { bundleId: string; googleServicesJson: string; name: string; package: string }> = {
  production: {
    bundleId: "com.katayama9000.householdaccountbook",
    googleServicesJson: "./google-services-prd.json",
    name: "もうふといくら",
    package: "com.katayama9000.householdaccountbook",
  },
  preview: {
    bundleId: "com.katayama9000.householdaccountbook.dev",
    googleServicesJson: "./google-services-dev.json",
    name: "(pre)もうふといくら",
    package: "com.katayama9000.householdaccountbook.dev",
  },
  development: {
    bundleId: "com.katayama9000.householdaccountbook.dev",
    googleServicesJson: "./google-services-dev.json",
    name: "(dev)もうふといくら",
    package: "com.katayama9000.householdaccountbook.dev",
  },
};

const isAppEnv = (s: string): s is AppEnv => allAppEnvs.includes(s as AppEnv);

const appEnv = (process.env.APP_ENV ?? "development") as AppEnv;

if (!isAppEnv(appEnv)) throw new Error(`unsupported APP_ENV: ${appEnv}`);

const widgetConfig: WithAndroidWidgetsParams = {
  widgets: [
    {
      name: "Hello",
      label: "Hello Widget",
      minWidth: "320dp",
      minHeight: "120dp",
      targetCellWidth: 5,
      targetCellHeight: 2,
      description: "A simple Hello widget for Honoka App",
      updatePeriodMillis: 0,
    },
  ],
};

export default (): ExpoConfig => {
  const { bundleId, googleServicesJson, package: packageName, name: appName } = envConfigs[appEnv];

  return {
    name: appName,
    slug: "household-account-book",
    orientation: "portrait",
    icon: "./assets/images/moufu_n_ikura.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    version: version,
    splash: {
      image: "./assets/images/splash_cat.png",
      resizeMode: "cover",
      backgroundColor: primaryColor,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: bundleId,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/splash_cat.png",
        backgroundColor: primaryColor,
      },
      splash: {
        image: "./assets/images/splash_cat.png",
        resizeMode: "cover",
        backgroundColor: primaryColor,
      },
      package: packageName,
      googleServicesFile: googleServicesJson,
    },
    web: {
      bundler: "metro",
      output: "server",
      favicon: "./assets/images/moufu.png",
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-web-browser",
      "expo-sqlite",
      "expo-background-task",
      [
        "expo-notifications",
        {
          icon: "./assets/images/ikura.jpg",
          color: primaryColor,
          defaultChannel: "default",
          sounds: ["./assets/sounds/cat.wav"],
          enableBackgroundRemoteNotifications: false,
        },
      ],
      [
        "./modules/expo-native-configuration/app.plugin.js",
        {
          apiKey: `honoka_dev_api_key_${appEnv}_${version}`,
        },
      ],
      ["react-native-android-widget", widgetConfig],
    ],
    updates: {
      url: "https://u.expo.dev/018a6711-ac8c-41b8-830c-279089162afa",
    },
    runtimeVersion: version,
    experiments: {
      typedRoutes: true,
      buildCacheProvider: "eas",
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "018a6711-ac8c-41b8-830c-279089162afa",
      },
      PUSH_NOTIFICATION_API_KEY: process.env.PUSH_NOTIFICATION_API_KEY,
    },
    owner: "katayama9000",
  };
};
