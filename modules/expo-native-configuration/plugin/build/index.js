"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("expo/config-plugins");
const withMyApiKey = (config, { apiKey }) => {
    const configWithInfoPlist = (0, config_plugins_1.withInfoPlist)(config, (config) => {
        config.modResults.MY_CUSTOM_API_KEY = apiKey;
        return config;
    });
    const configWithAndroidManifest = (0, config_plugins_1.withAndroidManifest)(configWithInfoPlist, (config) => {
        const mainApplication = config_plugins_1.AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
        config_plugins_1.AndroidConfig.Manifest.addMetaDataItemToMainApplication(mainApplication, "MY_CUSTOM_API_KEY", apiKey);
        return config;
    });
    return configWithAndroidManifest;
};
exports.default = withMyApiKey;
