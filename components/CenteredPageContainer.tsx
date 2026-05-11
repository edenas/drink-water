import { StyleSheet, View, type ViewProps } from 'react-native';

export const centeredPageMaxWidth = 460;

type CenteredPageContainerProps = ViewProps;

export default function CenteredPageContainer({
  children,
  style,
  ...props
}: CenteredPageContainerProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    maxWidth: centeredPageMaxWidth,
    width: '100%',
  },
});
