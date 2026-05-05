import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import {
  Animated,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenBackground from '@/components/ScreenBackground';
import { appButtonStyles } from '@/constants/buttonStyles';

const kofiUrl = 'https://ko-fi.com/edenaspocius';

type SupportButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

function SupportButton({
  label,
  onPress,
  variant = 'primary',
}: SupportButtonProps) {
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isSecondary && styles.secondaryButton,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <Text
        style={[styles.buttonText, isSecondary && styles.secondaryButtonText]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function SupportScreen() {
  const entranceAnimation = useRef(new Animated.Value(0)).current;

  const handleBackPress = () => {
    router.replace('/settings');
  };

  useFocusEffect(
    useCallback(() => {
      entranceAnimation.setValue(0);
      Animated.timing(entranceAnimation, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }).start();
    }, [entranceAnimation])
  );

  const entranceAnimatedStyle = {
    opacity: entranceAnimation,
    transform: [
      {
        translateY: entranceAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
      {
        scale: entranceAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.97, 1],
        }),
      },
    ],
  };

  const openKofi = () => {
    Linking.openURL(kofiUrl);
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <SupportButton
            label="Back"
            onPress={handleBackPress}
            variant="secondary"
          />

          <Animated.View style={[styles.card, entranceAnimatedStyle]}>
            <Image
              source={require('../assets/kofi_logo.png')}
              resizeMode="contain"
              style={styles.kofiLogo}
            />
            <Text style={styles.title}>Support this app</Text>
            <Text style={styles.message}>
              If you enjoy using Drink Water, you can support the developer and
              help improve the app.
            </Text>
            <Text style={styles.smallLine}>
              Every coffee helps
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.kofiButton,
                pressed && styles.kofiButtonPressed,
              ]}
              onPress={openKofi}
            >
              <Image
                source={require('../assets/support_me_on_kofi_beige.png')}
                resizeMode="contain"
                style={styles.kofiButtonImage}
              />
            </Pressable>
            <Text style={styles.trustText}>Secure payment via Ko-fi</Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 80,
  },
  card: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 28,
    elevation: 4,
    marginTop: 18,
    padding: 24,
    shadowColor: '#6CAFD0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.14,
    shadowRadius: 18,
  },
  kofiLogo: {
    height: 56,
    marginBottom: 16,
    maxWidth: 220,
    width: '62%',
  },
  title: {
    color: '#173B4A',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 14,
    textAlign: 'center',
  },
  message: {
    color: '#24566A',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
  },
  smallLine: {
    color: '#007FB1',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  kofiButton: {
    alignItems: 'center',
    alignSelf: 'center',
    height: 72,
    justifyContent: 'center',
    marginTop: 14,
    maxWidth: 320,
    width: '100%',
  },
  kofiButtonImage: {
    height: 72,
    maxWidth: 320,
    width: '100%',
  },
  kofiButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  trustText: {
    color: '#5E7886',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  button: {
    ...appButtonStyles.primaryButton,
    paddingHorizontal: 24,
    width: '100%',
  },
  buttonPressed: {
    ...appButtonStyles.primaryButtonPressed,
  },
  buttonText: {
    ...appButtonStyles.primaryButtonText,
  },
  secondaryButton: {
    ...appButtonStyles.secondaryButton,
    width: 'auto',
  },
  secondaryButtonText: {
    ...appButtonStyles.secondaryButtonText,
  },
});
