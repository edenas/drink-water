import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenBackground from '@/components/ScreenBackground';
import { appButtonStyles } from '@/constants/buttonStyles';
import { useI18n } from '@/logic/i18n';

function InfoButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styles.secondaryButton,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, styles.secondaryButtonText]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function DisclaimerScreen() {
  const { isRtl, t } = useI18n();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const entranceAnimation = useRef(new Animated.Value(0)).current;

  const handleBackPress = () => {
    if (source === 'settings') {
      router.replace('/settings');
      return;
    }

    router.replace('/terms?showAgreement=true');
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

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <InfoButton label={t('back')} onPress={handleBackPress} />

          <Animated.View style={[styles.card, entranceAnimatedStyle]}>
            <Text style={[styles.title, isRtl && styles.rtlText]}>
              {t('disclaimer.title')}
            </Text>
            <Text style={[styles.bodyText, isRtl && styles.rtlText]}>
              {t('disclaimer.body')}
            </Text>
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
    padding: 20,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 24,
    elevation: 4,
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 28,
    shadowColor: '#6CAFD0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.14,
    shadowRadius: 18,
  },
  title: {
    color: '#173B4A',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 18,
  },
  bodyText: {
    color: '#24566A',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  button: {
    ...appButtonStyles.primaryButton,
    marginTop: 0,
    paddingHorizontal: 24,
  },
  buttonPressed: {
    ...appButtonStyles.primaryButtonPressed,
  },
  buttonText: {
    ...appButtonStyles.primaryButtonText,
  },
  secondaryButton: {
    ...appButtonStyles.secondaryButton,
  },
  secondaryButtonText: {
    ...appButtonStyles.secondaryButtonText,
  },
});
