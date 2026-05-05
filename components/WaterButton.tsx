import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import { appButtonStyles } from '@/constants/buttonStyles';

type WaterButtonProps = {
  onPress: () => void;
  label: string;
};

export default function WaterButton({ onPress, label }: WaterButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateScale = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={onPress}
        onPressIn={() => animateScale(0.97)}
        onPressOut={() => animateScale(1)}
      >
        <Text style={styles.buttonText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    ...appButtonStyles.primaryButton,
  },
  buttonPressed: {
    ...appButtonStyles.primaryButtonPressed,
  },
  buttonText: {
    ...appButtonStyles.primaryButtonText,
  },
});
