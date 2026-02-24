import { useState, useEffect } from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { MUSCLE_GROUPS } from '../constants';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, ChevronRight, Dumbbell, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function History() {
  const { workouts, loadWorkouts, deleteWorkout } = useWorkoutStore();
  const [filter, setFilter] = useState<string>('Tout');

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const filteredWorkouts = filter === 'Tout' 
    ? workouts 
    : workouts.filter(w => w.muscleGroup === filter);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Voulez-vous vraiment supprimer cet entraînement ?')) {
      deleteWorkout(id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pb-24 max-w-md mx-auto w-full">
      <header className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-[#2C2C2E] px-4 py-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Historique</h1>
        
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 space-x-2 scrollbar-hide">
          <button
            onClick={() => setFilter('Tout')}
            className={clsx(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              filter === 'Tout' ? "bg-[#D4FF00] text-black" : "bg-[#1C1C1E] text-[#8E8E93]"
            )}
          >
            Tout
          </button>
          {MUSCLE_GROUPS.map(group => (
            <button
              key={group}
              onClick={() => setFilter(group)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                filter === group ? "bg-[#D4FF00] text-black" : "bg-[#1C1C1E] text-[#8E8E93]"
              )}
            >
              {group}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {filteredWorkouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1C1C1E] flex items-center justify-center mb-4">
              <Calendar className="text-[#8E8E93]" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucun entraînement trouvé</h3>
            <p className="text-[#8E8E93]">Commencez à suivre vos sessions pour les voir ici.</p>
          </div>
        ) : (
          filteredWorkouts.map(workout => {
            const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
            const totalVolume = workout.exercises.reduce((acc, ex) => {
              return acc + ex.sets.reduce((setAcc, set) => setAcc + (set.weight * set.reps), 0);
            }, 0);

            return (
              <div key={workout.id} className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E] active:scale-95 transition-transform cursor-pointer relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                      <Dumbbell className="text-[#D4FF00]" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{workout.muscleGroup}</h3>
                      <p className="text-sm text-[#8E8E93] capitalize">{format(new Date(workout.date), 'EEEE, d MMM yyyy', { locale: fr })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleDelete(e, workout.id)}
                      className="p-2 text-[#8E8E93] hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <ChevronRight className="text-[#8E8E93]" size={20} />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#2C2C2E]">
                  <div className="text-center">
                    <p className="text-xs text-[#8E8E93] uppercase tracking-wider mb-1">Exercices</p>
                    <p className="font-semibold text-lg">{workout.exercises.length}</p>
                  </div>
                  <div className="text-center border-x border-[#2C2C2E]">
                    <p className="text-xs text-[#8E8E93] uppercase tracking-wider mb-1">Séries</p>
                    <p className="font-semibold text-lg">{totalSets}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[#8E8E93] uppercase tracking-wider mb-1">Volume</p>
                    <p className="font-semibold text-lg">{totalVolume} <span className="text-xs font-normal">kg</span></p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
