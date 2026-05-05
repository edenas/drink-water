import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenBackground from '@/components/ScreenBackground';
import WaterBackgroundAnimation, {
  WaterBackgroundAnimationRef,
} from '@/components/WaterBackgroundAnimation';
import WaterButton from '@/components/WaterButton';

const weightStorageKey = 'weight';
const genderStorageKey = 'gender';
const activityLevelStorageKey = 'activityLevel';

export default function ProfileScreen() {
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [activityLevel, setActivityLevel] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [hasSavedSettings, setHasSavedSettings] = useState(false);
  const waterAnimationRef = useRef<WaterBackgroundAnimationRef>(null);

  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        const savedWeight = await AsyncStorage.getItem(weightStorageKey);
        const savedGender = await AsyncStorage.getItem(genderStorageKey);
        const savedActivityLevel = await AsyncStorage.getItem(
          activityLevelStorageKey
        );

        setHasSavedSettings(
          savedWeight !== null ||
            savedGender !== null ||
            savedActivityLevel !== null
        );
        setWeight(savedWeight ?? '');
        setGender(savedGender);
        setActivityLevel(savedActivityLevel);
      };

      loadSettings();
    }, [])
  );

  const handleSave = async () => {
    waterAnimationRef.current?.trigger();
    Keyboard.dismiss();
    const message = hasSavedSettings ? '\u2713 Updated' : '\u2713 Saved';

    await AsyncStorage.setItem(weightStorageKey, weight);
    await AsyncStorage.setItem(genderStorageKey, gender || '');
    await AsyncStorage.setItem(activityLevelStorageKey, activityLevel || '');

    setHasSavedSettings(true);
    setSaveMessage(message);
  };

  const handleGenderPress = (value: string) => {
    Keyboard.dismiss();
    setGender(value);
  };

  const handleActivityLevelPress = (value: string) => {
    Keyboard.dismiss();
    setActivityLevel(value);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScreenBackground>
        <WaterBackgroundAnimation ref={waterAnimationRef} />
        <SafeAreaView style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Profile</Text>

            <View style={styles.card}>
              <Text style={styles.label}>Weight</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                placeholder="Enter weight"
                placeholderTextColor="#8AA7B6"
              />

              <Text style={styles.label}>Gender</Text>
              <View style={styles.options}>
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
                      gender === 'male' && styles.selectedOptionText,
                    ]}
                  >
                    Male
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
                      gender === 'female' && styles.selectedOptionText,
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Activity level</Text>
              <View style={styles.options}>
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
                      activityLevel === 'low' && styles.selectedOptionText,
                    ]}
                  >
                    Low
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
                      activityLevel === 'medium' && styles.selectedOptionText,
                    ]}
                  >
                    Medium
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
                      activityLevel === 'high' && styles.selectedOptionText,
                    ]}
                  >
                    High
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.settingsActionLabel}>
                {hasSavedSettings ? 'Update settings' : 'Save settings'}
              </Text>
              <WaterButton
                label={hasSavedSettings ? 'Update' : 'Save'}
                onPress={handleSave}
              />
              <Text style={styles.saveMessage}>{saveMessage}</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ScreenBackground>
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
