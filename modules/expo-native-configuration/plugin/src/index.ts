import { withInfoPlist, withAndroidManifest, AndroidConfig, type ConfigPlugin } from "expo/config-plugins";

type Props = {
  apiKey: string;
};

const withMyApiKey: ConfigPlugin<Props> = (config, { apiKey }) => {
  const configWithInfoPlist = withInfoPlist(config, (config) => {
    config.modResults.MY_CUSTOM_API_KEY = apiKey;
    return config;
  });

  const configWithAndroidManifest = withAndroidManifest(configWithInfoPlist, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(mainApplication, "MY_CUSTOM_API_KEY", apiKey);
    return config;
  });

  return configWithAndroidManifest;
};

export default withMyApiKey;
