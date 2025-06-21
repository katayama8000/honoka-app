import ExpoNativeConfigurationModule from './src/ExpoNativeConfigurationModule';

export const getApiKey = (): string => {
  return ExpoNativeConfigurationModule.getApiKey();
};
