import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Keyboard,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenBackground from '@/components/ScreenBackground';
import WaterBackgroundAnimation, {
  WaterBackgroundAnimationRef,
} from '@/components/WaterBackgroundAnimation';
import { appButtonStyles } from '@/constants/buttonStyles';
import {
  canUseLocalNotifications,
  getNotificationsModule,
} from '@/logic/notifications';

const weightStorageKey = 'weight';
const ageStorageKey = 'age';
const genderStorageKey = 'gender';
const activityLevelStorageKey = 'activityLevel';
const waterAmountStorageKey = 'waterAmount';
const allTimeWaterAmountStorageKey = 'allTimeWaterAmount';
const waterHistoryStorageKey = 'waterHistory';
const hourlyWaterHistoryStorageKey = 'hourlyWaterHistory';
const lastSavedDateStorageKey = 'lastSavedDate';
const notificationsEnabledStorageKey = 'notificationsEnabled';
const notificationHoursStorageKey = 'notificationHours';
const notificationMinutesStorageKey = 'notificationMinutes';
const kofiUrl = 'https://ko-fi.com/edenaspocius';

type SettingsButtonProps = {
  label: string;
  onPress: () => void;
};

function SettingsButton({ label, onPress }: SettingsButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationHours, setNotificationHours] = useState('1');
  const [notificationMinutes, setNotificationMinutes] = useState('0');
  const [saveMessage, setSaveMessage] = useState('');
  const entranceAnimation = useRef(new Animated.Value(0)).current;
  const waterAnimationRef = useRef<WaterBackgroundAnimationRef>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const savedNotificationsEnabled = await AsyncStorage.getItem(
        notificationsEnabledStorageKey
      );
      const savedNotificationHours = await AsyncStorage.getItem(
        notificationHoursStorageKey
      );
      const savedNotificationMinutes = await AsyncStorage.getItem(
        notificationMinutesStorageKey
      );

      if (savedNotificationsEnabled !== null) {
        setNotificationsEnabled(savedNotificationsEnabled === 'true');
      }

      if (savedNotificationHours !== null) {
        setNotificationHours(savedNotificationHours);
      }

      if (savedNotificationMinutes !== null) {
        setNotificationMinutes(savedNotificationMinutes);
      }
    };

    loadSettings();
  }, []);

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

  const handleNotificationHoursChange = (value: string) => {
    setNotificationHours(value.replace(/\D/g, ''));
  };

  const handleNotificationMinutesChange = (value: string) => {
    setNotificationMinutes(value.replace(/\D/g, ''));
  };

  const getNotificationIntervalSeconds = () => {
    const hours = Number(notificationHours) || 0;
    const minutes = Number(notificationMinutes) || 0;

    return hours * 60 * 60 + minutes * 60;
  };

  const scheduleNotifications = async () => {
    const intervalSeconds = getNotificationIntervalSeconds();

    if (intervalSeconds < 60) {
      setSaveMessage('Use at least 1 minute');
      return false;
    }

    if (!canUseLocalNotifications) {
      return true;
    }

    const Notifications = getNotificationsModule();

    if (Notifications === null) {
      return true;
    }

    const permission = await Notifications.requestPermissionsAsync();

    if (!permission.granted) {
      setSaveMessage('Notifications permission denied');
      return false;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Drink Water',
        body: 'Time to drink some water.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: intervalSeconds,
        repeats: true,
      },
    });

    return true;
  };

  const handleNotificationsEnabledChange = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem(notificationsEnabledStorageKey, String(value));

    if (!value) {
      const Notifications = getNotificationsModule();

      if (Notifications !== null) {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
      setSaveMessage('\u2713 Water reminder disabled');
    }
  };

  const handleSaveNotifications = async () => {
    waterAnimationRef.current?.trigger();
    Keyboard.dismiss();

    await AsyncStorage.setItem(
      notificationsEnabledStorageKey,
      String(notificationsEnabled)
    );
    await AsyncStorage.setItem(notificationHoursStorageKey, notificationHours);
    await AsyncStorage.setItem(
      notificationMinutesStorageKey,
      notificationMinutes
    );

    if (!notificationsEnabled) {
      const Notifications = getNotificationsModule();

      if (Notifications !== null) {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
      setSaveMessage('\u2713 Water reminder saved');
      return;
    }

    const didSchedule = await scheduleNotifications();

    if (didSchedule) {
      setSaveMessage('\u2713 Water reminder saved');
    }
  };

  const handleClearUserSettings = async () => {
    waterAnimationRef.current?.trigger();
    Keyboard.dismiss();

    await AsyncStorage.multiRemove([
      weightStorageKey,
      ageStorageKey,
      genderStorageKey,
      activityLevelStorageKey,
    ]);

    setSaveMessage('\u2713 Settings cleared');
  };

  const handleClearStatistics = async () => {
    waterAnimationRef.current?.trigger();
    Keyboard.dismiss();

    await AsyncStorage.multiRemove([
      waterAmountStorageKey,
      allTimeWaterAmountStorageKey,
      waterHistoryStorageKey,
      hourlyWaterHistoryStorageKey,
      lastSavedDateStorageKey,
    ]);

    setSaveMessage('\u2713 Statistics cleared');
  };

  const handleSupportPress = () => {
    Linking.openURL(kofiUrl);
  };

  const handleDisclaimerPress = () => {
    router.push('/disclaimer');
  };

  const handleHowToUsePress = () => {
    router.push('/how-to-use');
  };

  const handlePrivacyPolicyPress = () => {
    router.push('/privacy-policy');
  };

  return (
    <ScreenBackground>
      <WaterBackgroundAnimation ref={waterAnimationRef} />
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          <Text style={styles.title}>Settings</Text>

          <Animated.View style={[styles.card, entranceAnimatedStyle]}>
            <Text style={styles.sectionLabel}>Water reminder</Text>
            <View style={styles.reminderToggleRow}>
              <Text style={styles.reminderLabel}>
                Remind me to drink water
              </Text>
              <Switch
                trackColor={{ false: '#D8E3EA', true: '#00AEEF' }}
                thumbColor="#ffffff"
                value={notificationsEnabled}
                onValueChange={handleNotificationsEnabledChange}
              />
            </View>
            <View style={styles.reminderInputs}>
              <View style={styles.reminderInputGroup}>
                <Text style={styles.reminderInputLabel}>Hours</Text>
                <TextInput
                  style={[styles.input, styles.reminderInput]}
                  keyboardType="numeric"
                  value={notificationHours}
                  onChangeText={handleNotificationHoursChange}
                  placeholder="1"
                  placeholderTextColor="#8AA7B6"
                />
              </View>
              <View style={styles.reminderInputGroup}>
                <Text style={styles.reminderInputLabel}>Minutes</Text>
                <TextInput
                  style={[styles.input, styles.reminderInput]}
                  keyboardType="numeric"
                  value={notificationMinutes}
                  onChangeText={handleNotificationMinutesChange}
                  placeholder="30"
                  placeholderTextColor="#8AA7B6"
                />
              </View>
            </View>
            <SettingsButton
              label="Save"
              onPress={handleSaveNotifications}
            />
          </Animated.View>

          <Animated.View style={[styles.card, entranceAnimatedStyle]}>
            <Text style={styles.sectionLabel}>Statistics data</Text>
            <SettingsButton
              label="Clear statistics"
              onPress={handleClearStatistics}
            />
          </Animated.View>

          <Animated.View style={[styles.card, entranceAnimatedStyle]}>
            <Text style={styles.sectionLabel}>User settings</Text>
            <SettingsButton
              label="Clear user settings"
              onPress={handleClearUserSettings}
            />
          </Animated.View>

          <Text style={styles.saveMessage}>{saveMessage}</Text>

          <Animated.View style={[styles.card, entranceAnimatedStyle]}>
            <Text style={styles.sectionLabel}>App information</Text>
            <SettingsButton
              label="Disclaimer"
              onPress={handleDisclaimerPress}
            />
            <SettingsButton
              label="How to use"
              onPress={handleHowToUsePress}
            />
            <SettingsButton
              label="Privacy Policy"
              onPress={handlePrivacyPolicyPress}
            />
          </Animated.View>

          <Animated.View
            style={[styles.card, styles.donationCard, entranceAnimatedStyle]}
          >
            <Image
              source={require('../assets/kofi_logo.png')}
              resizeMode="contain"
              style={styles.kofiLogo}
            />
            <Text style={styles.supportTitle}>Support this app</Text>
            <Text style={styles.supportMessage}>
              If you enjoy using Drink Water, you can support the developer and
              help improve the app.
            </Text>
            <Text style={styles.supportHighlight}>Every coffee helps</Text>
            <Pressable
              style={({ pressed }) => [
                styles.kofiButton,
                pressed && styles.kofiButtonPressed,
              ]}
              onPress={handleSupportPress}
            >
              <Image
                source={require('../assets/support_me_on_kofi_beige.png')}
                resizeMode="contain"
                style={styles.kofiButtonImage}
              />
            </Pressable>
            <Text style={styles.supportFooter}>Secure payment via Ko-fi</Text>
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
  title: {
    color: '#173B4A',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 24,
    elevation: 4,
    marginBottom: 18,
    paddingHorizontal: 20,
    paddingVertical: 28,
    shadowColor: '#6CAFD0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.14,
    shadowRadius: 18,
  },
  input: {
    backgroundColor: '#F4FBFF',
    borderColor: '#D4EEF8',
    borderRadius: 18,
    borderWidth: 1,
    color: '#173B4A',
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionLabel: {
    color: '#173B4A',
    fontSize: 19,
    fontWeight: '700',
  },
  donationCard: {
    alignItems: 'center',
    marginTop: 16,
  },
  kofiLogo: {
    height: 56,
    marginBottom: 16,
    maxWidth: 200,
    width: '62%',
  },
  supportTitle: {
    color: '#173B4A',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
  },
  supportMessage: {
    color: '#24566A',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 23,
    textAlign: 'center',
  },
  supportHighlight: {
    color: '#007FB1',
    fontSize: 17,
    fontWeight: '700',
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
    maxWidth: 300,
    width: '100%',
  },
  kofiButtonImage: {
    height: 72,
    maxWidth: 300,
    width: '100%',
  },
  kofiButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  supportFooter: {
    color: '#5E7886',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
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
  reminderToggleRow: {
    backgroundColor: '#F4FBFF',
    borderColor: '#D4EEF8',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  reminderLabel: {
    color: '#24566A',
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  reminderInputs: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  reminderInputGroup: {
    flex: 1,
  },
  reminderInputLabel: {
    color: '#6B7C85',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  reminderInput: {
    marginBottom: 0,
  },
  saveMessage: {
    color: '#007FB1',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 6,
  },
});
