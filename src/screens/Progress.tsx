import { useState, useMemo, useEffect } from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { MUSCLE_GROUPS } from '../constants';
import { format, subDays, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Trophy, TrendingUp, Activity } from 'lucide-react';

export default function Progress() {
  const { workouts, loadWorkouts } = useWorkoutStore();
  const [selectedGroup, setSelectedGroup] = useState<string>(MUSCLE_GROUPS[0]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'4w' | '3m' | 'all'>('4w');

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const exercisesForGroup = useMemo(() => {
    const groupWorkouts = workouts.filter(w => w.muscleGroup === selectedGroup);
    const exercises = new Set<string>();
    groupWorkouts.forEach(w => w.exercises.forEach(ex => exercises.add(ex.name)));
    const exerciseList = Array.from(exercises);
    if (exerciseList.length > 0 && !exerciseList.includes(selectedExercise)) {
      setSelectedExercise(exerciseList[0]);
    }
    return exerciseList;
  }, [workouts, selectedGroup, selectedExercise]);

  const chartData = useMemo(() => {
    if (!selectedExercise) return [];

    let filteredWorkouts = workouts.filter(w => w.muscleGroup === selectedGroup);
    
    const now = new Date();
    if (timeRange === '4w') {
      const fourWeeksAgo = subDays(now, 28);
      filteredWorkouts = filteredWorkouts.filter(w => isAfter(new Date(w.date), fourWeeksAgo));
    } else if (timeRange === '3m') {
      const threeMonthsAgo = subDays(now, 90);
      filteredWorkouts = filteredWorkouts.filter(w => isAfter(new Date(w.date), threeMonthsAgo));
    }

    // Sort ascending for charts
    filteredWorkouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return filteredWorkouts.map(w => {
      const exercise = w.exercises.find(ex => ex.name === selectedExercise);
      if (!exercise) return null;

      const maxWeight = Math.max(...exercise.sets.map(s => s.weight), 0);
      const totalVolume = exercise.sets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
      const totalSets = exercise.sets.length;

      return {
        date: format(new Date(w.date), 'd MMM', { locale: fr }),
        maxWeight,
        totalVolume,
        totalSets,
        fullDate: w.date
      };
    }).filter(Boolean) as any[];
  }, [workouts, selectedGroup, selectedExercise, timeRange]);

  const prs = useMemo(() => {
    if (chartData.length === 0) return { maxWeight: 0, maxVolume: 0 };
    return {
      maxWeight: Math.max(...chartData.map(d => d.maxWeight)),
      maxVolume: Math.max(...chartData.map(d => d.totalVolume))
    };
  }, [chartData]);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pb-24 max-w-md mx-auto w-full">
      <header className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-[#2C2C2E] px-4 py-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Statistiques</h1>
        
        <div className="flex gap-2 mb-4">
          <select 
            value={selectedGroup} 
            onChange={e => setSelectedGroup(e.target.value)}
            className="flex-1 bg-[#1C1C1E] border border-[#2C2C2E] text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:ring-1 focus:ring-[#D4FF00]"
          >
            {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          
          <select 
            value={selectedExercise} 
            onChange={e => setSelectedExercise(e.target.value)}
            disabled={exercisesForGroup.length === 0}
            className="flex-1 bg-[#1C1C1E] border border-[#2C2C2E] text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:ring-1 focus:ring-[#D4FF00] disabled:opacity-50"
          >
            {exercisesForGroup.length === 0 ? (
              <option value="">Aucun exercice</option>
            ) : (
              exercisesForGroup.map(ex => <option key={ex} value={ex}>{ex}</option>)
            )}
          </select>
        </div>

        <div className="flex bg-[#1C1C1E] rounded-xl p-1">
          {[
            { id: '4w', label: '4 Semaines' },
            { id: '3m', label: '3 Mois' },
            { id: 'all', label: 'Tout le temps' }
          ].map(range => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id as any)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                timeRange === range.id ? 'bg-[#2C2C2E] text-white shadow-sm' : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1C1C1E] flex items-center justify-center mb-4">
              <Activity className="text-[#8E8E93]" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucune donnée disponible</h3>
            <p className="text-[#8E8E93]">Enregistrez des entraînements pour cet exercice pour voir les progrès.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
                <div className="flex items-center gap-2 text-[#8E8E93] mb-2">
                  <Trophy size={16} />
                  <span className="text-sm font-medium uppercase tracking-wider">Poids Max</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#D4FF00]">{prs.maxWeight}</span>
                  <span className="text-sm text-[#8E8E93]">kg</span>
                </div>
              </div>
              <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
                <div className="flex items-center gap-2 text-[#8E8E93] mb-2">
                  <TrendingUp size={16} />
                  <span className="text-sm font-medium uppercase tracking-wider">Volume Max</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#D4FF00]">{prs.maxVolume}</span>
                  <span className="text-sm text-[#8E8E93]">kg</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
              <h3 className="font-semibold mb-6">Progression du Poids Max</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                    <XAxis dataKey="date" stroke="#8E8E93" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8E8E93" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #2C2C2E', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#D4FF00' }}
                    />
                    <Line type="monotone" dataKey="maxWeight" stroke="#D4FF00" strokeWidth={3} dot={{ fill: '#D4FF00', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
              <h3 className="font-semibold mb-6">Volume par Session</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                    <XAxis dataKey="date" stroke="#8E8E93" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8E8E93" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #2C2C2E', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#D4FF00' }}
                      cursor={{ fill: '#2C2C2E' }}
                    />
                    <Bar dataKey="totalVolume" fill="#D4FF00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
