import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
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
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Profile</Text>

          <Text style={styles.label}>Weight</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            placeholder="Enter weight"
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
              <Text style={styles.optionText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.option,
                gender === 'female' && styles.selectedOption,
              ]}
              onPress={() => handleGenderPress('female')}
            >
              <Text style={styles.optionText}>Female</Text>
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
              <Text style={styles.optionText}>Low</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.option,
                activityLevel === 'medium' && styles.selectedOption,
              ]}
              onPress={() => handleActivityLevelPress('medium')}
            >
              <Text style={styles.optionText}>Medium</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.option,
                activityLevel === 'high' && styles.selectedOption,
              ]}
              onPress={() => handleActivityLevelPress('high')}
            >
              <Text style={styles.optionText}>High</Text>
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
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    fontSize: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  options: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  option: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  selectedOption: {
    backgroundColor: '#00AEEF',
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsActionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  saveMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
});
