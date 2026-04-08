import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  emoji: string;
  title: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function RankBadge({ emoji, title, color, size = 'md' }: Props) {
  const sz = size === 'sm' ? 11 : size === 'lg' ? 16 : 13;
  return (
    <View style={[styles.badge, { borderColor: color ?? Colors.accent }]}>
      <Text style={[styles.emoji, { fontSize: sz + 4 }]}>{emoji}</Text>
      <Text style={[styles.title, { fontSize: sz, color: color ?? Colors.accent }]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  emoji: {},
  title: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
