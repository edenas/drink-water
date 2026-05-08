import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnimatedScreenContent from '@/components/AnimatedScreenContent';
import ScreenBackground from '@/components/ScreenBackground';
import { appButtonStyles } from '@/constants/buttonStyles';
import {
  hasAcceptedTermsStorageKey,
  useTermsAcceptance,
} from '@/logic/termsAcceptance';
import { useI18n } from '@/logic/i18n';

type TermsLink = {
  labelKey: 'nav.disclaimer' | 'nav.privacyPolicy';
  pathname: '/disclaimer' | '/privacy-policy';
};

const termsLinks: TermsLink[] = [
  { labelKey: 'nav.disclaimer', pathname: '/disclaimer' },
  { labelKey: 'nav.privacyPolicy', pathname: '/privacy-policy' },
];

export default function TermsScreen() {
  const { isRtl, t } = useI18n();
  const { showAgreement: shouldShowAgreementImmediately } =
    useLocalSearchParams<{ showAgreement?: string }>();
  const { setHasAcceptedTerms } = useTermsAcceptance();
  const shouldSkipInitialLoading = shouldShowAgreementImmediately === 'true';
  const [isInitialLoading, setIsInitialLoading] = useState(
    !shouldSkipInitialLoading
  );
  const [showAgreement, setShowAgreement] = useState(shouldSkipInitialLoading);

  useEffect(() => {
    if (shouldSkipInitialLoading) {
      setIsInitialLoading(false);
      setShowAgreement(true);
      return;
    }

    const loadingTimer = setTimeout(() => {
      setIsInitialLoading(false);
      setShowAgreement(true);
    }, 900);

    return () => clearTimeout(loadingTimer);
  }, [shouldSkipInitialLoading]);

  const handleAgreePress = async () => {
    await AsyncStorage.setItem(hasAcceptedTermsStorageKey, 'true');
    setHasAcceptedTerms(true);
    router.replace('/');
  };

  const handleDeclinePress = () => {
    setShowAgreement(false);
  };

  const handleSplashPress = () => {
    if (!isInitialLoading && !showAgreement) {
      setShowAgreement(true);
    }
  };

  const handleTermsLinkPress = (pathname: TermsLink['pathname']) => {
    router.push(`${pathname}?source=firstLaunch`);
  };

  return (
    <ScreenBackground style={styles.background}>
      <SafeAreaView style={styles.container}>
        <View style={styles.pressableArea}>
          {!isInitialLoading && !showAgreement && (
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={handleSplashPress}
            />
          )}

          <View style={styles.logoGroup}>
            <Image
              source={require('../assets/images/splash-logo.png')}
              resizeMode="contain"
              style={styles.splashLogo}
            />
            {isInitialLoading ? (
              <ActivityIndicator
                color="#00AEEF"
                size="small"
                style={styles.loader}
              />
            ) : (
              <View style={styles.loaderSpacer} />
            )}
          </View>

          {showAgreement && (
            <AnimatedScreenContent
              duration={320}
              fill={false}
              style={styles.card}
              translateY={12}
            >
              <Text style={[styles.question, isRtl && styles.rtlText]}>
                {t('terms.question')}
              </Text>

              <View style={[styles.linkRow, isRtl && styles.rtlRow]}>
                {termsLinks.map((link) => (
                  <Pressable
                    key={link.pathname}
                    hitSlop={8}
                    onPress={() => handleTermsLinkPress(link.pathname)}
                  >
                    <Text style={[styles.linkText, isRtl && styles.rtlText]}>
                      {t(link.labelKey)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleAgreePress}
              >
                <Text style={styles.buttonText}>{t('terms.agree')}</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleDeclinePress}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  {t('terms.disagree')}
                </Text>
              </Pressable>
            </AnimatedScreenContent>
          )}
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
  },
  pressableArea: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoGroup: {
    alignItems: 'center',
    paddingHorizontal: 36,
    width: '100%',
  },
  splashLogo: {
    height: 220,
    maxWidth: 420,
    width: '82%',
  },
  loader: {
    marginTop: 28,
  },
  loaderSpacer: {
    height: 18,
    marginTop: 28,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    elevation: 5,
    marginTop: 36,
    maxWidth: 420,
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: '#6CAFD0',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    width: '100%',
  },
  question: {
    color: '#173B4A',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    textAlign: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
    marginTop: 18,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    writingDirection: 'rtl',
  },
  linkText: {
    color: '#007FB1',
    fontSize: 15,
    fontWeight: '700',
  },
  button: {
    ...appButtonStyles.primaryButton,
  },
  buttonPressed: {
    ...appButtonStyles.primaryButtonPressed,
  },
  buttonText: {
    ...appButtonStyles.primaryButtonText,
  },
  secondaryButton: {
    ...appButtonStyles.secondaryButton,
    alignSelf: 'stretch',
    height: 52,
    marginTop: 12,
  },
  secondaryButtonText: {
    ...appButtonStyles.secondaryButtonText,
  },
});
