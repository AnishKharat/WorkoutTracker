import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, Modal, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import {
  PRESET_EXERCISES, MUSCLE_GROUPS, MuscleGroup, Exercise,
} from '../constants/exercises';
import { useUserStore } from '../store/useUserStore';
import { useWorkoutStore } from '../store/useWorkoutStore';
import MasteryBadge from '../components/MasteryBadge';
import { getMasteryTier } from '../utils/xpCalculator';

export default function ExercisePickerScreen() {
  const navigation = useNavigation<any>();
  const { exerciseMastery, customExercises, addCustomExercise } = useUserStore();
  const { addExercise } = useWorkoutStore();

  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | 'All'>('All');
  const [search, setSearch] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customGroup, setCustomGroup] = useState<MuscleGroup>('Chest');

  const allExercises = useMemo(
    () => [...PRESET_EXERCISES, ...customExercises],
    [customExercises]
  );

  const filtered = useMemo(() => {
    return allExercises.filter(e => {
      const matchGroup = selectedGroup === 'All' || e.muscleGroup === selectedGroup;
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
      return matchGroup && matchSearch;
    });
  }, [allExercises, selectedGroup, search]);

  const handleSelect = (exercise: Exercise) => {
    addExercise(exercise);
    navigation.goBack();
  };

  const handleCreateCustom = () => {
    if (!customName.trim()) {
      Alert.alert('Name required', 'Please enter an exercise name.');
      return;
    }
    const newExercise: Exercise = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      muscleGroup: customGroup,
      isCustom: true,
    };
    addCustomExercise(newExercise);
    setShowCustomModal(false);
    setCustomName('');
    handleSelect(newExercise);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelTxt}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pick Exercise</Text>
        <TouchableOpacity onPress={() => setShowCustomModal(true)}>
          <Text style={styles.addCustomTxt}>+ Custom</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor={Colors.textDim}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Muscle group filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={['All', ...MUSCLE_GROUPS] as (MuscleGroup | 'All')[]}
        keyExtractor={g => g}
        contentContainerStyle={styles.groupRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.groupChip, selectedGroup === item && styles.groupChipActive]}
            onPress={() => setSelectedGroup(item)}
          >
            <Text style={[styles.groupChipTxt, selectedGroup === item && styles.groupChipTxtActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Exercise List */}
      <FlatList
        data={filtered}
        keyExtractor={e => e.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const mastery = exerciseMastery[item.id];
          const tier = getMasteryTier(mastery?.xp ?? 0);
          return (
            <TouchableOpacity style={styles.exerciseRow} onPress={() => handleSelect(item)}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseGroup}>{item.muscleGroup}{item.isCustom ? ' · Custom' : ''}</Text>
              </View>
              <MasteryBadge tier={tier.tier} showLabel={false} size={20} />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyTxt}>No exercises found</Text>
          </View>
        )}
      />

      {/* Custom Exercise Modal */}
      <Modal visible={showCustomModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Custom Exercise</Text>

            <Text style={styles.modalLabel}>NAME</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Exercise name"
              placeholderTextColor={Colors.textDim}
              value={customName}
              onChangeText={setCustomName}
              autoFocus
            />

            <Text style={styles.modalLabel}>MUSCLE GROUP</Text>
            <View style={styles.groupGrid}>
              {MUSCLE_GROUPS.filter(g => g !== 'Cardio').map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.groupGridItem, customGroup === g && styles.groupGridItemActive]}
                  onPress={() => setCustomGroup(g)}
                >
                  <Text style={[styles.groupGridTxt, customGroup === g && styles.groupGridTxtActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCustomModal(false)}>
                <Text style={styles.cancelBtnTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={handleCreateCustom}>
                <Text style={styles.createBtnTxt}>Create & Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  cancelTxt: { color: Colors.textMuted, fontSize: 15 },
  title: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },
  addCustomTxt: { color: Colors.accent, fontSize: 15, fontWeight: '700' },
  searchRow: { paddingHorizontal: 20, paddingVertical: 12 },
  searchInput: {
    backgroundColor: Colors.card, borderRadius: 10, color: Colors.textPrimary,
    fontSize: 15, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  groupRow: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  groupChip: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20, backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  groupChipTxt: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  groupChipTxtActive: { color: Colors.textPrimary },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  exerciseRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  exerciseInfo: { flex: 1, marginRight: 12 },
  exerciseName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  exerciseGroup: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTxt: { color: Colors.textMuted, fontSize: 15 },
  modalOverlay: {
    flex: 1, backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40,
    borderWidth: 1, borderColor: Colors.border,
  },
  modalTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '900', marginBottom: 20 },
  modalLabel: {
    color: Colors.textMuted, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.5, marginBottom: 8, marginTop: 16,
  },
  modalInput: {
    backgroundColor: Colors.background, borderRadius: 10, color: Colors.textPrimary,
    fontSize: 16, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  groupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  groupGridItem: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.border,
  },
  groupGridItemActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  groupGridTxt: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  groupGridTxtActive: { color: Colors.textPrimary },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingVertical: 14, alignItems: 'center',
  },
  cancelBtnTxt: { color: Colors.textMuted, fontWeight: '700', fontSize: 15 },
  createBtn: {
    flex: 2, borderRadius: 12, backgroundColor: Colors.accent,
    paddingVertical: 14, alignItems: 'center',
  },
  createBtnTxt: { color: Colors.textPrimary, fontWeight: '800', fontSize: 15 },
});
