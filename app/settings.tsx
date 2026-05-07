import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
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

import AnimatedScreenContent from '@/components/AnimatedScreenContent';
import ScreenBackground from '@/components/ScreenBackground';
import ScreenLoading from '@/components/ScreenLoading';
import WaterBackgroundAnimation, {
  WaterBackgroundAnimationRef,
} from '@/components/WaterBackgroundAnimation';
import { appButtonStyles } from '@/constants/buttonStyles';
import {
  canUseLocalNotifications,
  getNotificationsModule,
} from '@/logic/notifications';
import { useI18n } from '@/logic/i18n';

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
  const { isRtl, language, t } = useI18n();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationHours, setNotificationHours] = useState('1');
  const [notificationMinutes, setNotificationMinutes] = useState('0');
  const [saveMessage, setSaveMessage] = useState('');
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false);
  const waterAnimationRef = useRef<WaterBackgroundAnimationRef>(null);

  const loadSettings = useCallback(async () => {
    try {
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
    } catch {
      setNotificationsEnabled(false);
      setNotificationHours('1');
      setNotificationMinutes('0');
    } finally {
      setHasLoadedSettings(true);
    }

  }, []);

  useEffect(() => {
    setSaveMessage('');
  }, [language]);

  useFocusEffect(
    useCallback(() => {
      const readyFallbackTimer = setTimeout(() => {
        setHasLoadedSettings(true);
      }, 1800);

      loadSettings();

      return () => clearTimeout(readyFallbackTimer);
    }, [loadSettings])
  );

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
      setSaveMessage(t('settings.useAtLeastMinute'));
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
      setSaveMessage(t('settings.notificationsDenied'));
      return false;
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
      setSaveMessage(t('settings.reminderDisabled'));
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
      setSaveMessage(t('settings.reminderSaved'));
      return;
    }

    const didSchedule = await scheduleNotifications();

    if (didSchedule) {
      setSaveMessage(t('settings.reminderSaved'));
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

    setSaveMessage(t('settings.settingsCleared'));
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

    setSaveMessage(t('settings.statisticsCleared'));
  };

  const getCurrentLanguageLabel = () => {
    if (language === 'lt') {
      return t('settings.lithuanian');
    }

    if (language === 'lv') {
      return t('settings.latvian');
    }

    if (language === 'no') {
      return t('settings.norwegian');
    }

    if (language === 'sv') {
      return t('settings.swedish');
    }

    if (language === 'es') {
      return t('settings.spanish');
    }

    if (language === 'ja') {
      return t('settings.japanese');
    }

    if (language === 'zh') {
      return t('settings.chinese');
    }

    if (language === 'he') {
      return t('settings.hebrew');
    }

    if (language === 'ar') {
      return t('settings.arabic');
    }

    if (language === 'ko') {
      return t('settings.korean');
    }

    if (language === 'pt') {
      return t('settings.portuguese');
    }

    if (language === 'et') {
      return t('settings.estonian');
    }

    if (language === 'vi') {
      return t('settings.vietnamese');
    }

    if (language === 'sw') {
      return t('settings.swahili');
    }

    if (language === 'ru') {
      return t('settings.russian');
    }

    if (language === 'fr') {
      return t('settings.french');
    }

    if (language === 'de') {
      return t('settings.german');
    }

    if (language === 'pl') {
      return t('settings.polish');
    }

    return t('settings.english');
  };

  const handleLanguageCardPress = () => {
    router.push('/language');
  };

  const handleSupportPress = () => {
    Linking.openURL(kofiUrl);
  };

  const handleDisclaimerPress = () => {
    router.push({
      pathname: '/disclaimer',
      params: { source: 'settings' },
    });
  };

  const handleHowToUsePress = () => {
    router.push({
      pathname: '/how-to-use',
      params: { source: 'settings' },
    });
  };

  const handlePrivacyPolicyPress = () => {
    router.push({
      pathname: '/privacy-policy',
      params: { source: 'settings' },
    });
  };

  if (!hasLoadedSettings) {
    return <ScreenLoading />;
  }

  return (
    <ScreenBackground>
      <WaterBackgroundAnimation ref={waterAnimationRef} />
      <SafeAreaView style={styles.container}>
        <AnimatedScreenContent>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={() => Keyboard.dismiss()}
          >
          <Text style={[styles.title, isRtl && styles.rtlText]}>
            {t('settings.title')}
          </Text>

          <View style={styles.card}>
            <Pressable
              style={({ pressed }) => [
                styles.languageRow,
                isRtl && styles.rtlRow,
                pressed && styles.languageRowPressed,
              ]}
              onPress={handleLanguageCardPress}
            >
              <View>
                <Text style={[styles.sectionLabel, isRtl && styles.rtlText]}>
                  {t('settings.language')}
                </Text>
                <Text style={[styles.languageValue, isRtl && styles.rtlText]}>
                  {getCurrentLanguageLabel()}
                </Text>
              </View>
              <Text style={styles.languageChevron}>{isRtl ? '‹' : '›'}</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={[styles.sectionLabel, isRtl && styles.rtlText]}>
              {t('settings.waterReminder')}
            </Text>
            <View style={[styles.reminderToggleRow, isRtl && styles.rtlRow]}>
              <Text
                style={[
                  styles.reminderLabel,
                  isRtl && styles.rtlText,
                  isRtl && styles.rtlReminderLabel,
                ]}
              >
                {t('settings.remindMe')}
              </Text>
              <Switch
                trackColor={{ false: '#D8E3EA', true: '#00AEEF' }}
                thumbColor="#ffffff"
                value={notificationsEnabled}
                onValueChange={handleNotificationsEnabledChange}
              />
            </View>
            <View style={[styles.reminderInputs, isRtl && styles.rtlRow]}>
              <View style={styles.reminderInputGroup}>
                <Text style={[styles.reminderInputLabel, isRtl && styles.rtlText]}>
                  {t('settings.hours')}
                </Text>
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
                <Text style={[styles.reminderInputLabel, isRtl && styles.rtlText]}>
                  {t('settings.minutes')}
                </Text>
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
              label={t('save')}
              onPress={handleSaveNotifications}
            />
          </View>

          <View style={styles.card}>
            <Text style={[styles.sectionLabel, isRtl && styles.rtlText]}>
              {t('settings.statisticsData')}
            </Text>
            <SettingsButton
              label={t('settings.clearStatistics')}
              onPress={handleClearStatistics}
            />
          </View>

          <View style={styles.card}>
            <Text style={[styles.sectionLabel, isRtl && styles.rtlText]}>
              {t('settings.userSettings')}
            </Text>
            <SettingsButton
              label={t('settings.clearUserSettings')}
              onPress={handleClearUserSettings}
            />
          </View>

          <Text style={[styles.saveMessage, isRtl && styles.rtlText]}>
            {saveMessage}
          </Text>

          <View style={styles.card}>
            <Text style={[styles.sectionLabel, isRtl && styles.rtlText]}>
              {t('settings.appInformation')}
            </Text>
            <SettingsButton
              label={t('nav.disclaimer')}
              onPress={handleDisclaimerPress}
            />
            <SettingsButton
              label={t('nav.howToUse')}
              onPress={handleHowToUsePress}
            />
            <SettingsButton
              label={t('nav.privacyPolicy')}
              onPress={handlePrivacyPolicyPress}
            />
          </View>

          <View style={[styles.card, styles.donationCard]}>
            <Image
              source={require('../assets/kofi_logo.png')}
              resizeMode="contain"
              style={styles.kofiLogo}
            />
            <Text style={[styles.supportTitle, isRtl && styles.rtlText]}>
              {t('support.title')}
            </Text>
            <Text style={[styles.supportMessage, isRtl && styles.rtlText]}>
              {t('support.message')}
            </Text>
            <Text style={[styles.supportHighlight, isRtl && styles.rtlText]}>
              {t('support.highlight')}
            </Text>
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
            <Text style={[styles.supportFooter, isRtl && styles.rtlText]}>
              {t('support.footer')}
            </Text>
          </View>
          </ScrollView>
        </AnimatedScreenContent>
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
  rtlReminderLabel: {
    marginLeft: 12,
    marginRight: 0,
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
  languageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  languageRowPressed: {
    opacity: 0.76,
  },
  languageValue: {
    color: '#24566A',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  languageChevron: {
    color: '#007FB1',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 30,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  saveMessage: {
    color: '#007FB1',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 6,
  },
});
