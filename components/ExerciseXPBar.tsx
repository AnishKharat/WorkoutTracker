import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { MASTERY_TIERS } from '../utils/xpCalculator';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

interface Props {
  xp: number;
  tier: number;
}

export default function ExerciseXPBar({ xp, tier }: Props) {
  const currentTier = MASTERY_TIERS[tier - 1] ?? MASTERY_TIERS[0];
  const nextTier = MASTERY_TIERS[tier] ?? null;

  const progress = nextTier
    ? (xp - currentTier.xpRequired) / (nextTier.xpRequired - currentTier.xpRequired)
    : 1;

  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withTiming(Math.min(progress, 1), { duration: 600 });
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, barStyle]} />
      </View>
      <Text style={styles.xpLabel}>
        {xp.toLocaleString()} XP{nextTier ? ` / ${nextTier.xpRequired.toLocaleString()}` : ' — MAXED'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 4 },
  track: {
    height: 4,
    backgroundColor: Colors.empty,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  xpLabel: {
    color: Colors.textDim,
    fontSize: 10,
    marginTop: 2,
  },
});
