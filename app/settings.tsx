import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenBackground from '@/components/ScreenBackground';
import WaterBackgroundAnimation, {
  WaterBackgroundAnimationRef,
} from '@/components/WaterBackgroundAnimation';

const weightStorageKey = 'weight';
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
      await Notifications.cancelAllScheduledNotificationsAsync();
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
      await Notifications.cancelAllScheduledNotificationsAsync();
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
    router.push('/support');
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

          <View style={styles.card}>
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
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Statistics data</Text>
            <SettingsButton
              label="Clear statistics"
              onPress={handleClearStatistics}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>User settings</Text>
            <SettingsButton
              label="Clear user settings"
              onPress={handleClearUserSettings}
            />
          </View>

          <Text style={styles.saveMessage}>{saveMessage}</Text>

          <View style={[styles.card, styles.donationCard]}>
            <Text style={styles.sectionLabel}>
              {'Support this app \u2764\ufe0f'}
            </Text>
            <Text style={styles.sectionDescription}>
              If you enjoy using this app, you can support the developer.
            </Text>
            <SettingsButton
              label="Support / Donate"
              onPress={handleSupportPress}
            />
          </View>
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
  sectionDescription: {
    color: '#6B7C85',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 12,
  },
  donationCard: {
    marginTop: 16,
  },
  button: {
    backgroundColor: '#00AEEF',
    borderRadius: 18,
    elevation: 4,
    marginTop: 18,
    minHeight: 50,
    paddingHorizontal: 28,
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
