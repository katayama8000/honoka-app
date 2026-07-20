// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

import Ionicons from "@react-native-vector-icons/ionicons";
import type { ComponentProps } from "react";

type TabBarIconProps = ComponentProps<typeof Ionicons>;

export const TabBarIcon = ({ style, ...rest }: TabBarIconProps) => {
  return <Ionicons size={28} style={[{ marginBottom: -3 }, style]} {...rest} />;
};
