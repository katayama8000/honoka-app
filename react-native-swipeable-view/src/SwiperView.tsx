import type { FC, ReactNode } from "react";
import { useCallback } from "react";
import { Alert, Dimensions, StyleSheet, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

export type SwiperViewProps = {
  children: ReactNode;
  backView?: ReactNode;
  onPress?: () => void;
  onSwipeLeft?: () => void;
  style?: ViewStyle;
  swipeThreshold?: number;
  maxSwipeDistance?: number;
  confirmationTitle?: string;
  confirmationMessage?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  backgroundColor?: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const SwiperView: FC<SwiperViewProps> = ({
  children,
  backView,
  onPress,
  onSwipeLeft,
  style,
  swipeThreshold = -SCREEN_WIDTH * 0.2,
  maxSwipeDistance = -128,
  confirmationTitle = "削除します",
  confirmationMessage = "よろしいですか？",
  confirmButtonText = "はい",
  cancelButtonText = "いいえ",
  backgroundColor = "#FFFFFF",
}) => {
  const translateX = useSharedValue(0);

  const handleSwipeLeft = useCallback(() => {
    Alert.alert(
      confirmationTitle,
      confirmationMessage,
      [
        {
          text: cancelButtonText,
          onPress: () => {
            translateX.value = withTiming(0);
          },
          style: "cancel",
        },
        {
          text: confirmButtonText,
          onPress: () => onSwipeLeft?.(),
        },
      ],
      { cancelable: false },
    );
  }, [confirmationTitle, confirmationMessage, cancelButtonText, confirmButtonText, onSwipeLeft, translateX]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = Math.max(maxSwipeDistance, Math.min(0, event.translationX));
    })
    .onEnd(() => {
      const shouldBeDismissed = translateX.value < swipeThreshold;
      if (shouldBeDismissed) {
        translateX.value = withTiming(-SCREEN_WIDTH, undefined, (finished) => {
          if (finished) {
            handleSwipeLeft();
          }
        });
      } else {
        translateX.value = withTiming(0);
      }
    });

  const facadeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  return (
    <Animated.View style={[styles.container, style]} onTouchEnd={() => onPress?.()}>
      {backView && <Animated.View style={styles.backView}>{backView}</Animated.View>}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.content, facadeStyle, { backgroundColor }]}>{children}</Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  backView: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    width: "100%",
  },
});
