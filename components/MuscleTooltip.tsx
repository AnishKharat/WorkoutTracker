import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Colors } from '../constants/colors';
import { getMuscleColour } from '../utils/muscleHeatmap';
import MasteryBadge from './MasteryBadge';
import { getMasteryTier } from '../utils/xpCalculator';

interface Props {
  muscle: string;
  xp: number;
  lastTrained?: string;
  visible: boolean;
  onClose: () => void;
}

export default function MuscleTooltip({ muscle, xp, lastTrained, visible, onClose }: Props) {
  const colour = getMuscleColour(xp);
  const mastery = getMasteryTier(xp);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={[styles.card, { borderTopColor: colour, borderTopWidth: 3 }]}>
          {/* Muscle name */}
          <Text style={styles.muscleName}>{muscle}</Text>

          {/* XP pill */}
          <View style={[styles.xpPill, { backgroundColor: colour + '33' }]}>
            <Text style={[styles.xpValue, { color: colour }]}>
              {xp.toLocaleString()} XP
            </Text>
          </View>

          {/* Mastery */}
          <View style={styles.row}>
            <Text style={styles.label}>Mastery</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MasteryBadge tier={mastery.tier} size={18} />
              <Text style={styles.value}>{mastery.name}</Text>
            </View>
          </View>

          {/* Last trained */}
          <View style={styles.row}>
            <Text style={styles.label}>Last Trained</Text>
            <Text style={styles.value}>
              {lastTrained ? (() => {
                // Parse as local date to avoid UTC-to-local off-by-one
                const [y, m, d] = lastTrained.split('-').map(Number);
                return new Date(y, m - 1, d).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                });
              })() : 'Never'}
            </Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    margin: 16,
    gap: 14,
  },
  muscleName: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  xpPill: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  xpValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { color: Colors.textMuted, fontSize: 14 },
  value: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  closeBtn: {
    marginTop: 8,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 16 },
});
