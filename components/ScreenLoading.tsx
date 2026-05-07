import { ActivityIndicator, StyleSheet, View } from 'react-native';

import ScreenBackground from '@/components/ScreenBackground';

export default function ScreenLoading() {
  return (
    <ScreenBackground style={styles.background}>
      <View style={styles.content}>
        <ActivityIndicator color="#00AEEF" size="large" />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
});
