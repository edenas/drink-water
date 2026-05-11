import { useFocusEffect } from 'expo-router';
import { ReactNode, useCallback, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

const visibleStartOpacity = 0.45;

type AnimatedScreenContentProps = {
  children: ReactNode;
  duration?: number;
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
  translateY?: number;
};

export default function AnimatedScreenContent({
  children,
  duration = 360,
  fill = true,
  style,
  translateY = 10,
}: AnimatedScreenContentProps) {
  const entranceAnimation = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      let hasCompleted = false;
      const fallbackTimer = setTimeout(() => {
        if (!hasCompleted) {
          entranceAnimation.stopAnimation();
          entranceAnimation.setValue(1);
        }
      }, duration + 180);

      entranceAnimation.stopAnimation();
      entranceAnimation.setValue(visibleStartOpacity);
      Animated.timing(entranceAnimation, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        hasCompleted = true;

        if (!finished) {
          entranceAnimation.setValue(1);
        }
      });

      return () => {
        clearTimeout(fallbackTimer);
        entranceAnimation.stopAnimation(() => {
          entranceAnimation.setValue(1);
        });
      };
    }, [duration, entranceAnimation])
  );

  const animatedStyle = {
    opacity: entranceAnimation,
    transform: [
      {
        translateY: entranceAnimation.interpolate({
          inputRange: [visibleStartOpacity, 1],
          outputRange: [translateY, 0],
          extrapolate: 'clamp',
        }),
      },
      {
        scale: entranceAnimation.interpolate({
          inputRange: [visibleStartOpacity, 1],
          outputRange: [0.97, 1],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  return (
    <Animated.View style={[fill && styles.content, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: '100%',
  },
});
