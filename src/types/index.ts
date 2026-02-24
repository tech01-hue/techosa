export interface Set {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  muscleGroup: string;
  exercises: Exercise[];
  notes?: string;
  duration?: number;
}
