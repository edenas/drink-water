import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnimatedScreenContent from '@/components/AnimatedScreenContent';
import ScreenBackground from '@/components/ScreenBackground';
import { appButtonStyles } from '@/constants/buttonStyles';
import { AppLanguage, useI18n } from '@/logic/i18n';

const languageOptions: AppLanguage[] = [
  'ar',
  'de',
  'en',
  'es',
  'et',
  'fr',
  'sw',
  'lv',
  'lt',
  'no',
  'pl',
  'pt',
  'fi',
  'sv',
  'vi',
  'uk',
  'ru',
  'he',
  'zh',
  'ja',
  'ko',
];

function LanguageButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styles.secondaryButton,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, styles.secondaryButtonText]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function LanguageScreen() {
  const { isRtl, language, setLanguage, t } = useI18n();

  const getLanguageLabel = (nextLanguage: AppLanguage) => {
    if (nextLanguage === 'lt') {
      return t('settings.lithuanian');
    }

    if (nextLanguage === 'lv') {
      return t('settings.latvian');
    }

    if (nextLanguage === 'no') {
      return t('settings.norwegian');
    }

    if (nextLanguage === 'sv') {
      return t('settings.swedish');
    }

    if (nextLanguage === 'es') {
      return t('settings.spanish');
    }

    if (nextLanguage === 'ja') {
      return t('settings.japanese');
    }

    if (nextLanguage === 'zh') {
      return t('settings.chinese');
    }

    if (nextLanguage === 'he') {
      return t('settings.hebrew');
    }

    if (nextLanguage === 'ar') {
      return t('settings.arabic');
    }

    if (nextLanguage === 'ko') {
      return t('settings.korean');
    }

    if (nextLanguage === 'pt') {
      return t('settings.portuguese');
    }

    if (nextLanguage === 'et') {
      return t('settings.estonian');
    }

    if (nextLanguage === 'vi') {
      return t('settings.vietnamese');
    }

    if (nextLanguage === 'sw') {
      return t('settings.swahili');
    }

    if (nextLanguage === 'ru') {
      return t('settings.russian');
    }

    if (nextLanguage === 'fr') {
      return t('settings.french');
    }

    if (nextLanguage === 'de') {
      return t('settings.german');
    }

    if (nextLanguage === 'pl') {
      return t('settings.polish');
    }

    if (nextLanguage === 'uk') {
      return 'Українська';
    }

    if (nextLanguage === 'fi') {
      return 'Suomi';
    }

    return t('settings.english');
  };

  const handleBackPress = () => {
    router.replace('/settings');
  };

  const handleLanguagePress = async (nextLanguage: AppLanguage) => {
    await setLanguage(nextLanguage);
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container}>
        <AnimatedScreenContent>
          <ScrollView contentContainerStyle={styles.content}>
            <LanguageButton label={t('back')} onPress={handleBackPress} />

          <View style={styles.card}>
            <Text
              style={[
                styles.title,
                isRtl && styles.rtlText,
              ]}
            >
              {t('settings.language')}
            </Text>

            <View style={styles.languageList}>
              {languageOptions.map((option) => {
                const isSelected = language === option;

                return (
                  <Pressable
                    key={option}
                    style={({ pressed }) => [
                      styles.languageRow,
                      isRtl && styles.rtlRow,
                      isSelected && styles.selectedLanguageRow,
                      pressed && styles.languageRowPressed,
                    ]}
                    onPress={() => handleLanguagePress(option)}
                  >
                    <Text
                      style={[
                        styles.languageLabel,
                        isRtl && styles.rtlText,
                        isSelected && styles.selectedLanguageLabel,
                      ]}
                    >
                      {getLanguageLabel(option)}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </Pressable>
                );
              })}
            </View>
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
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 24,
    elevation: 4,
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 28,
    shadowColor: '#6CAFD0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.14,
    shadowRadius: 18,
  },
  title: {
    color: '#173B4A',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 20,
  },
  languageList: {
    gap: 10,
  },
  languageRow: {
    alignItems: 'center',
    backgroundColor: '#F4FBFF',
    borderColor: '#D4EEF8',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  languageRowPressed: {
    backgroundColor: '#EAF8FF',
  },
  selectedLanguageRow: {
    backgroundColor: '#EAF8FF',
    borderColor: '#00AEEF',
  },
  languageLabel: {
    color: '#24566A',
    fontSize: 17,
    fontWeight: '700',
  },
  selectedLanguageLabel: {
    color: '#173B4A',
  },
  checkmark: {
    color: '#00AEEF',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  button: {
    ...appButtonStyles.primaryButton,
    marginTop: 0,
    paddingHorizontal: 24,
  },
  buttonPressed: {
    ...appButtonStyles.primaryButtonPressed,
  },
  buttonText: {
    ...appButtonStyles.primaryButtonText,
  },
  secondaryButton: {
    ...appButtonStyles.secondaryButton,
  },
  secondaryButtonText: {
    ...appButtonStyles.secondaryButtonText,
  },
});
