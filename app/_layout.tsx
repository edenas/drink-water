import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, Tabs, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  ViewStyle,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import ScreenBackground from '@/components/ScreenBackground';
import { getNotificationsModule } from '@/logic/notifications';
import {
  hasAcceptedTermsStorageKey,
  TermsAcceptanceContext,
} from '@/logic/termsAcceptance';
import { I18nProvider, useI18n } from '@/logic/i18n';

const Notifications = getNotificationsModule();

if (Notifications !== null) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

function TabsLayout() {
  const { hasLoadedLanguage, t } = useI18n();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;
  const bottomPadding = bottomInset > 0 ? bottomInset : 8;
  const tabBarHeight = 56 + bottomPadding;
  const tabIconTranslateY =
    Platform.OS === 'ios' && bottomInset > 0 ? 5 : 0;
  const tabIconContainerStyle: ViewStyle =
    tabIconTranslateY > 0
      ? { transform: [{ translateY: tabIconTranslateY }] }
      : {};
  const [startupPhase, setStartupPhase] = useState<'splash' | 'app'>('splash');
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [hasCheckedTerms, setHasCheckedTerms] = useState(false);
  const splashOpacity = useState(() => new Animated.Value(1))[0];
  const appOpacity = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    const checkTermsAcceptance = async () => {
      const savedHasAcceptedTerms = await AsyncStorage.getItem(
        hasAcceptedTermsStorageKey
      );

      setHasAcceptedTerms(savedHasAcceptedTerms === 'true');
      setHasCheckedTerms(true);
    };

    checkTermsAcceptance();
  }, []);

  useEffect(() => {
    const startupTimer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start(() => {
        setStartupPhase('app');
        Animated.timing(appOpacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }).start();
      });
    }, 1300);

    return () => clearTimeout(startupTimer);
  }, [appOpacity, splashOpacity]);

  useEffect(() => {
    if (startupPhase !== 'app' || !hasCheckedTerms) {
      return;
    }

    const currentRoute = segments[0];
    const firstLaunchAllowedRoutes = [
      'terms',
      'disclaimer',
      'privacy-policy',
    ];

    if (
      !hasAcceptedTerms &&
      !firstLaunchAllowedRoutes.includes(currentRoute ?? '')
    ) {
      router.replace('/terms');
      return;
    }

    if (hasAcceptedTerms && currentRoute === 'terms') {
      router.replace('/');
    }
  }, [hasAcceptedTerms, hasCheckedTerms, segments, startupPhase]);

  if (startupPhase === 'splash' || !hasCheckedTerms || !hasLoadedLanguage) {
    return (
      <Animated.View style={[styles.screen, { opacity: splashOpacity }]}>
        <ScreenBackground style={styles.splashContainer}>
          <View style={styles.splashContent}>
            <Text style={styles.splashTitle}>Drink{'\n'}Water</Text>
            <ActivityIndicator
              color="#00AEEF"
              size="small"
              style={styles.splashSpinner}
            />
          </View>
        </ScreenBackground>
      </Animated.View>
    );
  }

  return (
    <TermsAcceptanceContext.Provider
      value={{ hasAcceptedTerms, setHasAcceptedTerms }}
    >
      <Animated.View style={[styles.screen, { opacity: appOpacity }]}>
      <Tabs
        screenOptions={{
          animation: 'shift',
          headerShown: false,
          tabBarActiveTintColor: '#00AEEF',
          tabBarInactiveTintColor: '#7D9AAA',
          tabBarShowLabel: false,
          tabBarItemStyle: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: 0,
            paddingTop: 0,
          },
          tabBarStyle: {
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            borderTopWidth: 0,
            elevation: 10,
            height: tabBarHeight,
            paddingBottom: bottomPadding,
            paddingTop: 6,
            shadowColor: '#6CAFD0',
            shadowOffset: {
              width: 0,
              height: -6,
            },
            shadowOpacity: 0.12,
            shadowRadius: 14,
          },
          transitionSpec: {
            animation: 'timing',
            config: {
              duration: 240,
              easing: Easing.out(Easing.cubic),
            },
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('nav.home'),
            tabBarIcon: ({ color, size }) => (
              <View style={tabIconContainerStyle}>
                <Ionicons name="home" color={color} size={size} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="statistics"
          options={{
            title: t('nav.statistics'),
            tabBarIcon: ({ color, size }) => (
              <View style={tabIconContainerStyle}>
                <Ionicons name="stats-chart" color={color} size={size} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('nav.profile'),
            tabBarIcon: ({ color, size }) => (
              <View style={tabIconContainerStyle}>
                <Ionicons name="person" color={color} size={size} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t('nav.settings'),
            tabBarIcon: ({ color, size }) => (
              <View style={tabIconContainerStyle}>
                <Ionicons name="settings" color={color} size={size} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="language"
          options={{
            href: null,
            tabBarStyle: styles.hiddenTabBar,
            title: t('settings.language'),
          }}
        />
        <Tabs.Screen
          name="terms"
          options={{
            href: null,
            title: t('nav.terms'),
            tabBarStyle: styles.hiddenTabBar,
          }}
        />
        <Tabs.Screen
          name="support"
          options={{
            href: null,
            title: t('nav.support'),
          }}
        />
        <Tabs.Screen
          name="disclaimer"
          options={{
            href: null,
            tabBarStyle: styles.hiddenTabBar,
            title: t('nav.disclaimer'),
          }}
        />
        <Tabs.Screen
          name="how-to-use"
          options={{
            href: null,
            tabBarStyle: styles.hiddenTabBar,
            title: t('nav.howToUse'),
          }}
        />
        <Tabs.Screen
          name="privacy-policy"
          options={{
            href: null,
            tabBarStyle: styles.hiddenTabBar,
            title: t('nav.privacyPolicy'),
          }}
        />
      </Tabs>
      </Animated.View>
    </TermsAcceptanceContext.Provider>
  );
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <TabsLayout />
      </I18nProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  hiddenTabBar: {
    display: 'none',
  },
  splashContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  splashSpinner: {
    marginTop: 24,
  },
  splashTitle: {
    color: '#00AEEF',
    fontSize: 58,
    fontWeight: '800',
    lineHeight: 62,
    textAlign: 'center',
  },
});
