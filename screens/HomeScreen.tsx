import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useUserStore } from '../store/useUserStore';
import { getLevelProgress, totalXPForLevel } from '../utils/levelCalculator';
import { getTodayString } from '../utils/dateHelpers';
import XPBar from '../components/XPBar';
import RankBadge from '../components/RankBadge';
import { RANKS } from '../constants/ranks';
import StreakCalendar from '../components/StreakCalendar';
import AppIcon from '../components/AppIcon';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { totalXP, dayLogs, logDayAsRest, undoRestDay, getStreak } = useUserStore();
  const [rankModalVisible, setRankModalVisible] = useState(false);

  const today = getTodayString();
  const todayLog = dayLogs[today];
  const isRestDay = todayLog?.type === 'rest';
  const isWorkoutDay = todayLog?.type === 'workout';

  const streak = getStreak();
  const levelInfo = useMemo(() => getLevelProgress(totalXP), [totalXP]);
  const rankProgression = useMemo(
    () =>
      RANKS.map(rank => ({
        ...rank,
        totalXPRequired: totalXPForLevel(rank.minLevel),
        unlocked: levelInfo.level >= rank.minLevel,
        isCurrent: levelInfo.rank.title === rank.title,
      })),
    [levelInfo.level, levelInfo.rank.title]
  );

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const handleRestDay = () => {
    if (isRestDay) {
      Alert.alert('Undo Rest Day', 'Remove the rest day mark for today?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Undo', onPress: () => undoRestDay(today) },
      ]);
    } else if (isWorkoutDay) {
      Alert.alert('Already Logged', 'You already logged a workout today!');
    } else {
      logDayAsRest(today);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{'Welcome back, Anish ' + '\uD83D\uDC4A'}</Text>
          <Text style={styles.subGreeting}>Keep the streak alive</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.levelRow}>
            <View>
              <Text style={styles.levelLabel}>LEVEL</Text>
              <Text style={styles.levelNum}>{levelInfo.level}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setRankModalVisible(true)}
              style={styles.rankBadgeButton}
            >
              <RankBadge
                emoji={levelInfo.rank.emoji}
                title={levelInfo.rank.title}
                color={levelInfo.rank.color}
              />
            </TouchableOpacity>
          </View>
          <XPBar
            progress={levelInfo.progress}
            currentXP={levelInfo.currentLevelXP}
            requiredXP={levelInfo.nextLevelXP}
            label="XP to next level"
          />
        </View>

        <View style={styles.section}>
          <StreakCalendar year={year} month={month} dayLogs={dayLogs} streak={streak} />
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.primaryBtn]}
            onPress={() => navigation.navigate('WorkoutStack')}
          >
            <View style={styles.actionIconWrap}>
              <AppIcon name="workout" size={28} color={Colors.textPrimary} />
            </View>
            <Text style={styles.actionLabel}>Start Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.secondaryBtn]}
            onPress={() => navigation.navigate('WorkoutStack', { screen: 'CardioLog' })}
          >
            <View style={styles.actionIconWrap}>
              <AppIcon name="cardio" size={28} color={Colors.textPrimary} />
            </View>
            <Text style={styles.actionLabel}>Log Cardio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              isRestDay ? styles.restActiveBtn : styles.restBtn,
            ]}
            onPress={handleRestDay}
          >
            <View style={styles.actionIconWrap}>
              <AppIcon name="rest" size={28} color={Colors.textPrimary} />
            </View>
            <Text style={styles.actionLabel}>{isRestDay ? 'Rest Day ' + '\u2713' : 'Rest Day'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.totalXPRow}>
          <Text style={styles.totalXPLabel}>Total XP</Text>
          <Text style={styles.totalXPValue}>{totalXP.toLocaleString()}</Text>
        </View>
      </ScrollView>

      <Modal
        visible={rankModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRankModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Rank Progression</Text>
                <Text style={styles.modalSubtitle}>{RANKS.length} total ranks</Text>
              </View>
              <TouchableOpacity onPress={() => setRankModalVisible(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {rankProgression.map(rank => (
                <View
                  key={rank.title}
                  style={[
                    styles.rankRowCard,
                    rank.isCurrent && styles.rankRowCardCurrent,
                  ]}
                >
                  <View style={styles.rankRowTop}>
                    <View style={styles.rankMeta}>
                      <Text style={styles.rankEmoji}>{rank.emoji}</Text>
                      <View style={styles.rankTextBlock}>
                        <Text style={[styles.rankTitle, { color: rank.color }]}>{rank.title}</Text>
                        <Text style={styles.rankRequirement}>Reach level {rank.minLevel}</Text>
                      </View>
                    </View>
                    <Text style={styles.rankMultiplier}>x{rank.multiplier.toFixed(2)}</Text>
                  </View>

                  <Text style={styles.rankXPNeed}>
                    {rank.totalXPRequired.toLocaleString()} total XP required
                  </Text>
                  <Text style={styles.rankStatus}>
                    {rank.isCurrent ? 'Current rank' : rank.unlocked ? 'Unlocked' : 'Locked'}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <Text style={styles.modalNote}>
              Tap any rank in the future and we can also wire these multipliers into XP gain if you want.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  greeting: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subGreeting: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  levelNum: {
    color: Colors.accent,
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 48,
  },
  rankBadgeButton: {
    borderRadius: 20,
  },
  section: { marginBottom: 20 },
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
  },
  primaryBtn: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  secondaryBtn: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
  },
  restBtn: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
  },
  restActiveBtn: {
    backgroundColor: Colors.rest,
    borderColor: Colors.rest,
  },
  actionIconWrap: {
    marginBottom: 4,
  },
  actionLabel: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  totalXPRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  totalXPLabel: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  totalXPValue: { color: Colors.accent, fontSize: 20, fontWeight: '900' },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: '80%',
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  modalSubtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  modalClose: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  rankRowCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
  },
  rankRowCardCurrent: {
    borderColor: Colors.accent,
  },
  rankRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  rankMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rankEmoji: {
    fontSize: 22,
  },
  rankTextBlock: {
    flex: 1,
  },
  rankTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  rankRequirement: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  rankMultiplier: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: '900',
  },
  rankXPNeed: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  rankStatus: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 6,
  },
  modalNote: {
    color: Colors.textDim,
    fontSize: 12,
    marginTop: 8,
  },
});
