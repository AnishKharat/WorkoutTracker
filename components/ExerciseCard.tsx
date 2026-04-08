import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import MasteryBadge from './MasteryBadge';
import ExerciseXPBar from './ExerciseXPBar';
import { SetEntry } from '../store/useWorkoutStore';

interface Props {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  masteryTier: number;
  masteryXP: number;
  sets: SetEntry[];
  onSetsChange: (sets: SetEntry[]) => void;
  onRemove: () => void;
}

export default function ExerciseCard({
  exerciseId,
  exerciseName,
  muscleGroup,
  masteryTier,
  masteryXP,
  sets,
  onSetsChange,
  onRemove,
}: Props) {
  const updateSet = (index: number, field: 'reps' | 'weightKg', value: string) => {
    const newSets = sets.map((s, i) =>
      i === index ? { ...s, [field]: parseFloat(value) || 0 } : s
    );
    onSetsChange(newSets);
  };

  const addSet = () => onSetsChange([...sets, { reps: 0, weightKg: 0 }]);
  const removeSet = (index: number) => onSetsChange(sets.filter((_, i) => i !== index));

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{exerciseName}</Text>
          <Text style={styles.group}>{muscleGroup}</Text>
        </View>
        <MasteryBadge tier={masteryTier} showLabel={false} size={22} />
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <Text style={styles.removeTxt}>✕</Text>
        </TouchableOpacity>
      </View>

      <ExerciseXPBar xp={masteryXP} tier={masteryTier} />

      {/* Column headers */}
      <View style={styles.setHeader}>
        <Text style={[styles.setCol, { width: 32 }]}>#</Text>
        <Text style={[styles.setCol, { flex: 1 }]}>Reps</Text>
        <Text style={[styles.setCol, { flex: 1 }]}>Weight (kg)</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Sets */}
      {sets.map((s, i) => (
        <View key={i} style={styles.setRow}>
          <Text style={[styles.setNum, { width: 32 }]}>{i + 1}</Text>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            keyboardType="numeric"
            value={s.reps > 0 ? String(s.reps) : ''}
            placeholder="0"
            placeholderTextColor={Colors.textDim}
            onChangeText={v => updateSet(i, 'reps', v)}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            keyboardType="numeric"
            value={s.weightKg > 0 ? String(s.weightKg) : ''}
            placeholder="0"
            placeholderTextColor={Colors.textDim}
            onChangeText={v => updateSet(i, 'weightKg', v)}
          />
          <TouchableOpacity onPress={() => removeSet(i)} style={styles.delSet}>
            <Text style={styles.delTxt}>−</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity onPress={addSet} style={styles.addSetBtn}>
        <Text style={styles.addSetTxt}>+ Add Set</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  group: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  removeBtn: { padding: 4 },
  removeTxt: { color: Colors.textMuted, fontSize: 16 },
  setHeader: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 4,
  },
  setCol: {
    color: Colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  setNum: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 7,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  delSet: { width: 28, alignItems: 'center' },
  delTxt: { color: Colors.textMuted, fontSize: 20, lineHeight: 22 },
  addSetBtn: {
    marginTop: 10,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addSetTxt: { color: Colors.accent, fontWeight: '700', fontSize: 14 },
});
