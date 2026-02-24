import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../store/workoutStore';
import { MUSCLE_GROUPS } from '../constants';
import { timeAgo } from '../utils/date';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Play, Activity, Flame, Clock, Dumbbell } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { workouts, loadWorkouts, startSession } = useWorkoutStore();

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const getLastWorkoutDate = (muscleGroup: string) => {
    const groupWorkouts = workouts.filter(w => w.muscleGroup === muscleGroup);
    if (groupWorkouts.length === 0) return null;
    return groupWorkouts[0].date;
  };

  const handleStartWorkout = (muscleGroup: string) => {
    startSession(muscleGroup);
    navigate('/workout');
  };

  const recentWorkouts = workouts.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pb-24 px-4 pt-6 max-w-md mx-auto w-full">
      <header className="mb-8 flex flex-col items-center justify-center space-y-4">
        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center w-full py-4">
          <div className="flex items-center justify-center space-x-2">
            <Dumbbell className="text-[#8E8E93]" size={32} />
            <div className="flex flex-col items-center">
              <div className="flex space-x-1 mb-1">
                <span className="text-[#D4FF00] text-lg">★</span>
                <span className="text-[#D4FF00] text-xl">★</span>
                <span className="text-[#D4FF00] text-lg">★</span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">
                NEED <span className="text-[#8E8E93]">FOR</span>
              </h1>
              <h1 className="text-4xl font-black tracking-tighter text-[#D4FF00] uppercase leading-none">
                GYM
              </h1>
            </div>
            <Dumbbell className="text-[#8E8E93]" size={32} />
          </div>
          <p className="text-[#8E8E93] text-xs tracking-[0.3em] uppercase mt-2">wellness center</p>
        </div>
        
        <div className="w-full flex justify-between items-end mt-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Entraînement</h2>
            <p className="text-[#8E8E93] mt-1 capitalize">{format(new Date(), 'EEEE, d MMMM', { locale: fr })}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center">
            <Activity className="text-[#D4FF00]" size={20} />
          </div>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Commencer l'entraînement</h2>
        <div className="grid grid-cols-2 gap-3">
          {MUSCLE_GROUPS.map(group => {
            const lastDate = getLastWorkoutDate(group);
            return (
              <button
                key={group}
                onClick={() => handleStartWorkout(group)}
                className="bg-[#1C1C1E] rounded-2xl p-4 text-left flex flex-col justify-between h-28 active:scale-95 transition-transform border border-[#2C2C2E]"
              >
                <span className="font-medium text-lg">{group}</span>
                <div className="flex justify-between items-end w-full mt-2">
                  <span className="text-xs text-[#8E8E93]">
                    {lastDate ? timeAgo(lastDate) : 'Jamais'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#D4FF00] flex items-center justify-center text-black">
                    <Play size={14} fill="currentColor" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {recentWorkouts.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Activité récente</h2>
            <button onClick={() => navigate('/history')} className="text-sm text-[#8E8E93]">Voir tout</button>
          </div>
          <div className="space-y-3">
            {recentWorkouts.map(workout => (
              <div key={workout.id} className="bg-[#1C1C1E] rounded-2xl p-4 flex justify-between items-center border border-[#2C2C2E]">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
                    <Flame className="text-[#D4FF00]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{workout.muscleGroup}</h3>
                    <p className="text-sm text-[#8E8E93]">{format(new Date(workout.date), 'd MMM yyyy', { locale: fr })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{workout.exercises.length} exercices</p>
                  <p className="text-sm text-[#8E8E93] flex items-center justify-end gap-1">
                    <Clock size={12} />
                    {workout.duration || '--'} min
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
