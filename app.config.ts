import type { ConfigContext, ExpoConfig } from "expo/config";
import { version } from "./package.json";

const allAppEnvs = ["production", "development", "local"] as const;
type AppEnv = (typeof allAppEnvs)[number];

const envConfigs: Record<AppEnv, { bundleId: string; googleServicesJson: string; name: string; package: string }> = {
  production: {
    bundleId: "com.katayama9000.householdaccountbook",
    googleServicesJson: "./google-services-prd.json",
    name: "もうふといくら",
    package: "com.katayama9000.householdaccountbook",
  },
  development: {
    bundleId: "com.katayama9000.householdaccountbook.dev",
    googleServicesJson: "./google-services-dev.json",
    name: "(dev)もうふといくら",
    package: "com.katayama9000.householdaccountbook.dev",
  },
  local: {
    bundleId: "com.katayama9000.householdaccountbook.dev",
    googleServicesJson: "./google-services-dev.json",
    name: "(local)もうふといくら",
    package: "com.katayama9000.householdaccountbook.dev",
  },
};

const isAppEnv = (s: string): s is AppEnv => allAppEnvs.includes(s as AppEnv);

const appEnv = (process.env.APP_ENV ?? "local") as AppEnv;

if (!isAppEnv(appEnv)) throw new Error(`unsupported APP_ENV: ${appEnv}`);

export default ({ config }: ConfigContext): ExpoConfig => {
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
      image: "./assets/images/moufu.png",
      resizeMode: "contain",
      backgroundColor: "#336666",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: bundleId,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/moufu_n_ikura.png",
        backgroundColor: "#336666",
      },
      package: packageName,
      versionCode: 23,
      googleServicesFile: googleServicesJson,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/moufu.png",
    },
    plugins: [
      "expo-router",
      "expo-font",
      [
        "expo-notifications",
        {
          icon: "./assets/images/ikura.jpg",
          color: "#336666",
          defaultChannel: "default",
          sounds: ["./assets/sounds/cat.wav"],
          enableBackgroundRemoteNotifications: false,
        },
      ],
    ],
    updates: {
      url: "https://u.expo.dev/018a6711-ac8c-41b8-830c-279089162afa",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "018a6711-ac8c-41b8-830c-279089162afa",
      },
    },
    owner: "katayama9000",
  };
};
