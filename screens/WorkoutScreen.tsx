import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useUserStore } from '../store/useUserStore';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { calcStrengthXP, getMasteryTier } from '../utils/xpCalculator';
import { getTodayString } from '../utils/dateHelpers';
import ExerciseCard from '../components/ExerciseCard';
import AppIcon from '../components/AppIcon';

export default function WorkoutScreen() {
  const navigation = useNavigation<any>();
  const { awardXP, logDayAsWorkout, addWorkoutHistoryEntry, exerciseMastery } = useUserStore();
  const { sessionExercises, updateSets, removeExercise, resetSession } = useWorkoutStore();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  const totalSessionXP = useMemo(() => {
    return sessionExercises.reduce((total, se) => {
      const mastery = exerciseMastery[se.exercise.id];
      const tier = getMasteryTier(mastery?.xp ?? 0);
      const exXP = se.sets.reduce((sum, s) => {
        return sum + calcStrengthXP(1, s.reps, s.weightKg, tier.multiplier);
      }, 0);
      return total + exXP;
    }, 0);
  }, [sessionExercises, exerciseMastery]);

  const handlePickExercise = () => {
    navigation.navigate('ExercisePicker');
  };

  const handleOpenCardio = () => {
    navigation.navigate('CardioLog');
  };

  const handleFinish = () => {
    if (sessionExercises.length === 0) {
      Alert.alert('No exercises', 'Add at least one exercise before finishing.');
      return;
    }

    const workoutDate = getTodayString();
    const workoutId = `${workoutDate}-${Date.now()}`;
    let totalXP = 0;
    const historyExercises = [];

    for (const se of sessionExercises) {
      const mastery = exerciseMastery[se.exercise.id];
      const tier = getMasteryTier(mastery?.xp ?? 0);
      const exXP = se.sets.reduce((sum, s) => {
        return sum + calcStrengthXP(1, s.reps, s.weightKg, tier.multiplier);
      }, 0);
      if (exXP > 0) {
        awardXP(se.exercise.id, se.exercise.name, se.exercise.muscleGroup, exXP);
        totalXP += exXP;
      }

      historyExercises.push({
        exerciseId: se.exercise.id,
        exerciseName: se.exercise.name,
        muscleGroup: se.exercise.muscleGroup,
        xpEarned: exXP,
        sets: se.sets.map(set => ({ reps: set.reps, weightKg: set.weightKg })),
      });
    }

    addWorkoutHistoryEntry({
      id: workoutId,
      date: workoutDate,
      monthKey: workoutDate.slice(0, 7),
      totalXP,
      exerciseCount: historyExercises.length,
      exercises: historyExercises,
    });

    logDayAsWorkout(workoutDate, workoutId);
    setEarnedXP(totalXP);
    setShowLevelUp(true);
    resetSession();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Strength Workout</Text>
        <View style={styles.xpChip}>
          <Text style={styles.xpChipText}>+{totalSessionXP} XP</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {sessionExercises.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <AppIcon name="workout" size={64} color={Colors.textPrimary} />
            </View>
            <Text style={styles.emptyText}>No exercises yet</Text>
            <Text style={styles.emptySubtext}>Tap "Add Exercise" to get started</Text>
          </View>
        )}

        {sessionExercises.map(se => {
          const mastery = exerciseMastery[se.exercise.id];
          const tier = getMasteryTier(mastery?.xp ?? 0);
          return (
            <ExerciseCard
              key={se.exercise.id}
              exerciseId={se.exercise.id}
              exerciseName={se.exercise.name}
              muscleGroup={se.exercise.muscleGroup}
              masteryTier={tier.tier}
              masteryXP={mastery?.xp ?? 0}
              sets={se.sets}
              onSetsChange={sets => updateSets(se.exercise.id, sets)}
              onRemove={() => removeExercise(se.exercise.id)}
            />
          );
        })}

        <TouchableOpacity style={styles.addBtn} onPress={handlePickExercise}>
          <Text style={styles.addBtnTxt}>+ Add Exercise</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardioBtn} onPress={handleOpenCardio}>
          <Text style={styles.cardioBtnTxt}>Log Cardio</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
          <Text style={styles.finishBtnTxt}>{'Finish Workout ' + '\uD83C\uDFC1'}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showLevelUp} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>{'\uD83C\uDF89'}</Text>
            <Text style={styles.modalTitle}>Workout Complete!</Text>
            <Text style={styles.modalXP}>+{earnedXP.toLocaleString()} XP</Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => { setShowLevelUp(false); navigation.goBack(); }}
            >
              <Text style={styles.modalBtnTxt}>Awesome!</Text>
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
  title: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },
  xpChip: {
    backgroundColor: Colors.accentDark,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  xpChipText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  scroll: { padding: 20, paddingBottom: 20 },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  emptyIconWrap: { marginBottom: 16 },
  emptyText: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700' },
  emptySubtext: { color: Colors.textMuted, fontSize: 14, marginTop: 6 },
  addBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderStyle: 'dashed',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  addBtnTxt: { color: Colors.accent, fontWeight: '700', fontSize: 15 },
  cardioBtn: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  cardioBtnTxt: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15 },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  finishBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  finishBtnTxt: { color: Colors.textPrimary, fontWeight: '800', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '80%',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  modalEmoji: { fontSize: 64, marginBottom: 12 },
  modalTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: '900', marginBottom: 8 },
  modalXP: { color: Colors.accent, fontSize: 36, fontWeight: '900', marginBottom: 24 },
  modalBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  modalBtnTxt: { color: Colors.textPrimary, fontWeight: '800', fontSize: 16 },
});
