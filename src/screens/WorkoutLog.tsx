import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../store/workoutStore';
import { v4 as uuidv4 } from 'uuid';
import { Exercise, Set, WorkoutSession } from '../types';
import { ArrowLeft, Plus, Check, Trash2, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { clsx } from 'clsx';

export default function WorkoutLog() {
  const navigate = useNavigate();
  const { currentSession, updateCurrentSession, saveWorkout, workouts } = useWorkoutStore();
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [lastSession, setLastSession] = useState<WorkoutSession | null>(null);
  const [showLastSession, setShowLastSession] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!currentSession) {
      navigate('/');
      return;
    }

    const previousWorkouts = workouts
      .filter(w => w.muscleGroup === currentSession.muscleGroup && w.id !== currentSession.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (previousWorkouts.length > 0) {
      setLastSession(previousWorkouts[0]);
    }
  }, [currentSession, navigate, workouts]);

  if (!currentSession) return null;

  const handleAddExercise = () => {
    if (!newExerciseName.trim()) return;
    
    const newExercise: Exercise = {
      id: uuidv4(),
      name: newExerciseName.trim(),
      sets: [{ id: uuidv4(), setNumber: 1, weight: 0, reps: 0, completed: false }]
    };

    updateCurrentSession({
      ...currentSession,
      exercises: [...currentSession.exercises, newExercise]
    });
    
    setNewExerciseName('');
    setShowAddExercise(false);
  };

  const handleAddSet = (exerciseId: string) => {
    const updatedExercises = currentSession.exercises.map(ex => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: Set = {
          id: uuidv4(),
          setNumber: ex.sets.length + 1,
          weight: lastSet ? lastSet.weight : 0,
          reps: lastSet ? lastSet.reps : 0,
          completed: false
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      }
      return ex;
    });

    updateCurrentSession({ ...currentSession, exercises: updatedExercises });
  };

  const handleUpdateSet = (exerciseId: string, setId: string, field: keyof Set, value: number | boolean) => {
    const updatedExercises = currentSession.exercises.map(ex => {
      if (ex.id === exerciseId) {
        const updatedSets = ex.sets.map(s => {
          if (s.id === setId) {
            return { ...s, [field]: value };
          }
          return s;
        });
        return { ...ex, sets: updatedSets };
      }
      return ex;
    });

    updateCurrentSession({ ...currentSession, exercises: updatedExercises });
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    const updatedExercises = currentSession.exercises.map(ex => {
      if (ex.id === exerciseId) {
        const updatedSets = ex.sets.filter(s => s.id !== setId).map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return { ...ex, sets: updatedSets };
      }
      return ex;
    });

    updateCurrentSession({ ...currentSession, exercises: updatedExercises });
  };

  const handleRemoveExercise = (exerciseId: string) => {
    const updatedExercises = currentSession.exercises.filter(ex => ex.id !== exerciseId);
    updateCurrentSession({ ...currentSession, exercises: updatedExercises });
  };

  const handleSaveSession = () => {
    const duration = Math.round((Date.now() - startTime) / 60000);
    saveWorkout({ ...currentSession, duration });
    navigate('/');
  };

  const isValidSession = currentSession.exercises.length > 0 && 
    currentSession.exercises.some(ex => ex.sets.some(s => s.completed));

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pb-32 max-w-md mx-auto w-full">
      <header className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-[#2C2C2E] px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-[#1C1C1E]">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Entraînement {currentSession.muscleGroup}</h1>
            <p className="text-sm text-[#8E8E93]">Aujourd'hui</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        {lastSession && (
          <div className="bg-[#1C1C1E] rounded-2xl border border-[#2C2C2E] overflow-hidden">
            <button 
              onClick={() => setShowLastSession(!showLastSession)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div>
                <h3 className="font-semibold text-[#D4FF00]">Comparaison avec la dernière session</h3>
                <p className="text-sm text-[#8E8E93]">{lastSession.date}</p>
              </div>
              {showLastSession ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {showLastSession && (
              <div className="p-4 pt-0 border-t border-[#2C2C2E] bg-black/20">
                {lastSession.exercises.map(ex => (
                  <div key={ex.id} className="mb-4 last:mb-0">
                    <h4 className="font-medium text-sm mb-2">{ex.name}</h4>
                    <div className="space-y-1">
                      {ex.sets.map(s => (
                        <div key={s.id} className="flex justify-between text-xs text-[#8E8E93]">
                          <span>Série {s.setNumber}</span>
                          <span>{s.weight} kg × {s.reps} rép</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-6">
          {currentSession.exercises.map((exercise, exIdx) => (
            <div key={exercise.id} className="bg-[#1C1C1E] rounded-2xl border border-[#2C2C2E] overflow-hidden">
              <div className="p-4 border-b border-[#2C2C2E] flex justify-between items-center">
                <h3 className="font-bold text-lg">{exIdx + 1}. {exercise.name}</h3>
                <button 
                  onClick={() => handleRemoveExercise(exercise.id)}
                  className="text-red-500 p-2 -mr-2 rounded-full hover:bg-red-500/10"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex text-xs font-medium text-[#8E8E93] uppercase tracking-wider px-2">
                  <div className="w-12 text-center">Série</div>
                  <div className="flex-1 text-center">kg</div>
                  <div className="flex-1 text-center">Rép</div>
                  <div className="w-12 text-center">Fait</div>
                </div>

                {exercise.sets.map((set, setIdx) => (
                  <div 
                    key={set.id} 
                    className={clsx(
                      "flex items-center gap-3 p-2 rounded-xl transition-colors",
                      set.completed ? "bg-[#D4FF00]/10" : "bg-black"
                    )}
                  >
                    <div className="w-12 text-center font-medium text-[#8E8E93]">
                      {set.setNumber}
                    </div>
                    
                    <div className="flex-1">
                      <input
                        type="number"
                        value={set.weight || ''}
                        onChange={(e) => handleUpdateSet(exercise.id, set.id, 'weight', Number(e.target.value))}
                        className="w-full bg-[#1C1C1E] text-white text-center rounded-lg py-2 px-1 font-mono text-lg focus:outline-none focus:ring-1 focus:ring-[#D4FF00]"
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => handleUpdateSet(exercise.id, set.id, 'reps', Number(e.target.value))}
                        className="w-full bg-[#1C1C1E] text-white text-center rounded-lg py-2 px-1 font-mono text-lg focus:outline-none focus:ring-1 focus:ring-[#D4FF00]"
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="w-12 flex justify-center">
                      <button
                        onClick={() => handleUpdateSet(exercise.id, set.id, 'completed', !set.completed)}
                        className={clsx(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          set.completed ? "bg-[#D4FF00] text-black" : "bg-[#1C1C1E] text-[#8E8E93]"
                        )}
                      >
                        <Check size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => handleAddSet(exercise.id)}
                  className="w-full py-3 mt-2 rounded-xl text-sm font-medium text-[#D4FF00] bg-[#D4FF00]/10 hover:bg-[#D4FF00]/20 flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Ajouter une série
                </button>
              </div>
            </div>
          ))}
        </div>

        {showAddExercise ? (
          <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
            <input
              type="text"
              autoFocus
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              placeholder="Nom de l'exercice (ex: Développé couché)"
              className="w-full bg-black text-white rounded-xl py-3 px-4 mb-3 focus:outline-none focus:ring-1 focus:ring-[#D4FF00]"
              onKeyDown={(e) => e.key === 'Enter' && handleAddExercise()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddExercise(false)}
                className="flex-1 py-3 rounded-xl font-medium bg-black text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleAddExercise}
                className="flex-1 py-3 rounded-xl font-medium bg-[#D4FF00] text-black"
              >
                Ajouter
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full py-4 rounded-2xl font-semibold text-[#D4FF00] border-2 border-dashed border-[#2C2C2E] hover:border-[#D4FF00]/50 flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Ajouter un exercice
          </button>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent pb-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSaveSession}
            disabled={!isValidSession}
            className="w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-[#D4FF00] text-black"
          >
            <Save size={20} /> Terminer l'entraînement
          </button>
        </div>
      </div>
    </div>
  );
}
