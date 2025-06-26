import { NativeModule, requireNativeModule } from "expo";

declare class ExpoNativeConfigurationModule extends NativeModule {
  getApiKey(): string;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoNativeConfigurationModule>("ExpoNativeConfiguration");
