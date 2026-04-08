import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MASTERY_TIERS } from '../utils/xpCalculator';
import { Colors } from '../constants/colors';

interface Props {
  tier: number;
  showLabel?: boolean;
  size?: number;
}

const TIER_COLORS = ['#888', '#1976D2', '#F9A825', '#EF6C00', '#E53935'];

export default function MasteryBadge({ tier, showLabel = false, size = 20 }: Props) {
  const t = MASTERY_TIERS[tier - 1] ?? MASTERY_TIERS[0];
  const color = TIER_COLORS[tier - 1] ?? '#888';

  return (
    <View style={styles.row}>
      <Text style={{ fontSize: size }}>{t.emoji}</Text>
      {showLabel && (
        <Text style={[styles.label, { color }]}>{t.name}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
});
