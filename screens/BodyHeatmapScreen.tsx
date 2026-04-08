import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useUserStore } from '../store/useUserStore';
import BodyFront from '../components/BodyFrontHuman';
import BodyBack from '../components/BodyBackHuman';
import MuscleTooltip from '../components/MuscleTooltip';

/**
 * Maps exercise muscle groups → specific SVG muscle region names used by BodyFront/BodyBack.
 * Each exercise group XP is distributed to the listed muscle regions.
 */
const GROUP_TO_REGIONS: Record<string, string[]> = {
  Chest:     ['Chest'],
  Back:      ['Lats', 'Rhomboids', 'Lower Back', 'Traps', 'Rear Delts'],
  Shoulders: ['Shoulders', 'Traps', 'Rear Delts'],
  Legs:      ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
  Arms:      ['Biceps', 'Triceps'],
  Core:      ['Abs'],
  Cardio:    [],
};

interface RegionData {
  xp: number;
  lastTrained?: string;
}

export default function BodyHeatmapScreen() {
  const { muscleGroupXP } = useUserStore();
  const [view, setView] = useState<'front' | 'back'>('front');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Build a flat Record<regionName, {xp, lastTrained}> for the SVG components
  const muscleXP = useMemo<Record<string, RegionData>>(() => {
    const result: Record<string, RegionData> = {};
    for (const [group, data] of Object.entries(muscleGroupXP)) {
      const regions = GROUP_TO_REGIONS[group] ?? [];
      for (const region of regions) {
        const existing = result[region];
        if (!existing) {
          result[region] = { xp: data.xp, lastTrained: data.lastTrained };
        } else {
          // Accumulate XP, use latest date
          const xp = existing.xp + data.xp;
          const candidates = [existing.lastTrained, data.lastTrained].filter((v): v is string => !!v);
          const lastTrained: string | undefined = candidates.sort().reverse()[0];
          result[region] = { xp, lastTrained };
        }
      }
    }
    return result;
  }, [muscleGroupXP]);

  const handleMusclePress = (muscle: string) => {
    setSelectedMuscle(muscle);
    setTooltipVisible(true);
  };

  const selectedMuscleData = selectedMuscle ? (muscleXP[selectedMuscle] ?? { xp: 0 }) : null;

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Body Heatmap</Text>
        <Text style={styles.subtitle}>Your muscle training intensity</Text>

        {/* Toggle */}
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, view === 'front' && styles.toggleBtnActive]}
            onPress={() => setView('front')}
          >
            <Text style={[styles.toggleTxt, view === 'front' && styles.toggleTxtActive]}>
              Front
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, view === 'back' && styles.toggleBtnActive]}
            onPress={() => setView('back')}
          >
            <Text style={[styles.toggleTxt, view === 'back' && styles.toggleTxtActive]}>
              Back
            </Text>
          </TouchableOpacity>
        </View>

        {/* SVG Body */}
        <View style={styles.svgContainer}>
          {view === 'front' ? (
            <BodyFront muscleXP={muscleXP} onMusclePress={handleMusclePress} />
          ) : (
            <BodyBack muscleXP={muscleXP} onMusclePress={handleMusclePress} />
          )}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Intensity Scale</Text>
          <View style={styles.legendRow}>
            {['Untrained', 'Beginner', 'Active', 'Strong', 'Elite'].map((label, i) => {
              const colors = ['#2A2A2A', '#5C1A1A', '#9B2222', '#D32F2F', '#FF1744'];
              return (
                <View key={label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors[i] }]} />
                  <Text style={styles.legendLabel}>{label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Muscle group XP summary */}
        <Text style={styles.sectionTitle}>Muscle XP Breakdown</Text>
        {Object.entries(muscleGroupXP).length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No training data yet.</Text>
            <Text style={styles.emptySubtext}>Log workouts to light up your body map!</Text>
          </View>
        ) : (
          Object.entries(muscleGroupXP)
            .sort((a, b) => b[1].xp - a[1].xp)
            .map(([group, data]) => (
              <View key={group} style={styles.groupRow}>
                <Text style={styles.groupName}>{group}</Text>
                <Text style={styles.groupXP}>{data.xp.toLocaleString()} XP</Text>
                {data.lastTrained && (
                  <Text style={styles.groupDate}>Last: {data.lastTrained}</Text>
                )}
              </View>
            ))
        )}
      </ScrollView>

      {/* Muscle Tooltip */}
      {selectedMuscle && selectedMuscleData && (
        <MuscleTooltip
          visible={tooltipVisible}
          muscle={selectedMuscle}
          xp={selectedMuscleData.xp}
          lastTrained={selectedMuscleData.lastTrained}
          onClose={() => setTooltipVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '900', marginBottom: 4 },
  subtitle: { color: Colors.textMuted, fontSize: 14, marginBottom: 20 },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: Colors.accent },
  toggleTxt: { color: Colors.textMuted, fontWeight: '700', fontSize: 14 },
  toggleTxtActive: { color: Colors.textPrimary },
  svgContainer: {
    alignItems: 'center',
    marginBottom: 20,
    height: 320,
    width: '100%',
  },
  legend: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legendTitle: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between' },
  legendItem: { alignItems: 'center', gap: 4 },
  legendDot: { width: 18, height: 18, borderRadius: 4 },
  legendLabel: { color: Colors.textMuted, fontSize: 9 },
  sectionTitle: {
    color: Colors.textPrimary, fontSize: 16, fontWeight: '800',
    marginBottom: 12,
  },
  emptyState: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: Colors.textMuted, fontSize: 15, fontWeight: '600' },
  emptySubtext: { color: Colors.textDim, fontSize: 13, marginTop: 4 },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  groupName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700', flex: 1 },
  groupXP: { color: Colors.accent, fontSize: 13, fontWeight: '700' },
  groupDate: { color: Colors.textDim, fontSize: 11 },
});
