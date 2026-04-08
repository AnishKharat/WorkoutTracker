import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useUserStore } from '../store/useUserStore';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { getLevelProgress } from '../utils/levelCalculator';
import { getMasteryTier } from '../utils/xpCalculator';
import { PRESET_EXERCISES } from '../constants/exercises';
import XPBar from '../components/XPBar';
import RankBadge from '../components/RankBadge';
import { Rank } from '../constants/ranks';
import ExerciseXPBar from '../components/ExerciseXPBar';
import MasteryBadge from '../components/MasteryBadge';

export default function ProfileScreen() {
  const { totalXP, exerciseMastery, customExercises, workoutHistory, resetProgress } = useUserStore();
  const resetSession = useWorkoutStore(state => state.resetSession);
  const levelInfo = useMemo(() => getLevelProgress(totalXP), [totalXP]);

  // Collect all exercises that have mastery data
  const allExercises = [...PRESET_EXERCISES, ...customExercises];
  const masteredExercises = allExercises.filter(e => exerciseMastery[e.id]);
  const monthlyHistory = useMemo(() => {
    const grouped = workoutHistory.reduce<Record<string, typeof workoutHistory>>((acc, workout) => {
      if (!acc[workout.monthKey]) acc[workout.monthKey] = [];
      acc[workout.monthKey].push(workout);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([monthKey, workouts]) => {
        const totalMonthXP = workouts.reduce((sum, workout) => sum + workout.totalXP, 0);
        return {
          monthKey,
          workouts,
          totalMonthXP,
        };
      });
  }, [workoutHistory]);

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress?',
      'This will clear your XP, levels, streak data, muscle map, and workout history. Custom exercises will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            resetSession();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Anish's Stats</Text>

        {/* Rank Card */}
        <View style={styles.rankCard}>
          <View style={styles.rankRow}>
            <View>
              <Text style={styles.levelLabel}>LEVEL {levelInfo.level}</Text>
              <RankBadge emoji={(levelInfo.rank as Rank).emoji} title={(levelInfo.rank as Rank).title} color={(levelInfo.rank as Rank).color} />
            </View>
            <View style={styles.xpTotalBox}>
              <Text style={styles.xpTotalLabel}>Total XP</Text>
              <Text style={styles.xpTotalValue}>{totalXP.toLocaleString()}</Text>
            </View>
          </View>
          <XPBar
            progress={levelInfo.progress}
            currentXP={levelInfo.currentLevelXP}
            requiredXP={levelInfo.nextLevelXP}
            label="Level progress"
          />
        </View>

        {/* Exercise Mastery */}
        <Text style={styles.sectionTitle}>Exercise Mastery</Text>

        {masteredExercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No exercises logged yet</Text>
            <Text style={styles.emptySubtext}>Start training to build mastery!</Text>
          </View>
        ) : (
          masteredExercises
            .sort((a, b) => (exerciseMastery[b.id]?.xp ?? 0) - (exerciseMastery[a.id]?.xp ?? 0))
            .map(exercise => {
              const mastery = exerciseMastery[exercise.id];
              const tier = getMasteryTier(mastery.xp);

              return (
                <View key={exercise.id} style={styles.exerciseCard}>
                  <View style={styles.exerciseHeader}>
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.exerciseGroup}>{exercise.muscleGroup}</Text>
                    </View>
                    <View style={styles.tierInfo}>
                      <MasteryBadge tier={tier.tier} showLabel size={18} />
                    </View>
                  </View>
                  <ExerciseXPBar xp={mastery.xp} tier={tier.tier} />
                  <View style={styles.masteryDetails}>
                    <Text style={styles.masteryXP}>{mastery.xp.toLocaleString()} XP</Text>
                    {mastery.lastLogged && (
                      <Text style={styles.lastLogged}>Last: {mastery.lastLogged}</Text>
                    )}
                  </View>
                </View>
              );
            })
        )}

        <Text style={styles.sectionTitle}>Monthly Workout History</Text>
        {monthlyHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No workout history yet</Text>
            <Text style={styles.emptySubtext}>Finish a workout to start building monthly history.</Text>
          </View>
        ) : (
          monthlyHistory.map(({ monthKey, workouts, totalMonthXP }) => {
            const monthLabel = new Date(`${monthKey}-01T00:00:00`).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            });

            return (
              <View key={monthKey} style={styles.historyMonthCard}>
                <View style={styles.historyMonthHeader}>
                  <View>
                    <Text style={styles.historyMonthTitle}>{monthLabel}</Text>
                    <Text style={styles.historyMonthMeta}>
                      {workouts.length} workout{workouts.length === 1 ? '' : 's'}
                    </Text>
                  </View>
                  <Text style={styles.historyMonthXP}>{totalMonthXP.toLocaleString()} XP</Text>
                </View>

                {workouts.map(workout => (
                  <View key={workout.id} style={styles.historyWorkoutCard}>
                    <View style={styles.historyWorkoutHeader}>
                      <Text style={styles.historyWorkoutDate}>
                        {new Date(`${workout.date}T00:00:00`).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                      <Text style={styles.historyWorkoutXP}>+{workout.totalXP.toLocaleString()} XP</Text>
                    </View>
                    <Text style={styles.historyWorkoutMeta}>
                      {workout.exerciseCount} exercise{workout.exerciseCount === 1 ? '' : 's'}
                    </Text>
                    <Text style={styles.historyWorkoutExercises}>
                      {workout.exercises.map(exercise => exercise.exerciseName).join(' • ')}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })
        )}

        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <TouchableOpacity
          style={styles.resetCard}
          activeOpacity={0.9}
          delayLongPress={700}
          onLongPress={handleResetProgress}
        >
          <Text style={styles.resetTitle}>Reset Progress</Text>
          <Text style={styles.resetBody}>
            Long press, then confirm to clear XP, levels, streaks, heatmap data, and workout history.
          </Text>
          <Text style={styles.resetHint}>Long press to continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '900', marginBottom: 4 },
  subtitle: { color: Colors.textMuted, fontSize: 14, marginBottom: 20 },
  rankCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  levelLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  xpTotalBox: { alignItems: 'flex-end' },
  xpTotalLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '600' },
  xpTotalValue: { color: Colors.accent, fontSize: 24, fontWeight: '900' },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { color: Colors.textMuted, fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: Colors.textDim, fontSize: 13, marginTop: 4 },
  exerciseCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  exerciseInfo: { flex: 1 },
  exerciseName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  exerciseGroup: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  tierInfo: { alignItems: 'flex-end' },
  masteryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  masteryXP: { color: Colors.accent, fontSize: 12, fontWeight: '700' },
  lastLogged: { color: Colors.textDim, fontSize: 11 },
  historyMonthCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyMonthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  historyMonthTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  historyMonthMeta: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  historyMonthXP: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '800',
  },
  historyWorkoutCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyWorkoutDate: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  historyWorkoutXP: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  historyWorkoutMeta: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  historyWorkoutExercises: {
    color: Colors.textPrimary,
    fontSize: 12,
    lineHeight: 18,
  },
  resetCard: {
    backgroundColor: 'rgba(229, 57, 53, 0.08)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 57, 53, 0.45)',
    marginTop: 4,
  },
  resetTitle: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  resetBody: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  resetHint: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
  },
});
