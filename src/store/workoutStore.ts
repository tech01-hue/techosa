import { create } from 'zustand';
import { WorkoutSession } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface WorkoutState {
  workouts: WorkoutSession[];
  currentSession: WorkoutSession | null;
  loadWorkouts: () => void;
  saveWorkout: (session: WorkoutSession) => void;
  deleteWorkout: (id: string) => void;
  startSession: (muscleGroup: string) => void;
  updateCurrentSession: (session: WorkoutSession) => void;
  clearCurrentSession: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workouts: [],
  currentSession: null,
  loadWorkouts: () => {
    const stored = localStorage.getItem('workouts');
    if (stored) {
      set({ workouts: JSON.parse(stored) });
    }
  },
  saveWorkout: (session) => {
    const { workouts } = get();
    const existingIndex = workouts.findIndex(w => w.id === session.id);
    let newWorkouts;
    if (existingIndex >= 0) {
      newWorkouts = [...workouts];
      newWorkouts[existingIndex] = session;
    } else {
      newWorkouts = [session, ...workouts];
    }
    // Sort by date descending
    newWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    localStorage.setItem('workouts', JSON.stringify(newWorkouts));
    set({ workouts: newWorkouts, currentSession: null });
  },
  deleteWorkout: (id) => {
    const { workouts } = get();
    const newWorkouts = workouts.filter(w => w.id !== id);
    localStorage.setItem('workouts', JSON.stringify(newWorkouts));
    set({ workouts: newWorkouts });
  },
  startSession: (muscleGroup) => {
    const newSession: WorkoutSession = {
      id: uuidv4(),
      date: new Date().toISOString().split('T')[0],
      muscleGroup,
      exercises: [],
    };
    set({ currentSession: newSession });
  },
  updateCurrentSession: (session) => {
    set({ currentSession: session });
  },
  clearCurrentSession: () => {
    set({ currentSession: null });
  }
}));
