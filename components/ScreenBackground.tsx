import { StyleSheet, View, type ViewProps } from 'react-native';

type ScreenBackgroundProps = ViewProps;

export default function ScreenBackground({
  children,
  style,
  ...props
}: ScreenBackgroundProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.topWash} />
      <View style={styles.bottomWash} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF8FF',
    width: '100%',
  },
  topWash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: '#D9F3FF',
  },
  bottomWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '38%',
    backgroundColor: '#F7FCFF',
  },
});
