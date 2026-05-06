import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenBackground from '@/components/ScreenBackground';
import { appButtonStyles } from '@/constants/buttonStyles';
import {
  hasAcceptedTermsStorageKey,
  useTermsAcceptance,
} from '@/logic/termsAcceptance';

type TermsLink = {
  label: string;
  pathname: '/disclaimer' | '/privacy-policy';
};

const termsLinks: TermsLink[] = [
  { label: 'Disclaimer', pathname: '/disclaimer' },
  { label: 'Privacy Policy', pathname: '/privacy-policy' },
];

export default function TermsScreen() {
  const { showAgreement: shouldShowAgreementImmediately } =
    useLocalSearchParams<{ showAgreement?: string }>();
  const { setHasAcceptedTerms } = useTermsAcceptance();
  const cardAnimation = useRef(new Animated.Value(0)).current;
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

  useEffect(() => {
    if (!showAgreement) {
      cardAnimation.setValue(0);
      return;
    }

    Animated.timing(cardAnimation, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [cardAnimation, showAgreement]);

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

  const cardAnimatedStyle = {
    opacity: cardAnimation,
    transform: [
      {
        translateY: cardAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0],
        }),
      },
      {
        scale: cardAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1],
        }),
      },
    ],
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
            <Text style={styles.splashTitle}>Drink{'\n'}Water</Text>
            {isInitialLoading ? (
              <ActivityIndicator
                color="#00AEEF"
                size="small"
                style={styles.loader}
              />
            ) : (
              <View style={styles.staticLoader} />
            )}
          </View>

          {showAgreement && (
            <Animated.View style={[styles.card, cardAnimatedStyle]}>
              <Text style={styles.question}>
                Do you agree to the app terms?
              </Text>

              <View style={styles.linkRow}>
                {termsLinks.map((link) => (
                  <Pressable
                    key={link.pathname}
                    hitSlop={8}
                    onPress={() => handleTermsLinkPress(link.pathname)}
                  >
                    <Text style={styles.linkText}>{link.label}</Text>
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
                <Text style={styles.buttonText}>I agree</Text>
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
                  I do not agree
                </Text>
              </Pressable>
            </Animated.View>
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
  },
  splashTitle: {
    color: '#00AEEF',
    fontSize: 58,
    fontWeight: '800',
    lineHeight: 62,
    textAlign: 'center',
  },
  loader: {
    marginTop: 24,
  },
  staticLoader: {
    borderColor: '#BDEEFF',
    borderRadius: 9,
    borderTopColor: '#00AEEF',
    borderWidth: 2,
    height: 18,
    marginTop: 24,
    width: 18,
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
