import { FlexWidget, TextWidget } from "react-native-android-widget";

export const HelloWidget = () => {
  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 16,
      }}
    >
      <TextWidget
        text="Hello Widget!"
        style={{
          fontSize: 24,
          color: "#000000",
          fontWeight: "bold",
        }}
      />
      <TextWidget
        text="Honoka App"
        style={{
          fontSize: 16,
          color: "#666666",
          marginTop: 8,
        }}
      />
    </FlexWidget>
  );
};
