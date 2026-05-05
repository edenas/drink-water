import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenBackground from '@/components/ScreenBackground';
import WaterBackgroundAnimation, {
  WaterBackgroundAnimationRef,
} from '@/components/WaterBackgroundAnimation';
import WaterButton from '@/components/WaterButton';
import { calculateDailyWaterGoal } from '@/logic/waterCalculator';
import {
  canUseLocalNotifications,
  getNotificationsModule,
} from '@/logic/notifications';
import { getWaterStatus } from '@/logic/waterStatus';

const defaultDailyGoal = 2000;
const maxWaterStepAmount = 1000;
const maxManualWaterStepAmount = 9999;
const waterAmountStorageKey = 'waterAmount';
const allTimeWaterAmountStorageKey = 'allTimeWaterAmount';
const waterHistoryStorageKey = 'waterHistory';
const hourlyWaterHistoryStorageKey = 'hourlyWaterHistory';
const lastSavedDateStorageKey = 'lastSavedDate';
const weightStorageKey = 'weight';
const ageStorageKey = 'age';
const genderStorageKey = 'gender';
const activityLevelStorageKey = 'activityLevel';
const notificationsEnabledStorageKey = 'notificationsEnabled';
const notificationHoursStorageKey = 'notificationHours';
const notificationMinutesStorageKey = 'notificationMinutes';

const getDefaultWaterStepAmount = (gender: string | null) => {
  if (gender === 'male') {
    return 35;
  }

  return 30;
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const topContentInset = Math.max(insets.top * 0.35, 12);
  const bottomContentInset = Math.max(insets.bottom, 28);
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
  const [waterStepAmountInput, setWaterStepAmountInput] = useState('30');
  const [isEditingWaterStepAmount, setIsEditingWaterStepAmount] =
    useState(false);
  const sliderWidthRef = useRef(0);
  const waterStepAmountRef = useRef(30);
  const panStartWaterStepAmountRef = useRef(30);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const notificationToggleAnimation = useRef(new Animated.Value(0)).current;
  const entranceAnimation = useRef(new Animated.Value(0)).current;
  const waterAnimationRef = useRef<WaterBackgroundAnimationRef>(null);

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
    const savedAge = await AsyncStorage.getItem(ageStorageKey);
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
      calculateDailyWaterGoal(
        savedWeight,
        savedGender,
        savedActivityLevel,
        savedAge
      )
    );

    setHasLoadedStorage(true);
  }, []);

  useEffect(() => {
    loadSavedValues();
  }, [loadSavedValues]);

  useEffect(() => {
    waterStepAmountRef.current = waterStepAmount;
  }, [waterStepAmount]);

  useEffect(() => {
    if (!isEditingWaterStepAmount) {
      setWaterStepAmountInput(String(waterStepAmount));
    }
  }, [isEditingWaterStepAmount, waterStepAmount]);

  useFocusEffect(
    useCallback(() => {
      loadSavedValues();
      entranceAnimation.setValue(0);
      Animated.timing(entranceAnimation, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }).start();
    }, [entranceAnimation, loadSavedValues])
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
    if (!canUseLocalNotifications) {
      return;
    }

    const Notifications = getNotificationsModule();

    if (Notifications === null) {
      return;
    }

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
      const Notifications = getNotificationsModule();

      if (Notifications !== null) {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
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

  const handleWaterStepAmountChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');

    if (digitsOnly === '') {
      setWaterStepAmountInput('');
      setWaterStepAmount(0);
      return;
    }

    const nextWaterStepAmount = Math.min(
      Number(digitsOnly),
      maxManualWaterStepAmount
    );

    setWaterStepAmountInput(String(nextWaterStepAmount));
    setWaterStepAmount(nextWaterStepAmount);
  };

  const handleWaterStepAmountBlur = () => {
    const nextWaterStepAmount =
      waterStepAmountInput === '' ? 0 : Number(waterStepAmountInput);

    setIsEditingWaterStepAmount(false);
    setWaterStepAmount(nextWaterStepAmount);
    setWaterStepAmountInput(String(nextWaterStepAmount));
  };

  const sliderValue = Math.min(waterStepAmount, maxWaterStepAmount);
  const sliderFillWidth = sliderWidth * (sliderValue / maxWaterStepAmount);

  const progressPercent =
    dailyGoal > 0 ? Math.min(Math.round((waterAmount / dailyGoal) * 100), 100) : 0;
  const waterStatus = getWaterStatus(waterAmount, dailyGoal);
  const animatedProgressWidth = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 260],
  });

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: progressPercent,
      duration: 420,
      useNativeDriver: false,
    }).start();
  }, [progressAnimation, progressPercent]);

  useEffect(() => {
    Animated.timing(notificationToggleAnimation, {
      toValue: notificationsEnabled ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [notificationToggleAnimation, notificationsEnabled]);

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

  const addWater = () => {
    const today = getTodayDate();
    const currentHour = String(new Date().getHours());

    waterAnimationRef.current?.trigger();
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
    <ScreenBackground
      style={styles.container}
      onStartShouldSetResponderCapture={() => {
        Keyboard.dismiss();
        return false;
      }}
    >
      <WaterBackgroundAnimation ref={waterAnimationRef} />
      <View
        style={[
          styles.content,
          {
            paddingTop: topContentInset,
            paddingBottom: bottomContentInset,
          },
        ]}
      >
        <Animated.View
          style={[styles.notificationToggle, entranceAnimatedStyle]}
        >
          <Text style={styles.notificationToggleLabel}>
            Water{'\n'}Reminder
          </Text>
          <View style={styles.notificationSwitchWrapper}>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: notificationsEnabled }}
              onPress={() =>
                handleNotificationsEnabledChange(!notificationsEnabled)
              }
              style={[
                styles.notificationSwitchTrack,
                notificationsEnabled && styles.notificationSwitchTrackOn,
              ]}
            >
              <Animated.View
                style={[
                  styles.notificationSwitchThumb,
                  {
                    transform: [
                      {
                        translateX: notificationToggleAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 20],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.notificationToggleText}>
                  {notificationsEnabled ? 'ON' : 'OFF'}
                </Text>
              </Animated.View>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View style={[styles.card, entranceAnimatedStyle]}>
          <Text style={styles.title}>Today</Text>
          <Text style={styles.waterAmountText}>{waterAmount} ml</Text>
          <Text style={styles.subtitle}>Daily goal: {dailyGoal} ml</Text>
          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: animatedProgressWidth }]}
            />
          </View>
          <Text style={styles.progressText}>{progressPercent}%</Text>
          <Text style={[styles.statusText, { color: waterStatus.statusColor }]}>
            {waterStatus.statusText}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.card, entranceAnimatedStyle]}>
          <View style={styles.selectedAmountPill}>
            <Text style={styles.selectedAmountLabel}>Selected amount</Text>
            <View style={styles.selectedAmountInputRow}>
              <TextInput
                style={styles.selectedAmountInput}
                value={waterStepAmountInput}
                keyboardType="number-pad"
                maxLength={4}
                onBlur={handleWaterStepAmountBlur}
                onChangeText={handleWaterStepAmountChange}
                onFocus={() => setIsEditingWaterStepAmount(true)}
                selectTextOnFocus
              />
              <Text style={styles.selectedAmountUnit}>ml</Text>
            </View>
          </View>

          <View
            style={styles.slider}
            onLayout={handleSliderLayout}
            {...panResponder.panHandlers}
          >
            <View style={styles.sliderTrack} />
            <View style={[styles.sliderFill, { width: sliderFillWidth }]} />
            <View style={[styles.sliderThumb, { left: sliderFillWidth }]} />
          </View>

          <WaterButton label="Add water" onPress={addWater} />
        </Animated.View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  notificationToggle: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(189, 238, 255, 0.9)',
    borderRadius: 22,
    borderWidth: 1,
    elevation: 3,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: '#6CAFD0',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.14,
    shadowRadius: 14,
  },
  notificationToggleLabel: {
    color: '#6B7C85',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 13,
    minWidth: 54,
    textAlign: 'right',
  },
  notificationSwitchWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationSwitchTrack: {
    backgroundColor: '#D8E3EA',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    padding: 2,
    width: 52,
  },
  notificationSwitchTrackOn: {
    backgroundColor: '#00AEEF',
  },
  notificationSwitchThumb: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  notificationToggleText: {
    color: '#007FB1',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    maxWidth: 360,
    width: '100%',
  },
  card: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 24,
    elevation: 4,
    paddingHorizontal: 20,
    paddingVertical: 28,
    shadowColor: '#6CAFD0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    width: '100%',
  },
  title: {
    color: '#173B4A',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 14,
  },
  subtitle: {
    color: '#6B7C85',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 18,
  },
  waterAmountText: {
    color: '#007FB1',
    fontSize: 56,
    fontWeight: '700',
    marginBottom: 10,
  },
  progressBar: {
    width: 260,
    height: 14,
    backgroundColor: '#BDEEFF',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00AEEF',
    borderRadius: 999,
  },
  progressText: {
    color: '#24566A',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 19,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  selectedAmountPill: {
    alignItems: 'center',
    backgroundColor: '#F4FBFF',
    borderColor: '#D4EEF8',
    borderRadius: 20,
    borderWidth: 1,
    elevation: 2,
    marginBottom: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: '#6CAFD0',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  selectedAmountLabel: {
    color: '#6B7C85',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10,
  },
  selectedAmountInputRow: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 3,
    justifyContent: 'center',
    maxWidth: '100%',
  },
  selectedAmountInput: {
    color: '#173B4A',
    fontSize: 32,
    fontWeight: '700',
    maxWidth: 86,
    minWidth: 42,
    padding: 0,
    textAlign: 'center',
  },
  selectedAmountUnit: {
    color: '#173B4A',
    fontSize: 32,
    fontWeight: '700',
  },
  slider: {
    width: 260,
    height: 36,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#BDEEFF',
    borderRadius: 999,
  },
  sliderFill: {
    position: 'absolute',
    height: 8,
    backgroundColor: '#00AEEF',
    borderRadius: 999,
  },
  sliderThumb: {
    position: 'absolute',
    width: 26,
    height: 26,
    marginLeft: -13,
    borderRadius: 13,
    backgroundColor: '#00AEEF',
    elevation: 3,
    shadowColor: '#0087BD',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
});
