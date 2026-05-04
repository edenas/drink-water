import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import WaterButton from '@/components/WaterButton';

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

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationHours, setNotificationHours] = useState('1');
  const [notificationMinutes, setNotificationMinutes] = useState('0');
  const [saveMessage, setSaveMessage] = useState('');

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
      setSaveMessage('\u2713 Reminders disabled');
    }
  };

  const handleSaveNotifications = async () => {
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
      setSaveMessage('\u2713 Reminders saved');
      return;
    }

    const didSchedule = await scheduleNotifications();

    if (didSchedule) {
      setSaveMessage('\u2713 Reminders saved');
    }
  };

  const handleClearUserSettings = async () => {
    Keyboard.dismiss();

    await AsyncStorage.multiRemove([
      weightStorageKey,
      genderStorageKey,
      activityLevelStorageKey,
    ]);

    setSaveMessage('\u2713 Settings cleared');
  };

  const handleClearStatistics = async () => {
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Settings</Text>

          <Text style={styles.sectionLabel}>Reminders</Text>
          <View style={styles.reminderToggleRow}>
            <Text style={styles.reminderLabel}>Enable reminders</Text>
            <Switch
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
                placeholderTextColor="#8A9BA8"
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
                placeholderTextColor="#8A9BA8"
              />
            </View>
          </View>
          <WaterButton
            label="Save reminders"
            onPress={handleSaveNotifications}
          />
          <Text style={styles.sectionLabel}>Statistics data</Text>
          <WaterButton
            label="Clear statistics"
            onPress={handleClearStatistics}
          />
          <Text style={styles.sectionLabel}>User settings</Text>
          <WaterButton
            label="Clear user settings"
            onPress={handleClearUserSettings}
          />
          <Text style={styles.saveMessage}>{saveMessage}</Text>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F7FF',
  },
  content: {
    padding: 24,
    paddingBottom: 80,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    fontSize: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 24,
  },
  reminderToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  reminderLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reminderInputs: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  reminderInputGroup: {
    flex: 1,
  },
  reminderInputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  reminderInput: {
    marginBottom: 0,
  },
  saveMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
});
