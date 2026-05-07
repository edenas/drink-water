import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Mask,
  Path,
  Stop,
} from 'react-native-svg';
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
import { useI18n } from '@/logic/i18n';
import { getWaterStatus } from '@/logic/waterStatus';

const defaultDailyGoal = 2000;
const defaultWaterStepAmount = 200;
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
const progressCircleSize = 206;
const progressCircleStrokeWidth = 18;

export default function HomeScreen() {
  const { isRtl, t } = useI18n();
  const insets = useSafeAreaInsets();
  const topContentInset = Math.max(insets.top * 0.2, 8);
  const bottomContentInset = Math.max(insets.bottom * 0.5, 14);
  const [waterAmount, setWaterAmount] = useState(0);
  const [allTimeWaterAmount, setAllTimeWaterAmount] = useState(0);
  const [waterHistory, setWaterHistory] = useState<Record<string, number>>({});
  const [hourlyWaterHistory, setHourlyWaterHistory] = useState<
    Record<string, Record<string, number>>
  >({});
  const [waterStepAmount, setWaterStepAmount] = useState(
    defaultWaterStepAmount
  );
  const [dailyGoal, setDailyGoal] = useState(defaultDailyGoal);
  const [lastSavedDate, setLastSavedDate] = useState<string | null>(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [waterStepAmountInput, setWaterStepAmountInput] = useState(
    String(defaultWaterStepAmount)
  );
  const [waterStepControlAmount, setWaterStepControlAmount] = useState(
    defaultWaterStepAmount
  );
  const [isEditingWaterStepAmount, setIsEditingWaterStepAmount] =
    useState(false);
  const sliderWidthRef = useRef(0);
  const waterStepAmountRef = useRef(defaultWaterStepAmount);
  const panStartWaterStepAmountRef = useRef(defaultWaterStepAmount);
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

    setWaterStepAmount(defaultWaterStepAmount);
    setWaterStepControlAmount(defaultWaterStepAmount);

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
        title: t('notification.title'),
        body: t('notification.body'),
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

  const adjustWaterStepAmount = (direction: -1 | 1) => {
    const nextWaterStepAmount = Math.min(
      Math.max(waterStepAmount + waterStepControlAmount * direction, 0),
      maxWaterStepAmount
    );

    setIsEditingWaterStepAmount(false);
    setWaterStepAmount(nextWaterStepAmount);
    setWaterStepAmountInput(String(nextWaterStepAmount));
  };

  const sliderValue = Math.min(waterStepAmount, maxWaterStepAmount);
  const sliderFillWidth = sliderWidth * (sliderValue / maxWaterStepAmount);

  const progressPercent =
    dailyGoal > 0 ? Math.min(Math.round((waterAmount / dailyGoal) * 100), 100) : 0;
  const waterStatus = getWaterStatus(waterAmount, dailyGoal);
  const waterStatusTranslationKey =
    `status.${waterStatus.statusText}` as
      | 'status.low'
      | 'status.medium'
      | 'status.good'
      | 'status.perfect'
      | 'status.careful';
  const milliliterUnit = t('unit.ml');
  const circleRadius =
    (progressCircleSize - progressCircleStrokeWidth) / 2;
  const circleCenter = progressCircleSize / 2;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleStrokeDashOffset =
    circleCircumference * (1 - progressPercent / 100);
  const visualWaterFillRatio = Math.max(progressPercent / 100, 0.29);
  const waterFillTop =
    progressCircleSize -
    progressCircleStrokeWidth -
    (progressCircleSize - progressCircleStrokeWidth * 2) *
      visualWaterFillRatio;
  const waterWaveOverscan = progressCircleSize * 0.65;
  const waterWaveLeft = -waterWaveOverscan;
  const waterWaveRight = progressCircleSize + waterWaveOverscan;
  const waterWaveBottom = progressCircleSize + waterWaveOverscan;
  const waterWavePath = `
    M ${waterWaveLeft} ${waterFillTop + 16}
    C ${progressCircleSize * -0.2} ${waterFillTop - 18}, ${
      progressCircleSize * 0.04
    } ${waterFillTop + 34}, ${progressCircleSize * 0.28} ${waterFillTop + 15}
    C ${progressCircleSize * 0.48} ${waterFillTop - 2}, ${
      progressCircleSize * 0.62
    } ${waterFillTop + 28}, ${progressCircleSize * 0.82} ${waterFillTop + 10}
    C ${progressCircleSize * 1.03} ${waterFillTop - 10}, ${
      progressCircleSize * 1.22
    } ${waterFillTop + 24}, ${waterWaveRight} ${waterFillTop + 8}
    L ${waterWaveRight} ${waterWaveBottom}
    L ${waterWaveLeft} ${waterWaveBottom}
    Z
  `;

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topContentInset,
            paddingBottom: bottomContentInset,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.notificationToggle,
            isRtl && styles.rtlRow,
            entranceAnimatedStyle,
          ]}
        >
          <Text
            style={[
              styles.notificationToggleLabel,
              isRtl && styles.rtlReminderLabel,
            ]}
          >
            {t('home.waterReminder')}
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
                          outputRange: [0, 24],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.notificationToggleText}>
                  {notificationsEnabled ? t('on') : t('off')}
                </Text>
              </Animated.View>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View
          style={[styles.card, styles.todayCard, entranceAnimatedStyle]}
        >
          <Text style={styles.title}>{t('home.today')}</Text>

          <View style={styles.progressCircleWrapper}>
            <Svg
              width={progressCircleSize}
              height={progressCircleSize}
              viewBox={`0 0 ${progressCircleSize} ${progressCircleSize}`}
            >
              <Defs>
                <LinearGradient
                  id="waterFillGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <Stop offset="0" stopColor="#61D9FF" stopOpacity="0.72" />
                  <Stop offset="0.55" stopColor="#1DB7F4" stopOpacity="0.9" />
                  <Stop offset="1" stopColor="#009EE8" stopOpacity="0.95" />
                </LinearGradient>
                <LinearGradient
                  id="progressStrokeGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <Stop offset="0" stopColor="#E8F8FF" />
                  <Stop offset="0.48" stopColor="#94E2FF" />
                  <Stop offset="1" stopColor="#28BDF4" />
                </LinearGradient>
                <ClipPath id="waterCircleClip">
                  <Circle
                    cx={circleCenter}
                    cy={circleCenter}
                    r={circleRadius - 10}
                  />
                </ClipPath>
                <Mask id="waterCircleMask">
                  <Circle
                    cx={circleCenter}
                    cy={circleCenter}
                    r={circleRadius - 10}
                    fill="#ffffff"
                  />
                </Mask>
              </Defs>

              <Circle
                cx={circleCenter}
                cy={circleCenter}
                r={circleRadius - 4}
                fill="#ffffff"
                stroke="rgba(214, 244, 255, 0.88)"
                strokeWidth={progressCircleStrokeWidth + 6}
              />

              <Circle
                cx={circleCenter}
                cy={circleCenter}
                r={circleRadius}
                fill="transparent"
                stroke="rgba(183, 232, 250, 0.5)"
                strokeWidth={progressCircleStrokeWidth}
              />

              <G
                clipPath="url(#waterCircleClip)"
                mask="url(#waterCircleMask)"
              >
                <Path d={waterWavePath} fill="url(#waterFillGradient)" />
                <Path
                  d={waterWavePath}
                  fill="rgba(120, 219, 255, 0.3)"
                  transform="translate(-34 -24)"
                />
                <Path
                  d={waterWavePath}
                  fill="rgba(255,255,255,0.18)"
                  transform="translate(38 -10)"
                />
              </G>

              <Circle
                cx={circleCenter}
                cy={circleCenter}
                r={circleRadius - 10}
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.82)"
                strokeWidth={2}
              />

              <Circle
                cx={circleCenter}
                cy={circleCenter}
                r={circleRadius}
                fill="transparent"
                stroke="url(#progressStrokeGradient)"
                strokeLinecap="round"
                strokeWidth={progressCircleStrokeWidth}
                strokeDasharray={`${circleCircumference} ${circleCircumference}`}
                strokeDashoffset={circleStrokeDashOffset}
                rotation="-90"
                origin={`${circleCenter}, ${circleCenter}`}
              />
            </Svg>

            <View style={styles.progressCircleCenter}>
              <Text
                style={styles.waterAmountText}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {waterAmount} {milliliterUnit}
              </Text>
              <Text style={styles.goalText}>
                {t('home.ofDailyGoal')} {dailyGoal} {milliliterUnit}
              </Text>
            </View>

            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>{progressPercent}%</Text>
            </View>
          </View>

          <Text style={[styles.statusText, { color: waterStatus.statusColor }]}>
            {t(waterStatusTranslationKey)}
          </Text>
        </Animated.View>

        <Animated.View
          style={[styles.card, styles.addWaterCard, entranceAnimatedStyle]}
        >
          <Text style={styles.addWaterTitle}>{t('home.addWater')}</Text>

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
            <Text style={styles.selectedAmountUnit}>{milliliterUnit}</Text>
          </View>

          <View style={styles.amountControlRow}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.amountStepButton,
                pressed && styles.amountStepButtonPressed,
              ]}
              onPress={() => adjustWaterStepAmount(-1)}
            >
              <Text style={styles.amountStepButtonText}>-</Text>
            </Pressable>

            <View
              style={styles.slider}
              onLayout={handleSliderLayout}
              {...panResponder.panHandlers}
            >
              <View style={styles.sliderTrack} />
              <View style={[styles.sliderFill, { width: sliderFillWidth }]} />
              <View style={[styles.sliderThumb, { left: sliderFillWidth }]} />
            </View>

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.amountStepButton,
                pressed && styles.amountStepButtonPressed,
              ]}
              onPress={() => adjustWaterStepAmount(1)}
            >
              <Text style={styles.amountStepButtonText}>+</Text>
            </Pressable>
          </View>

          <View style={styles.addWaterButtonWrapper}>
            <WaterButton
              label={t('home.addWater')}
              onPress={addWater}
              buttonStyle={styles.addWaterButton}
              textStyle={styles.addWaterButtonText}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  notificationToggle: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 999,
    borderWidth: 1,
    elevation: 4,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 158,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: '#6CAFD0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  notificationToggleLabel: {
    color: '#6C8192',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 15,
    minWidth: 68,
    textAlign: 'right',
  },
  rtlReminderLabel: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  notificationSwitchWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationSwitchTrack: {
    backgroundColor: '#DCE7EE',
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    padding: 3,
    width: 60,
  },
  notificationSwitchTrackOn: {
    backgroundColor: '#00AEEF',
  },
  notificationSwitchThumb: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    shadowColor: '#7CAFC7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    width: 30,
  },
  notificationToggleText: {
    color: '#007FB1',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
    maxWidth: 400,
    width: '100%',
  },
  content: {
    flexGrow: 1,
    gap: 12,
    justifyContent: 'center',
    maxWidth: 400,
    minHeight: '100%',
    width: '100%',
  },
  card: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.965)',
    borderRadius: 28,
    elevation: 5,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#7ABFDD',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    width: '100%',
  },
  todayCard: {
    paddingBottom: 24,
    paddingTop: 22,
  },
  addWaterCard: {
    paddingBottom: 22,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    color: '#073052',
    fontSize: 25,
    fontWeight: '800',
    marginBottom: 14,
  },
  addWaterTitle: {
    color: '#073052',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  waterAmountText: {
    color: '#003052',
    fontSize: 36,
    fontWeight: '800',
    includeFontPadding: false,
    maxWidth: 154,
    textAlign: 'center',
  },
  goalText: {
    color: '#6D8191',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  progressCircleWrapper: {
    alignItems: 'center',
    height: progressCircleSize,
    justifyContent: 'center',
    marginBottom: 22,
    width: progressCircleSize,
  },
  progressCircleCenter: {
    alignItems: 'center',
    height: 104,
    justifyContent: 'center',
    left: (progressCircleSize - 164) / 2,
    position: 'absolute',
    top: (progressCircleSize - 104) / 2,
    width: 164,
  },
  progressBadge: {
    alignItems: 'center',
    backgroundColor: '#11AEEF',
    borderColor: '#ffffff',
    borderRadius: 999,
    borderWidth: 0,
    bottom: 8,
    elevation: 6,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    shadowColor: '#0087BD',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    width: 56,
  },
  progressBadgeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
    textTransform: 'capitalize',
  },
  selectedAmountInputRow: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 3,
    justifyContent: 'center',
    marginBottom: 16,
    maxWidth: '100%',
  },
  selectedAmountInput: {
    color: '#003052',
    fontSize: 38,
    fontWeight: '800',
    maxWidth: 116,
    minWidth: 48,
    padding: 0,
    textAlign: 'center',
  },
  selectedAmountUnit: {
    color: '#003052',
    fontSize: 36,
    fontWeight: '800',
  },
  amountControlRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
    marginBottom: 8,
    width: '100%',
  },
  amountStepButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderColor: '#DDF3FF',
    borderRadius: 999,
    borderWidth: 2,
    height: 44,
    justifyContent: 'center',
    shadowColor: '#9AC9DD',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    width: 44,
  },
  amountStepButtonPressed: {
    backgroundColor: '#F1FBFF',
    transform: [{ scale: 0.97 }],
  },
  amountStepButtonText: {
    color: '#073052',
    fontSize: 28,
    fontWeight: '800',
    includeFontPadding: false,
    lineHeight: 32,
    textAlign: 'center',
  },
  slider: {
    flex: 1,
    height: 34,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 10,
    backgroundColor: '#DDF4FF',
    borderRadius: 999,
  },
  sliderFill: {
    position: 'absolute',
    height: 10,
    backgroundColor: '#1AAFF0',
    borderRadius: 999,
  },
  sliderThumb: {
    position: 'absolute',
    width: 30,
    height: 30,
    marginLeft: -15,
    borderColor: '#1AAFF0',
    borderRadius: 15,
    borderWidth: 2,
    backgroundColor: '#ffffff',
    elevation: 4,
    shadowColor: '#0087BD',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.16,
    shadowRadius: 9,
  },
  addWaterButtonWrapper: {
    alignSelf: 'center',
    width: '70%',
  },
  addWaterButton: {
    borderRadius: 16,
    height: 48,
    marginTop: 8,
  },
  addWaterButtonText: {
    fontSize: 16,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
});
