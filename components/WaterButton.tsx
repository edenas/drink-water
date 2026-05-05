import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

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
    backgroundColor: '#00AEEF',
    borderRadius: 18,
    elevation: 4,
    marginTop: 18,
    minHeight: 50,
    paddingHorizontal: 28,
    paddingVertical: 14,
    shadowColor: '#0087BD',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  buttonPressed: {
    backgroundColor: '#009DD8',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0,
    textAlign: 'center',
  },
});
