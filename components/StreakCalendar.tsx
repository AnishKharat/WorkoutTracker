import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { DayLog, DayType } from '../store/useUserStore';
import { getDaysInMonth } from '../utils/dateHelpers';

interface Props {
  year: number;
  month: number; // 0-indexed
  dayLogs: Record<string, DayLog>;
  streak: number;
}

const TILE_COLORS: Record<DayType, string> = {
  workout: Colors.success,   // green
  rest:    Colors.rest,      // blue
  missed:  Colors.missed,    // dark red
  empty:   Colors.empty,     // dark grey
};

const DOW_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function StreakCalendar({ year, month, dayLogs, streak }: Props) {
  const days = getDaysInMonth(year, month);
  const today = new Date().toISOString().split('T')[0];

  // Get day-of-week offset for first day (Mon-start)
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const offset = (firstDow + 6) % 7; // shift to Mon=0

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {streak} Day{streak !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {/* Day-of-week labels */}
      <View style={styles.grid}>
        {DOW_LABELS.map(d => (
          <Text key={d} style={styles.dowLabel}>{d}</Text>
        ))}

        {/* Empty offset cells */}
        {Array.from({ length: offset }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.emptyCell} />
        ))}

        {/* Day tiles */}
        {days.map(dateStr => {
          const log = dayLogs[dateStr];
          const type: DayType = log?.type ?? 'empty';
          const isToday = dateStr === today;
          const day = parseInt(dateStr.split('-')[2], 10);

          return (
            <View
              key={dateStr}
              style={[
                styles.tile,
                { backgroundColor: TILE_COLORS[type] },
                isToday && styles.todayBorder,
              ]}
            >
              <View style={styles.tileInner}>
                <Text style={[styles.tileText, isToday && styles.todayText]}>
                  {day}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(TILE_COLORS).map(([key, color]) => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendLabel}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthLabel: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  streakBadge: {
    backgroundColor: Colors.accentDark,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dowLabel: {
    width: '13%',
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '600',
  },
  emptyCell: {
    width: '13%',
    aspectRatio: 1,
  },
  tile: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 1,
  },
  tileText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    width: '100%',
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 13,
    textAlignVertical: 'center',
  },
  todayBorder: {
    borderWidth: 2,
    borderColor: Colors.textPrimary,
  },
  todayText: { fontWeight: '900' },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendLabel: { color: Colors.textMuted, fontSize: 11 },
});
