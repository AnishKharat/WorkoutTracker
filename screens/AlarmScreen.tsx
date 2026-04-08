import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, Modal, TextInput, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import {
  Alarm,
  cancelAlarmNotifications,
  requestNotificationPermission,
  scheduleAlarmNotifications,
} from '../utils/notificationScheduler';
import { formatTime } from '../utils/dateHelpers';

const ALARMS_KEY = 'workout_alarms';
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateId() {
  return `alarm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeAlarm(alarm: Alarm): Alarm {
  return {
    ...alarm,
    notificationIds: Array.isArray(alarm.notificationIds) ? alarm.notificationIds : [],
  };
}

function getNextFireTime(alarm: Alarm): string {
  const now = new Date();
  const [h, m] = alarm.time.split(':').map(Number);
  for (let i = 0; i < 7; i++) {
    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + i);
    candidate.setHours(h, m, 0, 0);
    const dow = candidate.getDay();
    if (alarm.days.includes(dow) && candidate > now) {
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_LABELS[dow];
      return `Next: ${label} at ${formatTime(alarm.time)}`;
    }
  }
  return `Next: ${formatTime(alarm.time)}`;
}

export default function AlarmScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Alarm | null>(null);

  const [label, setLabel] = useState('');
  const [timeHour, setTimeHour] = useState('18');
  const [timeMin, setTimeMin] = useState('00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  useEffect(() => {
    loadAlarms();
  }, []);

  const loadAlarms = async () => {
    const raw = await AsyncStorage.getItem(ALARMS_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw) as Alarm[];
    setAlarms(parsed.map(normalizeAlarm));
  };

  const saveAlarms = async (updated: Alarm[]) => {
    const normalized = updated.map(normalizeAlarm);
    setAlarms(normalized);
    await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(normalized));
  };

  const openModal = (alarm?: Alarm) => {
    if (alarm) {
      setEditing(alarm);
      setLabel(alarm.label);
      const [h, m] = alarm.time.split(':');
      setTimeHour(h);
      setTimeMin(m);
      setSelectedDays([...alarm.days]);
    } else {
      setEditing(null);
      setLabel('');
      setTimeHour('18');
      setTimeMin('00');
      setSelectedDays([1, 2, 3, 4, 5]);
    }
    setModalVisible(true);
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (selectedDays.length === 0) {
      Alert.alert('Select Days', 'Pick at least one day for this alarm.');
      return;
    }

    const h = timeHour.padStart(2, '0');
    const m = timeMin.padStart(2, '0');
    const time = `${h}:${m}`;

    const baseAlarm: Alarm = {
      id: editing?.id ?? generateId(),
      label: label || 'Workout',
      time,
      days: [...selectedDays].sort(),
      enabled: editing?.enabled ?? true,
      notificationIds: [],
    };

    if (baseAlarm.enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('Permissions', 'Notification permission required for alarms.');
        return;
      }
    }

    if (editing?.notificationIds?.length) {
      await cancelAlarmNotifications(editing.notificationIds);
    }

    const notificationIds = baseAlarm.enabled
      ? await scheduleAlarmNotifications(baseAlarm)
      : [];

    const finalAlarm: Alarm = {
      ...baseAlarm,
      notificationIds,
    };

    const updated = editing
      ? alarms.map(a => (a.id === editing.id ? finalAlarm : a))
      : [...alarms, finalAlarm];

    await saveAlarms(updated);
    setModalVisible(false);
  };

  const toggleAlarm = async (alarmId: string) => {
    const target = alarms.find(a => a.id === alarmId);
    if (!target) return;

    if (target.enabled) {
      await cancelAlarmNotifications(target.notificationIds ?? []);
      const updated = alarms.map(a =>
        a.id === alarmId ? { ...a, enabled: false, notificationIds: [] } : a
      );
      await saveAlarms(updated);
      return;
    }

    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert('Permissions', 'Notification permission required for alarms.');
      return;
    }

    const notificationIds = await scheduleAlarmNotifications(target);
    const updated = alarms.map(a =>
      a.id === alarmId ? { ...a, enabled: true, notificationIds } : a
    );
    await saveAlarms(updated);
  };

  const deleteAlarm = (alarmId: string) => {
    Alert.alert('Delete Alarm', 'Remove this alarm?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const target = alarms.find(a => a.id === alarmId);
          if (target?.notificationIds?.length) {
            await cancelAlarmNotifications(target.notificationIds);
          }
          const updated = alarms.filter(a => a.id !== alarmId);
          await saveAlarms(updated);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Workout Alarms</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
          <Text style={styles.addBtnTxt}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {alarms.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>{'\u23F0'}</Text>
          <Text style={styles.emptyText}>No alarms yet</Text>
          <Text style={styles.emptySub}>Tap "+ Add" to create your first workout alarm</Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={a => a.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.alarmCard}>
              <TouchableOpacity
                style={styles.alarmMainPress}
                activeOpacity={0.85}
                onPress={() => openModal(item)}
              >
                <View style={styles.alarmLeft}>
                  <Text style={[styles.alarmTime, !item.enabled && styles.dimmed]}>
                    {formatTime(item.time)}
                  </Text>
                  <Text style={[styles.alarmLabel, !item.enabled && styles.dimmed]}>
                    {item.label}
                  </Text>
                  <Text style={styles.alarmDays}>
                    {item.days.map(d => DAY_LABELS[d]).join(' • ')}
                  </Text>
                  <Text style={styles.alarmNext}>{getNextFireTime(item)}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.alarmRight}>
                <Switch
                  value={item.enabled}
                  onValueChange={() => toggleAlarm(item.id)}
                  trackColor={{ false: Colors.border, true: Colors.accent }}
                  thumbColor={Colors.textPrimary}
                />
                <TouchableOpacity onPress={() => deleteAlarm(item.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteTxt}>{'\uD83D\uDDD1\uFE0F'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'Edit Alarm' : 'New Alarm'}</Text>

            <Text style={styles.modalLabel}>LABEL</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Evening Lift"
              placeholderTextColor={Colors.textDim}
              value={label}
              onChangeText={setLabel}
            />

            <Text style={styles.modalLabel}>TIME</Text>
            <View style={styles.timeRow}>
              <TextInput
                style={[styles.modalInput, styles.timeInput]}
                keyboardType="numeric"
                maxLength={2}
                placeholder="18"
                placeholderTextColor={Colors.textDim}
                value={timeHour}
                onChangeText={setTimeHour}
              />
              <Text style={styles.timeSep}>:</Text>
              <TextInput
                style={[styles.modalInput, styles.timeInput]}
                keyboardType="numeric"
                maxLength={2}
                placeholder="00"
                placeholderTextColor={Colors.textDim}
                value={timeMin}
                onChangeText={setTimeMin}
              />
            </View>

            <Text style={styles.modalLabel}>DAYS</Text>
            <View style={styles.dayGrid}>
              {DAY_LABELS.map((d, i) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayBtn, selectedDays.includes(i) && styles.dayBtnActive]}
                  onPress={() => toggleDay(i)}
                >
                  <Text style={[styles.dayTxt, selectedDays.includes(i) && styles.dayTxtActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnTxt}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
  },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '900' },
  addBtn: {
    backgroundColor: Colors.accent, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  addBtnTxt: { color: Colors.textPrimary, fontWeight: '800', fontSize: 14 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyText: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700' },
  emptySub: { color: Colors.textMuted, fontSize: 14, marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  alarmCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14, padding: 16,
    marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  alarmMainPress: { flex: 1 },
  alarmLeft: { flex: 1 },
  alarmTime: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800' },
  alarmLabel: { color: Colors.accent, fontSize: 14, fontWeight: '700', marginTop: 2 },
  alarmDays: { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
  alarmNext: { color: Colors.textDim, fontSize: 11, marginTop: 2 },
  dimmed: { opacity: 0.4 },
  alarmRight: { alignItems: 'center', gap: 8 },
  deleteBtn: { padding: 4 },
  deleteTxt: { fontSize: 18 },
  modalOverlay: {
    flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 44,
    borderWidth: 1, borderColor: Colors.border,
  },
  modalTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '900', marginBottom: 20 },
  modalLabel: {
    color: Colors.textMuted, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.5, marginBottom: 8, marginTop: 16,
  },
  modalInput: {
    backgroundColor: Colors.background, borderRadius: 10, color: Colors.textPrimary,
    fontSize: 16, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeInput: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '700' },
  timeSep: { color: Colors.textPrimary, fontSize: 24, fontWeight: '700' },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
  },
  dayBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  dayTxt: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  dayTxtActive: { color: Colors.textPrimary },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingVertical: 14, alignItems: 'center',
  },
  cancelBtnTxt: { color: Colors.textMuted, fontWeight: '700', fontSize: 15 },
  saveBtn: {
    flex: 2, borderRadius: 12, backgroundColor: Colors.accent,
    paddingVertical: 14, alignItems: 'center',
  },
  saveBtnTxt: { color: Colors.textPrimary, fontWeight: '800', fontSize: 15 },
});
