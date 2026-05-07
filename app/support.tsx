import { router } from 'expo-router';
import {
  Image,
  Linking,
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

const kofiUrl = 'https://ko-fi.com/edenaspocius';

type SupportButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

function SupportButton({
  label,
  onPress,
  variant = 'primary',
}: SupportButtonProps) {
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isSecondary && styles.secondaryButton,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <Text
        style={[styles.buttonText, isSecondary && styles.secondaryButtonText]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function SupportScreen() {
  const { isRtl, t } = useI18n();

  const handleBackPress = () => {
    router.replace('/settings');
  };

  const openKofi = () => {
    Linking.openURL(kofiUrl);
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container}>
        <AnimatedScreenContent>
          <ScrollView contentContainerStyle={styles.content}>
            <SupportButton
              label={t('back')}
              onPress={handleBackPress}
              variant="secondary"
            />

          <View style={styles.card}>
            <Image
              source={require('../assets/kofi_logo.png')}
              resizeMode="contain"
              style={styles.kofiLogo}
            />
            <Text style={[styles.title, isRtl && styles.rtlText]}>
              {t('support.title')}
            </Text>
            <Text style={[styles.message, isRtl && styles.rtlText]}>
              {t('support.message')}
            </Text>
            <Text style={[styles.smallLine, isRtl && styles.rtlText]}>
              {t('support.highlight')}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.kofiButton,
                pressed && styles.kofiButtonPressed,
              ]}
              onPress={openKofi}
            >
              <Image
                source={require('../assets/support_me_on_kofi_beige.png')}
                resizeMode="contain"
                style={styles.kofiButtonImage}
              />
            </Pressable>
            <Text style={[styles.trustText, isRtl && styles.rtlText]}>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 80,
  },
  card: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 28,
    elevation: 4,
    marginTop: 18,
    padding: 24,
    shadowColor: '#6CAFD0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.14,
    shadowRadius: 18,
  },
  kofiLogo: {
    height: 56,
    marginBottom: 16,
    maxWidth: 220,
    width: '62%',
  },
  title: {
    color: '#173B4A',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 14,
    textAlign: 'center',
  },
  message: {
    color: '#24566A',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
  },
  smallLine: {
    color: '#007FB1',
    fontSize: 17,
    fontWeight: 'bold',
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
    maxWidth: 320,
    width: '100%',
  },
  kofiButtonImage: {
    height: 72,
    maxWidth: 320,
    width: '100%',
  },
  kofiButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  trustText: {
    color: '#5E7886',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  button: {
    ...appButtonStyles.primaryButton,
    paddingHorizontal: 24,
    width: '100%',
  },
  buttonPressed: {
    ...appButtonStyles.primaryButtonPressed,
  },
  buttonText: {
    ...appButtonStyles.primaryButtonText,
  },
  secondaryButton: {
    ...appButtonStyles.secondaryButton,
    width: 'auto',
  },
  secondaryButtonText: {
    ...appButtonStyles.secondaryButtonText,
  },
});
