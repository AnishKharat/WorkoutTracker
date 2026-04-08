import { create } from 'zustand';
import { Exercise } from '../constants/exercises';

export interface SetEntry {
  reps: number;
  weightKg: number;
}

export interface SessionExercise {
  exercise: Exercise;
  sets: SetEntry[];
}

interface WorkoutState {
  sessionExercises: SessionExercise[];
  sessionXP: number;

  addExercise: (exercise: Exercise) => void;
  removeExercise: (exerciseId: string) => void;
  updateSets: (exerciseId: string, sets: SetEntry[]) => void;
  setSessionXP: (xp: number) => void;
  resetSession: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  sessionExercises: [],
  sessionXP: 0,

  addExercise: (exercise) =>
    set(state => ({
      sessionExercises: state.sessionExercises.some(se => se.exercise.id === exercise.id)
        ? state.sessionExercises
        : [...state.sessionExercises, { exercise, sets: [{ reps: 0, weightKg: 0 }] }],
    })),

  removeExercise: (exerciseId) =>
    set(state => ({
      sessionExercises: state.sessionExercises.filter(se => se.exercise.id !== exerciseId),
    })),

  updateSets: (exerciseId, sets) =>
    set(state => ({
      sessionExercises: state.sessionExercises.map(se =>
        se.exercise.id === exerciseId ? { ...se, sets } : se
      ),
    })),

  setSessionXP: (xp) => set({ sessionXP: xp }),

  resetSession: () => set({ sessionExercises: [], sessionXP: 0 }),
}));
