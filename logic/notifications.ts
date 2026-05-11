import { Platform } from 'react-native';

import type { NotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import type { NotificationPermissionsStatus } from 'expo-notifications/build/NotificationPermissions.types';

type LocalNotificationsModule = {
  cancelAllScheduledNotificationsAsync: () => Promise<void>;
  getAllScheduledNotificationsAsync: () => Promise<
    Array<{
      identifier: string;
      trigger: unknown;
    }>
  >;
  getPermissionsAsync: () => Promise<NotificationPermissionsStatus>;
  requestPermissionsAsync: () => Promise<NotificationPermissionsStatus>;
  scheduleNotificationAsync: (request: {
    content: {
      body: string;
      title: string;
    };
    trigger: {
      channelId?: string;
      date: Date;
      type: 'date';
    };
  }) => Promise<string>;
  setNotificationChannelAsync: (
    channelId: string,
    channel: {
      importance: number;
      name: string;
    }
  ) => Promise<unknown>;
  setNotificationHandler: (handler: NotificationHandler | null) => void;
};

export const notificationsEnabledStorageKey = 'notificationsEnabled';
export const notificationHoursStorageKey = 'notificationHours';
export const notificationMinutesStorageKey = 'notificationMinutes';
export const notificationStartTimeStorageKey = 'notificationStartTime';
export const notificationEndTimeStorageKey = 'notificationEndTime';
export const defaultNotificationStartTime = '07:00';
export const defaultNotificationEndTime = '20:00';
const waterReminderChannelId = 'water-reminders';
const maxScheduledWaterReminders = 64;

export const canUseLocalNotifications = Platform.OS !== 'web';

let notificationsModule: LocalNotificationsModule | null = null;

const getDefaultExport = <T,>(moduleExports: { default: T } | T) =>
  'default' in Object(moduleExports)
    ? (moduleExports as { default: T }).default
    : (moduleExports as T);

export const getNotificationsModule = () => {
  if (!canUseLocalNotifications) {
    return null;
  }

  if (notificationsModule === null) {
    const notificationPermissions = require('expo-notifications/build/NotificationPermissions');

    notificationsModule = {
      cancelAllScheduledNotificationsAsync: getDefaultExport(
        require('expo-notifications/build/cancelAllScheduledNotificationsAsync')
      ),
      getAllScheduledNotificationsAsync: getDefaultExport(
        require('expo-notifications/build/getAllScheduledNotificationsAsync')
      ),
      getPermissionsAsync: notificationPermissions.getPermissionsAsync,
      requestPermissionsAsync: notificationPermissions.requestPermissionsAsync,
      scheduleNotificationAsync: getDefaultExport(
        require('expo-notifications/build/scheduleNotificationAsync')
      ),
      setNotificationChannelAsync: getDefaultExport(
        require('expo-notifications/build/setNotificationChannelAsync')
      ),
      setNotificationHandler:
        require('expo-notifications/build/NotificationsHandler')
          .setNotificationHandler,
    };
  }

  return notificationsModule;
};

export const parseReminderTime = (time: string) => {
  const [hoursText, minutesText] = time.split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
};

export const formatReminderTimeInput = (value: string) => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
  const hoursText = digitsOnly.slice(0, 2);
  const minutesText = digitsOnly.slice(2, 4);

  if (digitsOnly.length <= 2) {
    return hoursText;
  }

  return `${hoursText}:${minutesText}`;
};

export const normalizeReminderTime = (
  value: string,
  fallbackTime: string
) => {
  const parsedTime = parseReminderTime(value);

  if (parsedTime === null) {
    return fallbackTime;
  }

  const hours = Math.floor(parsedTime / 60);
  const minutes = parsedTime % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const getDateAtMinutes = (baseDate: Date, minutesFromMidnight: number) => {
  const date = new Date(baseDate);

  date.setHours(Math.floor(minutesFromMidnight / 60), minutesFromMidnight % 60, 0, 0);

  return date;
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);

  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
};

const getNextActiveStartDate = (now: Date, startMinutes: number) => {
  const todayStart = getDateAtMinutes(now, startMinutes);

  if (now < todayStart) {
    return todayStart;
  }

  return addDays(todayStart, 1);
};

const getScheduledReminderDates = ({
  endMinutes,
  intervalSeconds,
  now,
  startMinutes,
}: {
  endMinutes: number;
  intervalSeconds: number;
  now: Date;
  startMinutes: number;
}) => {
  const reminderDates: Date[] = [];
  const intervalMilliseconds = intervalSeconds * 1000;
  const nowMinutes =
    now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const todayEnd = getDateAtMinutes(now, endMinutes);
  let nextReminderDate: Date;

  if (nowMinutes >= startMinutes && now < todayEnd) {
    const intervalReminderDate = new Date(now.getTime() + intervalMilliseconds);

    nextReminderDate =
      intervalReminderDate <= todayEnd
        ? intervalReminderDate
        : getNextActiveStartDate(now, startMinutes);
  } else {
    nextReminderDate = getNextActiveStartDate(now, startMinutes);
  }

  while (reminderDates.length < maxScheduledWaterReminders) {
    const activeEndDate = getDateAtMinutes(nextReminderDate, endMinutes);

    if (nextReminderDate > activeEndDate) {
      nextReminderDate = addDays(getDateAtMinutes(nextReminderDate, startMinutes), 1);
      continue;
    }

    reminderDates.push(nextReminderDate);

    const intervalReminderDate = new Date(
      nextReminderDate.getTime() + intervalMilliseconds
    );

    nextReminderDate =
      intervalReminderDate <= activeEndDate
        ? intervalReminderDate
        : addDays(getDateAtMinutes(nextReminderDate, startMinutes), 1);
  }

  return reminderDates;
};

export const ensureWaterReminderNotificationChannel = async (
  Notifications: LocalNotificationsModule
) => {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(waterReminderChannelId, {
    name: 'Water reminders',
    importance: 5,
  });

  if (__DEV__) {
    console.log('[DrinkWater] Android notification channel created:', {
      channelId: waterReminderChannelId,
    });
  }
};

export const requestWaterReminderNotificationPermission = async (
  Notifications: LocalNotificationsModule
) => {
  await ensureWaterReminderNotificationChannel(Notifications);

  const currentPermission = await Notifications.getPermissionsAsync();

  if (__DEV__) {
    console.log('[DrinkWater] Notification permission before request:', {
      status: currentPermission.status,
      granted: currentPermission.granted,
    });
  }

  const permission = currentPermission.granted
    ? currentPermission
    : await Notifications.requestPermissionsAsync();

  if (__DEV__) {
    console.log('[DrinkWater] Notification permission after request:', {
      status: permission.status,
      granted: permission.granted,
    });
  }

  return permission.granted;
};

type ScheduleWaterReminderNotificationsParams = {
  body: string;
  endTime: string;
  intervalSeconds: number;
  startTime: string;
  title: string;
};

export const scheduleWaterReminderNotifications = async ({
  body,
  endTime,
  intervalSeconds,
  startTime,
  title,
}: ScheduleWaterReminderNotificationsParams) => {
  if (!canUseLocalNotifications || intervalSeconds < 60) {
    return true;
  }

  const Notifications = getNotificationsModule();

  if (Notifications === null) {
    return true;
  }

  const startMinutes = parseReminderTime(startTime);
  const endMinutes = parseReminderTime(endTime);

  await Notifications.cancelAllScheduledNotificationsAsync();

  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return false;
  }

  await ensureWaterReminderNotificationChannel(Notifications);

  const reminderDates = getScheduledReminderDates({
    endMinutes,
    intervalSeconds,
    now: new Date(),
    startMinutes,
  });

  if (__DEV__) {
    console.log(
      '[DrinkWater] Scheduling water reminders:',
      reminderDates.map((date) => date.toLocaleString())
    );
  }

  for (const reminderDate of reminderDates) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: {
        type: 'date',
        date: reminderDate,
        channelId: waterReminderChannelId,
      },
    });
  }

  if (__DEV__) {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    console.log(
      '[DrinkWater] Scheduled notification requests:',
      scheduledNotifications.map((notification) => ({
        identifier: notification.identifier,
        trigger: notification.trigger,
      }))
    );
  }

  return true;
};
