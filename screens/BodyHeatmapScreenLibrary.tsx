import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Body, { ExtendedBodyPart, Slug } from 'react-native-body-highlighter';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { useUserStore } from '../store/useUserStore';
import MuscleTooltip from '../components/MuscleTooltip';
import { getMuscleColour, shouldGlow, trainedToday } from '../utils/muscleHeatmap';

const GROUP_TO_PARTS: Record<string, Slug[]> = {
  Chest: ['chest'],
  Back: ['upper-back', 'lower-back', 'trapezius', 'neck'],
  Shoulders: ['deltoids', 'trapezius', 'neck'],
  Legs: ['quadriceps', 'hamstring', 'gluteal', 'calves', 'adductors', 'tibialis', 'knees', 'ankles', 'feet'],
  Arms: ['biceps', 'triceps', 'forearm', 'hands'],
  Core: ['abs', 'obliques'],
  Cardio: [],
};

interface PartData {
  xp: number;
  lastTrained?: string;
}

const PART_LABELS: Partial<Record<Slug, string>> = {
  abs: 'Abs',
  adductors: 'Adductors',
  ankles: 'Ankles',
  biceps: 'Biceps',
  calves: 'Calves',
  chest: 'Chest',
  deltoids: 'Deltoids',
  feet: 'Feet',
  forearm: 'Forearms',
  gluteal: 'Glutes',
  hamstring: 'Hamstrings',
  hands: 'Hands',
  knees: 'Knees',
  'lower-back': 'Lower Back',
  neck: 'Neck',
  obliques: 'Obliques',
  quadriceps: 'Quadriceps',
  tibialis: 'Tibialis',
  trapezius: 'Trapezius',
  triceps: 'Triceps',
  'upper-back': 'Upper Back',
};

function PulseOverlay({
  data,
  side,
  duration,
  minOpacity,
  maxOpacity,
}: {
  data: ExtendedBodyPart[];
  side: 'front' | 'back';
  duration: number;
  minOpacity: number;
  maxOpacity: number;
}) {
  const opacity = useSharedValue(minOpacity);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(maxOpacity, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [duration, maxOpacity, minOpacity, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (data.length === 0) return null;

  return (
    <Animated.View style={[styles.pulseOverlay, animatedStyle]} pointerEvents="none">
      <Body
        data={data}
        gender="male"
        side={side}
        scale={1.15}
        border="none"
        defaultFill="transparent"
        defaultStroke="transparent"
        defaultStrokeWidth={0}
      />
    </Animated.View>
  );
}

export default function BodyHeatmapScreenLibrary() {
  const { muscleGroupXP } = useUserStore();
  const [view, setView] = useState<'front' | 'back'>('front');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const partXP = useMemo<Record<string, PartData>>(() => {
    const result: Record<string, PartData> = {};

    for (const [group, data] of Object.entries(muscleGroupXP)) {
      const parts = GROUP_TO_PARTS[group] ?? [];

      for (const part of parts) {
        const existing = result[part];
        if (!existing) {
          result[part] = { xp: data.xp, lastTrained: data.lastTrained };
        } else {
          const xp = existing.xp + data.xp;
          const candidates = [existing.lastTrained, data.lastTrained].filter((value): value is string => !!value);
          const lastTrained = candidates.sort().reverse()[0];
          result[part] = { xp, lastTrained };
        }
      }
    }

    return result;
  }, [muscleGroupXP]);

  const bodyData = useMemo<ExtendedBodyPart[]>(() => {
    return Object.entries(partXP).map(([slug, data]) => ({
      slug: slug as Slug,
      color: getMuscleColour(data.xp),
    }));
  }, [partXP]);

  const recentGlowData = useMemo<ExtendedBodyPart[]>(() => {
    return Object.entries(partXP)
      .filter(([, data]) => shouldGlow(data.lastTrained) && !trainedToday(data.lastTrained))
      .map(([slug]) => ({
        slug: slug as Slug,
        styles: {
          fill: 'rgba(255, 87, 34, 0.16)',
          stroke: 'rgba(255, 122, 69, 0.95)',
          strokeWidth: 2.6,
        },
      }));
  }, [partXP]);

  const todayGlowData = useMemo<ExtendedBodyPart[]>(() => {
    return Object.entries(partXP)
      .filter(([, data]) => trainedToday(data.lastTrained))
      .map(([slug]) => ({
        slug: slug as Slug,
        styles: {
          fill: 'rgba(255, 23, 68, 0.22)',
          stroke: 'rgba(255, 94, 98, 1)',
          strokeWidth: 3.2,
        },
      }));
  }, [partXP]);

  const handlePartPress = (bodyPart: ExtendedBodyPart, side?: 'left' | 'right') => {
    if (!bodyPart.slug) return;
    setSelectedPart(side ? `${bodyPart.slug}:${side}` : bodyPart.slug);
    setTooltipVisible(true);
  };

  const selectedPartData = useMemo(() => {
    if (!selectedPart) return null;
    const slug = selectedPart.split(':')[0];
    return partXP[slug] ?? null;
  }, [partXP, selectedPart]);

  const selectedPartLabel = useMemo(() => {
    if (!selectedPart) return null;
    const [slug, side] = selectedPart.split(':');
    const label = PART_LABELS[slug as Slug] ?? slug.replace(/-/g, ' ');
    return side ? `${label} (${side})` : label;
  }, [selectedPart]);

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Body Heatmap</Text>
        <Text style={styles.subtitle}>Your muscle training intensity</Text>

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

        <View style={styles.svgContainer}>
          <View style={styles.bodyWrap}>
            <Body
              data={bodyData}
              gender="male"
              side={view}
              scale={1.15}
              border="none"
              defaultFill="#3A3A3A"
              defaultStroke="#F4F4F4"
              defaultStrokeWidth={1.2}
              onBodyPartPress={handlePartPress}
            />
            <PulseOverlay
              data={recentGlowData}
              side={view}
              duration={1100}
              minOpacity={0.18}
              maxOpacity={0.5}
            />
            <PulseOverlay
              data={todayGlowData}
              side={view}
              duration={520}
              minOpacity={0.3}
              maxOpacity={0.8}
            />
          </View>
        </View>

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

      {selectedPart && selectedPartData && selectedPartLabel && (
        <MuscleTooltip
          visible={tooltipVisible}
          muscle={selectedPartLabel}
          xp={selectedPartData.xp}
          lastTrained={selectedPartData.lastTrained}
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
    justifyContent: 'center',
    marginBottom: 20,
    height: 380,
    width: '100%',
  },
  bodyWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
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
