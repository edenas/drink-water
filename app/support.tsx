import { router } from 'expo-router';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenBackground from '@/components/ScreenBackground';

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
  const openKofi = () => {
    Linking.openURL(kofiUrl);
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <SupportButton
            label="Back"
            onPress={() => router.back()}
            variant="secondary"
          />

          <View style={styles.card}>
            <Text style={styles.visual}>{'\u2615'}</Text>
            <Text style={styles.title}>Support this app</Text>
            <Text style={styles.message}>
              If you enjoy using Drink Water, you can support the developer and
              help improve the app.
            </Text>
            <Text style={styles.smallLine}>
              Every coffee helps
            </Text>

            <SupportButton label="Support on Ko-fi" onPress={openKofi} />
            <Text style={styles.trustText}>Secure payment via Ko-fi</Text>
          </View>
        </ScrollView>
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
  visual: {
    fontSize: 54,
    marginBottom: 12,
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
  trustText: {
    color: '#5E7886',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  button: {
    backgroundColor: '#00AEEF',
    borderRadius: 18,
    elevation: 4,
    marginTop: 18,
    minHeight: 50,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: '#0087BD',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    width: '100%',
  },
  buttonPressed: {
    backgroundColor: '#009DD8',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0,
    textAlign: 'center',
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    elevation: 2,
    marginTop: 0,
    minHeight: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#6CAFD0',
    shadowOpacity: 0.12,
    width: 'auto',
  },
  secondaryButtonText: {
    color: '#24566A',
    fontSize: 15,
  },
});
