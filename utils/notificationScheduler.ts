import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const ANDROID_CHANNEL_ID = 'workout-reminders';
const MORNING_CHECK_KIND = 'morning-check';

export interface Alarm {
  id: string;
  label: string;
  time: string;
  days: number[];
  enabled: boolean;
  notificationIds?: string[];
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Workout Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#E53935',
  });
}

function hasGrantedPermission(status: Notifications.NotificationPermissionsStatus['status']): boolean {
  return status === 'granted';
}

export async function requestNotificationPermission(): Promise<boolean> {
  await ensureNotificationChannel();

  const existing = await Notifications.getPermissionsAsync();
  if (hasGrantedPermission(existing.status)) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return hasGrantedPermission(requested.status);
}

export async function scheduleAlarmNotifications(alarm: Alarm): Promise<string[]> {
  await ensureNotificationChannel();

  const [hourStr, minStr] = alarm.time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);

  const warningMinute = minute - 15;
  const warningHour = warningMinute < 0 ? hour - 1 : hour;
  const adjustedWarningMinute = warningMinute < 0 ? warningMinute + 60 : warningMinute;

  const notificationIds: string[] = [];

  for (const day of alarm.days) {
    const weekday = (day === 0 ? 1 : day + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
    let warningWeekday = weekday;
    let finalWarningHour = warningHour;

    if (finalWarningHour < 0) {
      finalWarningHour += 24;
      warningWeekday = (weekday === 1 ? 7 : weekday - 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
    }

    const warningId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Workout in 15 minutes ' + '\uD83D\uDCAA',
        body: `Get ready - ${alarm.label || 'your workout'} starts soon`,
        sound: 'default',
        data: {
          screen: 'WorkoutStack',
          kind: 'alarm-warning',
          alarmId: alarm.id,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: warningWeekday,
        hour: finalWarningHour,
        minute: adjustedWarningMinute,
      },
    });

    const alarmId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to train ' + '\uD83D\uDD25',
        body: "Don't break the streak. Let's go.",
        sound: 'default',
        data: {
          screen: 'WorkoutStack',
          kind: 'alarm-main',
          alarmId: alarm.id,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
      },
    });

    notificationIds.push(warningId, alarmId);
  }

  return notificationIds;
}

export async function cancelAlarmNotifications(notificationIds: string[] = []): Promise<void> {
  await Promise.all(
    notificationIds.map(id => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined))
  );
}

export async function scheduleMorningCheck(): Promise<void> {
  await ensureNotificationChannel();

  const permission = await Notifications.getPermissionsAsync();
  if (!hasGrantedPermission(permission.status)) {
    return;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const alreadyScheduled = scheduled.some(notification => {
    const data = notification.content.data as { kind?: string } | undefined;
    return data?.kind === MORNING_CHECK_KIND;
  });

  if (alreadyScheduled) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Morning check ' + '\uD83C\uDF05',
      body: "Don't forget to log your workout today!",
      sound: 'default',
      data: {
        kind: MORNING_CHECK_KIND,
        screen: 'WorkoutStack',
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    },
  });
}
