import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { Animated, StyleSheet } from 'react-native';

export type WaterBackgroundAnimationRef = {
  trigger: () => void;
};

const WaterBackgroundAnimation = forwardRef<WaterBackgroundAnimationRef>(
  function WaterBackgroundAnimation(_, ref) {
    const animation = useRef(new Animated.Value(0)).current;

    useImperativeHandle(ref, () => ({
      trigger: () => {
        animation.stopAnimation();
        animation.setValue(0);
        Animated.timing(animation, {
          toValue: 1,
          duration: 780,
          useNativeDriver: true,
        }).start();
      },
    }));

    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.wave,
          {
            opacity: animation.interpolate({
              inputRange: [0, 0.18, 0.78, 1],
              outputRange: [0, 0.24, 0.18, 0],
            }),
            transform: [
              {
                translateY: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-360, 760],
                }),
              },
              {
                scaleX: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.08],
                }),
              },
            ],
          },
        ]}
      />
    );
  }
);

const styles = StyleSheet.create({
  wave: {
    position: 'absolute',
    left: -80,
    right: -80,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0, 174, 239, 0.32)',
  },
});

export default WaterBackgroundAnimation;
