import { StyleSheet } from 'react-native';

export const appButtonStyles = StyleSheet.create({
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#00AEEF',
    borderRadius: 18,
    elevation: 4,
    height: 52,
    justifyContent: 'center',
    marginTop: 18,
    paddingHorizontal: 28,
    shadowColor: '#0087BD',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  primaryButtonPressed: {
    backgroundColor: '#009DD8',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    includeFontPadding: false,
    letterSpacing: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    elevation: 2,
    height: 42,
    marginTop: 0,
    paddingHorizontal: 16,
    shadowColor: '#6CAFD0',
    shadowOpacity: 0.12,
  },
  secondaryButtonText: {
    color: '#24566A',
    fontSize: 15,
  },
});
