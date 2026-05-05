import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ScreenBackground from '@/components/ScreenBackground';

if (Platform.OS !== 'web') {
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

export default function Layout() {
  const [startupPhase, setStartupPhase] = useState<'splash' | 'app'>('splash');
  const splashOpacity = useState(() => new Animated.Value(1))[0];
  const appOpacity = useState(() => new Animated.Value(0))[0];

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

  if (startupPhase === 'splash') {
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
    <Animated.View style={[styles.screen, { opacity: appOpacity }]}>
      <Tabs
        screenOptions={{
          animation: 'shift',
          headerShown: false,
          tabBarActiveTintColor: '#00AEEF',
          tabBarInactiveTintColor: '#7D9AAA',
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            borderTopWidth: 0,
            elevation: 10,
            height: 64,
            paddingTop: 8,
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
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="statistics"
          options={{
            title: 'Statistics',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="support"
          options={{
            href: null,
            title: 'Support',
          }}
        />
      </Tabs>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
