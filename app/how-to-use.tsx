import { router, useFocusEffect } from 'expo-router';
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

const sections = [
  {
    title: 'Profile',
    text: 'Set weight, gender, activity level, and optional age.',
  },
  {
    title: 'Home',
    text: 'Choose or type water amount and press Add water.',
  },
  {
    title: 'Statistics',
    text: 'Review daily, weekly, monthly, yearly, and all-time progress.',
  },
  {
    title: 'Settings',
    text: 'Manage reminders, clear data, and access support/info pages.',
  },
];

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

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <InfoButton label="Back" onPress={handleBackPress} />

          <Animated.View style={[styles.card, entranceAnimatedStyle]}>
            <Text style={styles.title}>How to use</Text>
            <Text style={styles.bodyText}>
              Use this app to track your daily water intake, set your profile
              information, view your daily progress, check statistics, and
              enable optional water reminder notifications.
              {'\n\n'}
              The app helps you stay aware of your hydration habits, but it
              should not replace professional medical advice.
            </Text>

            <View style={styles.sectionList}>
              {sections.map((section) => (
                <View key={section.title} style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionText}>{section.text}</Text>
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
    backgroundColor: '#00AEEF',
    borderRadius: 18,
    elevation: 4,
    minHeight: 50,
    paddingHorizontal: 24,
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
    fontWeight: '700',
    letterSpacing: 0,
    textAlign: 'center',
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    elevation: 2,
    minHeight: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#6CAFD0',
    shadowOpacity: 0.12,
  },
  secondaryButtonText: {
    color: '#24566A',
    fontSize: 15,
  },
});
