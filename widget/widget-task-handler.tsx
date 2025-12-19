import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { HelloWidget } from "./HelloWidget";

const nameToWidget = {
  // Hello will be the **name** with which we will reference our widget.
  Hello: HelloWidget,
};

export const widgetTaskHandler = async (props: WidgetTaskHandlerProps) => {
  const widgetInfo = props.widgetInfo;
  const Widget = nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
      props.renderWidget(<Widget />);
      break;

    case "WIDGET_UPDATE":
      // Update widget if needed
      props.renderWidget(<Widget />);
      break;

    case "WIDGET_RESIZED":
      // Handle widget resize if needed
      props.renderWidget(<Widget />);
      break;

    case "WIDGET_DELETED":
      // Clean up if needed
      break;

    case "WIDGET_CLICK":
      // Handle widget click if needed
      break;

    default:
      break;
  }
};
