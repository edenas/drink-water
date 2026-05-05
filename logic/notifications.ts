import Constants from 'expo-constants';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

const isAndroidExpoGo =
  Platform.OS === 'android' && Constants.appOwnership === 'expo';

export const canUseLocalNotifications =
  Platform.OS !== 'web' && !isAndroidExpoGo;

let notificationsModule: NotificationsModule | null = null;

export const getNotificationsModule = () => {
  if (!canUseLocalNotifications) {
    return null;
  }

  if (notificationsModule === null) {
    notificationsModule = require('expo-notifications');
  }

  return notificationsModule;
};
