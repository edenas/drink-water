import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnimatedScreenContent from '@/components/AnimatedScreenContent';
import ScreenBackground from '@/components/ScreenBackground';
import ScreenLoading from '@/components/ScreenLoading';
import WaterBackgroundAnimation, {
  WaterBackgroundAnimationRef,
} from '@/components/WaterBackgroundAnimation';
import WaterButton from '@/components/WaterButton';
import { useI18n } from '@/logic/i18n';

const weightStorageKey = 'weight';
const ageStorageKey = 'age';
const genderStorageKey = 'gender';
const activityLevelStorageKey = 'activityLevel';

export default function ProfileScreen() {
  const { isRtl, t } = useI18n();
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [activityLevel, setActivityLevel] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [hasSavedSettings, setHasSavedSettings] = useState(false);
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false);
  const waterAnimationRef = useRef<WaterBackgroundAnimationRef>(null);

  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        try {
          const savedWeight = await AsyncStorage.getItem(weightStorageKey);
          const savedAge = await AsyncStorage.getItem(ageStorageKey);
          const savedGender = await AsyncStorage.getItem(genderStorageKey);
          const savedActivityLevel = await AsyncStorage.getItem(
            activityLevelStorageKey
          );

          setHasSavedSettings(
            savedWeight !== null ||
              savedAge !== null ||
              savedGender !== null ||
              savedActivityLevel !== null
          );
          setWeight(savedWeight ?? '');
          setAge(savedAge ?? '');
          setGender(savedGender);
          setActivityLevel(savedActivityLevel);
        } catch {
          setHasSavedSettings(false);
          setWeight('');
          setAge('');
          setGender(null);
          setActivityLevel(null);
        } finally {
          setHasLoadedSettings(true);
        }
      };

      const readyFallbackTimer = setTimeout(() => {
        setHasLoadedSettings(true);
      }, 1800);

      loadSettings();

      return () => clearTimeout(readyFallbackTimer);
    }, [])
  );

  const handleSave = async () => {
    waterAnimationRef.current?.trigger();
    Keyboard.dismiss();
    const message = hasSavedSettings ? t('updated') : t('saved');

    await AsyncStorage.setItem(weightStorageKey, weight);
    await AsyncStorage.setItem(ageStorageKey, age);
    await AsyncStorage.setItem(genderStorageKey, gender || '');
    await AsyncStorage.setItem(activityLevelStorageKey, activityLevel || '');

    setHasSavedSettings(true);
    setSaveMessage(message);
  };

  const handleGenderPress = (value: string) => {
    Keyboard.dismiss();
    setGender(value);
  };

  const handleAgeChange = (value: string) => {
    setAge(value.replace(/\D/g, ''));
  };

  const handleActivityLevelPress = (value: string) => {
    Keyboard.dismiss();
    setActivityLevel(value);
  };

  if (!hasLoadedSettings) {
    return <ScreenLoading />;
  }

  const profileContent = (
    <ScreenBackground>
      <WaterBackgroundAnimation ref={waterAnimationRef} />
      <SafeAreaView style={styles.container}>
        <AnimatedScreenContent>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.title, isRtl && styles.rtlText]}>
              {t('profile.title')}
            </Text>

            <View style={styles.card}>
            <Text style={[styles.label, isRtl && styles.rtlText]}>
              {t('profile.weight')}
            </Text>
            <TextInput
              style={[styles.input, isRtl && styles.rtlText]}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              placeholder={t('profile.enterWeight')}
              placeholderTextColor="#8AA7B6"
            />

            <Text style={[styles.label, isRtl && styles.rtlText]}>
              {t('profile.age')}
            </Text>
            <TextInput
              style={[styles.input, isRtl && styles.rtlText]}
              keyboardType="numeric"
              value={age}
              onChangeText={handleAgeChange}
              placeholder={t('profile.agePlaceholder')}
              placeholderTextColor="#8AA7B6"
            />

            <Text style={[styles.label, isRtl && styles.rtlText]}>
              {t('profile.gender')}
            </Text>
            <View style={[styles.options, isRtl && styles.rtlRow]}>
              <TouchableOpacity
                style={[
                  styles.option,
                  gender === 'male' && styles.selectedOption,
                ]}
                onPress={() => handleGenderPress('male')}
              >
                <Text
                  style={[
                    styles.optionText,
                    isRtl && styles.rtlText,
                    gender === 'male' && styles.selectedOptionText,
                  ]}
                >
                  {t('profile.male')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.option,
                  gender === 'female' && styles.selectedOption,
                ]}
                onPress={() => handleGenderPress('female')}
              >
                <Text
                  style={[
                    styles.optionText,
                    isRtl && styles.rtlText,
                    gender === 'female' && styles.selectedOptionText,
                  ]}
                >
                  {t('profile.female')}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, isRtl && styles.rtlText]}>
              {t('profile.activityLevel')}
            </Text>
            <View style={[styles.options, isRtl && styles.rtlRow]}>
              <TouchableOpacity
                style={[
                  styles.option,
                  activityLevel === 'low' && styles.selectedOption,
                ]}
                onPress={() => handleActivityLevelPress('low')}
              >
                <Text
                  style={[
                    styles.optionText,
                    isRtl && styles.rtlText,
                    activityLevel === 'low' && styles.selectedOptionText,
                  ]}
                >
                  {t('profile.low')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.option,
                  activityLevel === 'medium' && styles.selectedOption,
                ]}
                onPress={() => handleActivityLevelPress('medium')}
              >
                <Text
                  style={[
                    styles.optionText,
                    isRtl && styles.rtlText,
                    activityLevel === 'medium' && styles.selectedOptionText,
                  ]}
                >
                  {t('profile.medium')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.option,
                  activityLevel === 'high' && styles.selectedOption,
                ]}
                onPress={() => handleActivityLevelPress('high')}
              >
                <Text
                  style={[
                    styles.optionText,
                    isRtl && styles.rtlText,
                    activityLevel === 'high' && styles.selectedOptionText,
                  ]}
                >
                  {t('profile.high')}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.settingsActionLabel, isRtl && styles.rtlText]}>
              {hasSavedSettings
                ? t('profile.updateSettings')
                : t('profile.saveSettings')}
            </Text>
            <WaterButton
              label={hasSavedSettings ? t('update') : t('save')}
              onPress={handleSave}
            />
            <Text style={[styles.saveMessage, isRtl && styles.rtlText]}>
              {saveMessage}
            </Text>
            </View>
          </ScrollView>
        </AnimatedScreenContent>
      </SafeAreaView>
    </ScreenBackground>
  );

  if (Platform.OS === 'web') {
    return profileContent;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {profileContent}
    </TouchableWithoutFeedback>
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
  label: {
    color: '#6B7C85',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F4FBFF',
    borderColor: '#D4EEF8',
    borderRadius: 18,
    borderWidth: 1,
    color: '#173B4A',
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 26,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  options: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 26,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  option: {
    backgroundColor: '#F4FBFF',
    borderColor: '#D4EEF8',
    borderRadius: 18,
    borderWidth: 1,
    elevation: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: '#6CAFD0',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  selectedOption: {
    backgroundColor: '#00AEEF',
    borderColor: '#00AEEF',
  },
  optionText: {
    color: '#24566A',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: '#ffffff',
  },
  settingsActionLabel: {
    color: '#6B7C85',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  saveMessage: {
    color: '#007FB1',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 14,
  },
});
