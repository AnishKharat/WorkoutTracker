import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMasteryTier } from '../utils/xpCalculator';
import { getLevelFromXP } from '../utils/levelCalculator';
import { getRankFromLevel } from '../constants/ranks';
import { Exercise } from '../constants/exercises';

export type DayType = 'workout' | 'rest' | 'missed' | 'empty';

export interface DayLog {
  date: string;
  type: DayType;
  workoutId?: string;
}

export interface ExerciseMastery {
  xp: number;
  tier: number;
  tierName: string;
  lastLogged?: string;
}

export interface MuscleGroupXP {
  xp: number;
  lastTrained?: string;
}

export interface WorkoutHistorySet {
  reps: number;
  weightKg: number;
}

export interface WorkoutHistoryExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  xpEarned: number;
  sets: WorkoutHistorySet[];
}

export interface WorkoutHistoryEntry {
  id: string;
  date: string;
  monthKey: string;
  totalXP: number;
  exerciseCount: number;
  exercises: WorkoutHistoryExercise[];
}

export interface UserState {
  totalXP: number;
  level: number;
  rank: string;
  exerciseMastery: Record<string, ExerciseMastery>;
  muscleGroupXP: Record<string, MuscleGroupXP>;
  dayLogs: Record<string, DayLog>;
  customExercises: Exercise[];
  workoutHistory: WorkoutHistoryEntry[];

  // Actions
  awardXP: (exerciseId: string, exerciseName: string, muscleGroup: string, xp: number) => void;
  logDayAsWorkout: (date: string, workoutId?: string) => void;
  logDayAsRest: (date: string) => void;
  undoRestDay: (date: string) => void;
  addCustomExercise: (exercise: Exercise) => void;
  addWorkoutHistoryEntry: (entry: WorkoutHistoryEntry) => void;
  getStreak: () => number;
  resetProgress: () => void;
}

function calcStreak(dayLogs: Record<string, DayLog>): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = dayLogs[dateStr];
    const type = log?.type ?? 'empty';
    if (type === 'workout' || type === 'rest') {
      streak++;
    } else {
      // If it's today and empty, don't break yet
      if (i === 0) continue;
      break;
    }
  }
  return streak;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      totalXP: 0,
      level: 1,
      rank: 'Rookie',
      exerciseMastery: {},
      muscleGroupXP: {},
      dayLogs: {},
      customExercises: [],
      workoutHistory: [],

      awardXP: (exerciseId, exerciseName, muscleGroup, xp) => {
        set(state => {
          const newTotalXP = state.totalXP + xp;
          const newLevel = getLevelFromXP(newTotalXP);
          const rankObj = getRankFromLevel(newLevel);

          // Update exercise mastery
          const existing = state.exerciseMastery[exerciseId] ?? { xp: 0, tier: 1, tierName: 'Novice' };
          const newExXP = existing.xp + xp;
          const masteryTier = getMasteryTier(newExXP);
          const updatedMastery: Record<string, ExerciseMastery> = {
            ...state.exerciseMastery,
            [exerciseId]: {
              xp: newExXP,
              tier: masteryTier.tier,
              tierName: masteryTier.name,
              lastLogged: new Date().toISOString().split('T')[0],
            },
          };

          // Update muscle group XP
          const today = new Date().toISOString().split('T')[0];
          const existingGroupXP = state.muscleGroupXP[muscleGroup] ?? { xp: 0 };
          const updatedGroupXP: Record<string, MuscleGroupXP> = {
            ...state.muscleGroupXP,
            [muscleGroup]: {
              xp: existingGroupXP.xp + xp,
              lastTrained: today,
            },
          };

          return {
            totalXP: newTotalXP,
            level: newLevel,
            rank: rankObj.title,
            exerciseMastery: updatedMastery,
            muscleGroupXP: updatedGroupXP,
          };
        });
      },

      logDayAsWorkout: (date, workoutId) => {
        set(state => ({
          dayLogs: {
            ...state.dayLogs,
            [date]: { date, type: 'workout', workoutId },
          },
        }));
      },

      logDayAsRest: (date) => {
        set(state => {
          // Check for max 2 consecutive rest days
          const d = new Date(date);
          let consecutiveRest = 0;
          for (let i = 1; i <= 2; i++) {
            const prev = new Date(d);
            prev.setDate(prev.getDate() - i);
            const prevStr = prev.toISOString().split('T')[0];
            const prevLog = state.dayLogs[prevStr];
            if (prevLog?.type === 'rest') consecutiveRest++;
            else break;
          }
          if (consecutiveRest >= 2) return state; // cap at 2

          return {
            dayLogs: {
              ...state.dayLogs,
              [date]: { date, type: 'rest' },
            },
          };
        });
      },

      undoRestDay: (date) => {
        set(state => {
          const logs = { ...state.dayLogs };
          delete logs[date];
          return { dayLogs: logs };
        });
      },

      addCustomExercise: (exercise) => {
        set(state => ({
          customExercises: [...state.customExercises, exercise],
        }));
      },

      addWorkoutHistoryEntry: (entry) => {
        set(state => ({
          workoutHistory: [entry, ...state.workoutHistory],
        }));
      },

      getStreak: () => calcStreak(get().dayLogs),

      resetProgress: () =>
        set(state => ({
          totalXP: 0,
          level: 1,
          rank: 'Rookie',
          exerciseMastery: {},
          muscleGroupXP: {},
          dayLogs: {},
          workoutHistory: [],
          customExercises: state.customExercises,
        })),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
