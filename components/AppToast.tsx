import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AppToastProps = {
  id: number;
  isRtl?: boolean;
  message: string;
  onHide: () => void;
};

const toastDurationMs = 1700;

export default function AppToast({
  id,
  isRtl = false,
  message,
  onHide,
}: AppToastProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const onHideRef = useRef(onHide);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const [renderedMessage, setRenderedMessage] = useState(message);

  useEffect(() => {
    onHideRef.current = onHide;
  }, [onHide]);

  useEffect(() => {
    if (!message) {
      if (renderedMessage) {
        Animated.parallel([
          Animated.timing(opacity, {
            duration: 140,
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            duration: 140,
            toValue: 12,
            useNativeDriver: true,
          }),
        ]).start(() => setRenderedMessage(''));
      }

      return;
    }

    setRenderedMessage(message.replace(/^\u2713\s*/, ''));
    opacity.setValue(0);
    translateY.setValue(12);

    const hideTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          duration: 180,
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          duration: 180,
          toValue: 12,
          useNativeDriver: true,
        }),
      ]).start(() => onHideRef.current());
    }, toastDurationMs);

    Animated.parallel([
      Animated.timing(opacity, {
        duration: 180,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        duration: 180,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();

    return () => clearTimeout(hideTimer);
  }, [id, message, opacity, renderedMessage, translateY]);

  if (!message && !renderedMessage) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[
        styles.overlay,
        {
          bottom: insets.bottom + 88,
          paddingHorizontal: 20,
          width,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.toast,
          isRtl && styles.rtlToast,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={[styles.iconCircle, isRtl && styles.rtlIconCircle]}>
          <Ionicons name="checkmark" color="#00AEEF" size={18} />
        </View>
        <Text
          numberOfLines={2}
          style={[styles.message, isRtl && styles.rtlMessage]}
        >
          {renderedMessage}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 20,
  },
  toast: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderColor: '#CDEFFB',
    borderRadius: 999,
    borderWidth: 1,
    elevation: 7,
    flexDirection: 'row',
    maxWidth: 420,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#6CAFD0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  rtlToast: {
    flexDirection: 'row-reverse',
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: '#EAF8FF',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    marginRight: 10,
    width: 28,
  },
  rtlIconCircle: {
    marginLeft: 10,
    marginRight: 0,
  },
  message: {
    color: '#173B4A',
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  rtlMessage: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
