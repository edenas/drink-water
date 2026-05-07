import { router, useLocalSearchParams } from 'expo-router';
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
import { useI18n } from '@/logic/i18n';

function InfoButton({ label, onPress }: { label: string; onPress: () => void }) {
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

export default function PrivacyPolicyScreen() {
  const { isRtl, t } = useI18n();
  const { source } = useLocalSearchParams<{ source?: string }>();

  const handleBackPress = () => {
    if (source === 'settings') {
      router.replace('/settings');
      return;
    }

    router.replace('/terms?showAgreement=true');
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container}>
        <AnimatedScreenContent>
          <ScrollView contentContainerStyle={styles.content}>
            <InfoButton label={t('back')} onPress={handleBackPress} />

          <View style={styles.card}>
            <Text style={[styles.title, isRtl && styles.rtlText]}>
              {t('privacy.title')}
            </Text>
            <Text style={[styles.bodyText, isRtl && styles.rtlText]}>
              {t('privacy.body')}
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
    marginBottom: 18,
  },
  bodyText: {
    color: '#24566A',
    fontSize: 16,
    fontWeight: '500',
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
