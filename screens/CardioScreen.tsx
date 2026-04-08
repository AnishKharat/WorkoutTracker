import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Modal, TextInput, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { CARDIO_TYPES } from '../constants/exercises';
import { useUserStore } from '../store/useUserStore';
import { calcCardioXP } from '../utils/xpCalculator';
import { getTodayString } from '../utils/dateHelpers';

export default function CardioScreen() {
  const navigation = useNavigation<any>();
  const { awardXP, logDayAsWorkout } = useUserStore();
  const [selectedType, setSelectedType] = useState(CARDIO_TYPES[0]);
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('StrengthActive');
  };

  const handleLog = () => {
    const mins = parseFloat(duration);
    if (!mins || mins <= 0) {
      Alert.alert('Invalid Duration', 'Enter a valid duration in minutes.');
      return;
    }
    const xp = calcCardioXP(mins);
    awardXP(selectedType.id, selectedType.name, 'Cardio', xp);
    logDayAsWorkout(getTodayString(), Date.now().toString());
    setEarnedXP(xp);
    setShowSuccess(true);
    setDuration('');
    setDistance('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cardio</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Log Cardio</Text>
        <Text style={styles.subtitle}>Track your cardio and earn XP</Text>

        {/* Cardio Type Selector */}
        <Text style={styles.sectionLabel}>TYPE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
          {CARDIO_TYPES.map(ct => (
            <TouchableOpacity
              key={ct.id}
              style={[
                styles.typeChip,
                selectedType.id === ct.id && styles.typeChipActive,
              ]}
              onPress={() => setSelectedType(ct)}
            >
              <Text style={styles.typeEmoji}>{ct.emoji}</Text>
              <Text style={[
                styles.typeName,
                selectedType.id === ct.id && styles.typeNameActive,
              ]}>
                {ct.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Duration Input */}
        <Text style={styles.sectionLabel}>DURATION (MINUTES)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="e.g. 30"
          placeholderTextColor={Colors.textDim}
          value={duration}
          onChangeText={setDuration}
        />

        {/* Distance Input (optional) */}
        <Text style={styles.sectionLabel}>DISTANCE (KM) — OPTIONAL</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="e.g. 5.0"
          placeholderTextColor={Colors.textDim}
          value={distance}
          onChangeText={setDistance}
        />

        {/* XP Preview */}
        {duration ? (
          <View style={styles.xpPreview}>
            <Text style={styles.xpPreviewLabel}>Estimated XP</Text>
            <Text style={styles.xpPreviewValue}>
              +{calcCardioXP(parseFloat(duration) || 0).toLocaleString()} XP
            </Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.logBtn} onPress={handleLog}>
          <Text style={styles.logBtnTxt}>Log Cardio Session 🏁</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>{selectedType.emoji}</Text>
            <Text style={styles.modalTitle}>Nice Work!</Text>
            <Text style={styles.modalSub}>{selectedType.name} logged</Text>
            <Text style={styles.modalXP}>+{earnedXP.toLocaleString()} XP</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowSuccess(false)}>
              <Text style={styles.modalBtnTxt}>Let's go! 💪</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  back: { color: Colors.accent, fontSize: 15, fontWeight: '700' },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },
  headerSpacer: { width: 48 },
  scroll: { padding: 20, paddingBottom: 40 },
  title: {
    color: Colors.textPrimary, fontSize: 26, fontWeight: '900', marginBottom: 4,
  },
  subtitle: { color: Colors.textMuted, fontSize: 14, marginBottom: 24 },
  sectionLabel: {
    color: Colors.textMuted, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.5, marginBottom: 10, marginTop: 16,
  },
  typeRow: { flexDirection: 'row', marginBottom: 4 },
  typeChip: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 72,
  },
  typeChipActive: {
    backgroundColor: Colors.accentDark,
    borderColor: Colors.accent,
  },
  typeEmoji: { fontSize: 24, marginBottom: 4 },
  typeName: { color: Colors.textMuted, fontSize: 11, fontWeight: '600' },
  typeNameActive: { color: Colors.textPrimary },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  xpPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  xpPreviewLabel: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  xpPreviewValue: { color: Colors.accent, fontSize: 20, fontWeight: '900' },
  logBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  logBtnTxt: { color: Colors.textPrimary, fontWeight: '800', fontSize: 16 },
  modalOverlay: {
    flex: 1, backgroundColor: Colors.overlay,
    alignItems: 'center', justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: Colors.card, borderRadius: 20,
    padding: 32, alignItems: 'center', width: '80%',
    borderWidth: 1, borderColor: Colors.accent,
  },
  modalEmoji: { fontSize: 64, marginBottom: 8 },
  modalTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: '900', marginBottom: 4 },
  modalSub: { color: Colors.textMuted, fontSize: 14, marginBottom: 8 },
  modalXP: { color: Colors.accent, fontSize: 36, fontWeight: '900', marginBottom: 24 },
  modalBtn: {
    backgroundColor: Colors.accent, borderRadius: 12,
    paddingHorizontal: 32, paddingVertical: 12,
  },
  modalBtnTxt: { color: Colors.textPrimary, fontWeight: '800', fontSize: 16 },
});

