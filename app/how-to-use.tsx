import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenBackground from '@/components/ScreenBackground';
import { appButtonStyles } from '@/constants/buttonStyles';
import { useI18n } from '@/logic/i18n';

const sections = [
  {
    titleKey: 'profile.title',
    textKey: 'how.profileText',
  },
  {
    titleKey: 'nav.home',
    textKey: 'how.homeText',
  },
  {
    titleKey: 'statistics.title',
    textKey: 'how.statisticsText',
  },
  {
    titleKey: 'settings.title',
    textKey: 'how.settingsText',
  },
] as const;

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

export default function HowToUseScreen() {
  const { t } = useI18n();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const entranceAnimation = useRef(new Animated.Value(0)).current;

  const handleBackPress = () => {
    if (source === 'firstLaunch') {
      router.replace({
        pathname: '/terms',
        params: { showAgreement: 'true' },
      });
      return;
    }

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

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <InfoButton label={t('back')} onPress={handleBackPress} />

          <Animated.View style={[styles.card, entranceAnimatedStyle]}>
            <Text style={styles.title}>{t('how.title')}</Text>
            <Text style={styles.bodyText}>{t('how.body')}</Text>

            <View style={styles.sectionList}>
              {sections.map((section) => (
                <View key={section.titleKey} style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>
                    {t(section.titleKey)}
                  </Text>
                  <Text style={styles.sectionText}>{t(section.textKey)}</Text>
                </View>
              ))}
            </View>
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
  sectionList: {
    gap: 12,
    marginTop: 22,
  },
  infoSection: {
    backgroundColor: '#F4FBFF',
    borderColor: '#D4EEF8',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionTitle: {
    color: '#173B4A',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionText: {
    color: '#5E7886',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
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
