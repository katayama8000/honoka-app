import { type ConfigPlugin } from "expo/config-plugins";
type Props = {
    apiKey: string;
};
declare const withMyApiKey: ConfigPlugin<Props>;
export default withMyApiKey;
