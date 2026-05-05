import { router, useFocusEffect } from 'expo-router';
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

export default function PrivacyPolicyScreen() {
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
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.bodyText}>
              Drink Water does not collect, store, or send your personal
              information to any external server.
              {'\n\n'}
              The app does not use an external database, user account system, or
              cloud storage.
              {'\n\n'}
              Any information you enter, such as weight, gender, activity
              level, or optional age, is stored locally on your device only.
              This information is used only inside the app to calculate an
              estimated daily water goal and improve your personal experience.
              {'\n\n'}
              The developer cannot see, access, or collect your personal data.
              {'\n\n'}
              You can use the app without entering personal profile
              information. If you choose not to provide this information, the
              app will use default values.
              {'\n\n'}
              You can clear your profile settings and statistics data at any
              time from the Settings screen.
              {'\n\n'}
              Drink Water is intended for general information and reminder
              purposes only. It is not medical advice, diagnosis, or treatment.
              {'\n\n'}
              By using this app, you understand that you are responsible for
              your own health decisions and for the information you choose to
              enter.
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
