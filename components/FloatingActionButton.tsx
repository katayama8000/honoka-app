import { Colors } from "@/constants/Colors";
import { defaultShadowColor } from "@/style/defaultStyle";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import type { ComponentProps, FC } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

type BaseProps = {
  onPress: () => void;
  position: "bottomRight" | "bottomLeft";
  color?: string;
};

type AntDesignProps = BaseProps & {
  iconFamily?: "AntDesign";
  iconName: ComponentProps<typeof AntDesign>["name"];
};

type IoniconsProps = BaseProps & {
  iconFamily: "Ionicons";
  iconName: ComponentProps<typeof Ionicons>["name"];
};

type Props = AntDesignProps | IoniconsProps;

export const FloatingActionButton: FC<Props> = ({
  onPress,
  position,
  color = Colors.primary,
  iconFamily,
  iconName,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.floatingButton,
        position === "bottomRight" ? styles.bottomRight : styles.bottomLeft,
        { backgroundColor: color },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {iconFamily === "Ionicons" ? (
        <Ionicons name={iconName} size={24} color="white" />
      ) : (
        <AntDesign name={iconName} size={24} color="white" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: defaultShadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomRight: {
    right: 20,
  },
  bottomLeft: {
    left: 20,
  },
});
