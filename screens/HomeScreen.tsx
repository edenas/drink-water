import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import WaterButton from '@/components/WaterButton';
import { calculateDailyWaterGoal } from '@/logic/waterCalculator';
import { getWaterStatus } from '@/logic/waterStatus';

const defaultDailyGoal = 2000;
const maxWaterStepAmount = 1000;
const waterAmountStorageKey = 'waterAmount';
const allTimeWaterAmountStorageKey = 'allTimeWaterAmount';
const waterHistoryStorageKey = 'waterHistory';
const hourlyWaterHistoryStorageKey = 'hourlyWaterHistory';
const lastSavedDateStorageKey = 'lastSavedDate';
const weightStorageKey = 'weight';
const genderStorageKey = 'gender';
const activityLevelStorageKey = 'activityLevel';
const notificationsEnabledStorageKey = 'notificationsEnabled';
const notificationHoursStorageKey = 'notificationHours';
const notificationMinutesStorageKey = 'notificationMinutes';

const getDefaultWaterStepAmount = (gender: string | null) =>
  gender === 'male' ? 35 : 30;

export default function HomeScreen() {
  const [waterAmount, setWaterAmount] = useState(0);
  const [allTimeWaterAmount, setAllTimeWaterAmount] = useState(0);
  const [waterHistory, setWaterHistory] = useState<Record<string, number>>({});
  const [hourlyWaterHistory, setHourlyWaterHistory] = useState<
    Record<string, Record<string, number>>
  >({});
  const [waterStepAmount, setWaterStepAmount] = useState(30);
  const [dailyGoal, setDailyGoal] = useState(defaultDailyGoal);
  const [lastSavedDate, setLastSavedDate] = useState<string | null>(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const sliderWidthRef = useRef(0);
  const waterStepAmountRef = useRef(30);
  const panStartWaterStepAmountRef = useRef(30);

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const loadSavedValues = useCallback(async () => {
    const today = getTodayDate();
    const savedLastSavedDate = await AsyncStorage.getItem(
      lastSavedDateStorageKey
    );
    const savedWaterAmount = await AsyncStorage.getItem(waterAmountStorageKey);
    const savedAllTimeWaterAmount = await AsyncStorage.getItem(
      allTimeWaterAmountStorageKey
    );
    const savedWaterHistory = await AsyncStorage.getItem(
      waterHistoryStorageKey
    );
    const savedHourlyWaterHistory = await AsyncStorage.getItem(
      hourlyWaterHistoryStorageKey
    );
    const savedWeight = await AsyncStorage.getItem(weightStorageKey);
    const savedGender = await AsyncStorage.getItem(genderStorageKey);
    const savedActivityLevel = await AsyncStorage.getItem(
      activityLevelStorageKey
    );
    const savedNotificationsEnabled = await AsyncStorage.getItem(
      notificationsEnabledStorageKey
    );

    setLastSavedDate(savedLastSavedDate);
    setNotificationsEnabled(savedNotificationsEnabled === 'true');

    if (savedLastSavedDate !== today) {
      setWaterAmount(0);
    } else {
      setWaterAmount(savedWaterAmount !== null ? Number(savedWaterAmount) : 0);
    }

    setAllTimeWaterAmount(
      savedAllTimeWaterAmount !== null ? Number(savedAllTimeWaterAmount) : 0
    );
    setWaterHistory(
      savedWaterHistory !== null ? JSON.parse(savedWaterHistory) : {}
    );
    setHourlyWaterHistory(
      savedHourlyWaterHistory !== null
        ? JSON.parse(savedHourlyWaterHistory)
        : {}
    );

    setWaterStepAmount(getDefaultWaterStepAmount(savedGender));

    setDailyGoal(
      calculateDailyWaterGoal(savedWeight, savedGender, savedActivityLevel)
    );

    setHasLoadedStorage(true);
  }, []);

  useEffect(() => {
    loadSavedValues();
  }, [loadSavedValues]);

  useEffect(() => {
    waterStepAmountRef.current = waterStepAmount;
  }, [waterStepAmount]);

  useFocusEffect(
    useCallback(() => {
      loadSavedValues();
    }, [loadSavedValues])
  );

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    const today = getTodayDate();
    AsyncStorage.setItem(waterAmountStorageKey, String(waterAmount));
    AsyncStorage.setItem(lastSavedDateStorageKey, today);
    setLastSavedDate(today);
  }, [hasLoadedStorage, waterAmount]);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    AsyncStorage.setItem(
      allTimeWaterAmountStorageKey,
      String(allTimeWaterAmount)
    );
  }, [allTimeWaterAmount, hasLoadedStorage]);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    AsyncStorage.setItem(waterHistoryStorageKey, JSON.stringify(waterHistory));
  }, [hasLoadedStorage, waterHistory]);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    AsyncStorage.setItem(
      hourlyWaterHistoryStorageKey,
      JSON.stringify(hourlyWaterHistory)
    );
  }, [hasLoadedStorage, hourlyWaterHistory]);

  const scheduleNotifications = async () => {
    const savedNotificationHours = await AsyncStorage.getItem(
      notificationHoursStorageKey
    );
    const savedNotificationMinutes = await AsyncStorage.getItem(
      notificationMinutesStorageKey
    );
    const hours = Number(savedNotificationHours ?? '1') || 0;
    const minutes = Number(savedNotificationMinutes ?? '0') || 0;
    const intervalSeconds = hours * 60 * 60 + minutes * 60;

    if (intervalSeconds < 60) {
      return;
    }

    const currentPermission = await Notifications.getPermissionsAsync();
    const permission = currentPermission.granted
      ? currentPermission
      : await Notifications.requestPermissionsAsync();

    if (!permission.granted) {
      return;
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
  };

  const handleNotificationsEnabledChange = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem(notificationsEnabledStorageKey, String(value));

    if (!value) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return;
    }

    await scheduleNotifications();
  };

  const updateWaterStepAmount = (dragDistance: number) => {
    if (sliderWidthRef.current === 0) {
      return;
    }

    const dragAmount =
      (dragDistance / sliderWidthRef.current) * maxWaterStepAmount;
    const nextWaterStepAmount = Math.round(
      panStartWaterStepAmountRef.current + dragAmount
    );

    setWaterStepAmount(
      Math.min(Math.max(nextWaterStepAmount, 0), maxWaterStepAmount)
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        panStartWaterStepAmountRef.current = waterStepAmountRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        updateWaterStepAmount(gestureState.dx);
      },
    })
  ).current;

  const handleSliderLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;

    sliderWidthRef.current = width;
    setSliderWidth(width);
  };

  const sliderFillWidth =
    sliderWidth * (waterStepAmount / maxWaterStepAmount);

  const progressPercent =
    dailyGoal > 0 ? Math.min(Math.round((waterAmount / dailyGoal) * 100), 100) : 0;
  const waterStatus = getWaterStatus(waterAmount, dailyGoal);
  const addWater = () => {
    const today = getTodayDate();
    const currentHour = String(new Date().getHours());

    setWaterAmount(waterAmount + waterStepAmount);
    setAllTimeWaterAmount(allTimeWaterAmount + waterStepAmount);
    setWaterHistory({
      ...waterHistory,
      [today]: (waterHistory[today] || 0) + waterStepAmount,
    });
    setHourlyWaterHistory({
      ...hourlyWaterHistory,
      [today]: {
        ...(hourlyWaterHistory[today] || {}),
        [currentHour]:
          ((hourlyWaterHistory[today] || {})[currentHour] || 0) +
          waterStepAmount,
      },
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.topSafeArea} edges={['top']}>
        <View style={styles.notificationToggle}>
          <Text style={styles.notificationToggleText}>
            {notificationsEnabled ? 'ON' : 'OFF'}
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationsEnabledChange}
          />
        </View>
      </SafeAreaView>
      <Text style={styles.title}>Today</Text>
      <Text style={styles.waterAmountText}>{waterAmount} ml</Text>
      <Text style={styles.subtitle}>Daily goal: {dailyGoal} ml</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>
      <Text style={styles.progressText}>{progressPercent}%</Text>
      <Text style={[styles.statusText, { color: waterStatus.statusColor }]}>
        {waterStatus.statusText}
      </Text>
      <Text style={styles.sliderValue}>{waterStepAmount} ml</Text>

      <View
        style={styles.slider}
        onLayout={handleSliderLayout}
        {...panResponder.panHandlers}
      >
        <View style={styles.sliderTrack} />
        <View style={[styles.sliderFill, { width: sliderFillWidth }]} />
        <View style={[styles.sliderThumb, { left: sliderFillWidth }]} />
      </View>

      <WaterButton
        label={`+${waterStepAmount} ml`}
        onPress={addWater}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  notificationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notificationToggleText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  waterAmountText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBar: {
    width: 240,
    height: 12,
    backgroundColor: '#BDEEFF',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00AEEF',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sliderValue: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 10,
  },
  slider: {
    width: 240,
    height: 30,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#BDEEFF',
    borderRadius: 3,
  },
  sliderFill: {
    position: 'absolute',
    height: 6,
    backgroundColor: '#00AEEF',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    marginLeft: -12,
    borderRadius: 12,
    backgroundColor: '#00AEEF',
  },
});
