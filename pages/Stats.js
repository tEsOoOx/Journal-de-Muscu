import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import {
  TrendingUp,
  Dumbbell,
  Flame,
  Calendar,
  Target,
  Trophy,
  Crown,
  ChevronRight,
  Calculator,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProgressChart from "@/components/fitness/ProgressChart";
import StatsCard from "@/components/fitness/StatsCard";
import MuscleIcon from "@/components/fitness/MuscleIcon";

export default function StatsPage() {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [oneRMExercise, setOneRMExercise] = useState(null);
  const [progressionExercise, setProgressionExercise] = useState(null);
  const [progressionMetric, setProgressionMetric] = useState("maxWeight");
  const [timeRange, setTimeRange] = useState("30");
  const [showFullRanking, setShowFullRanking] = useState(false);

  const timeRangeOptions = [
    { value: "last", label: "Dernière séance" },
    { value: "7", label: "7 derniers jours" },
    { value: "15", label: "15 derniers jours" },
    { value: "30", label: "30 derniers jours" },
    { value: "60", label: "2 derniers mois" }
  ];

  const { data: workouts = [] } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => base44.entities.Workout.list("-date", 200)
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => base44.entities.Exercise.list()
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.WorkoutTemplate.list()
  });

  // Get exercise IDs from templates (for smart sorting)
  const templateExerciseIds = useMemo(() => {
    const ids = new Set();
    templates.forEach(t => {
      t.exercises?.forEach(ex => {
        if (ex.exercise_id) ids.add(ex.exercise_id);
      });
    });
    return ids;
  }, [templates]);

  // Sort exercises: template exercises first, then by frequency
  const sortedExercises = useMemo(() => {
    const exerciseFrequency = {};
    workouts.forEach(w => {
      w.exercises?.forEach(ex => {
        const key = ex.exercise_id || ex.exercise_name;
        exerciseFrequency[key] = (exerciseFrequency[key] || 0) + 1;
      });
    });
    
    return [...exercises].sort((a, b) => {
      const aInTemplate = templateExerciseIds.has(a.id);
      const bInTemplate = templateExerciseIds.has(b.id);
      if (aInTemplate && !bInTemplate) return -1;
      if (!aInTemplate && bInTemplate) return 1;
      
      const freqA = exerciseFrequency[a.id] || 0;
      const freqB = exerciseFrequency[b.id] || 0;
      return freqB - freqA;
    });
  }, [exercises, workouts, templateExerciseIds]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    
    let filteredWorkouts;
    if (timeRange === "last") {
      filteredWorkouts = workouts.slice(0, 1);
    } else {
      const rangeStart = subDays(now, parseInt(timeRange));
      filteredWorkouts = workouts.filter(w => 
        new Date(w.date) >= rangeStart
      );
    }

    const totalWorkouts = filteredWorkouts.length;
    const totalVolume = filteredWorkouts.reduce((acc, w) => acc + (w.total_volume || 0), 0);
    const totalSets = filteredWorkouts.reduce((acc, w) => 
      acc + (w.exercises?.reduce((a, e) => a + (e.sets?.length || 0), 0) || 0), 0
    );

    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const workoutsThisWeek = workouts.filter(w => 
      isWithinInterval(new Date(w.date), { start: thisWeekStart, end: thisWeekEnd })
    ).length;

    return {
      totalWorkouts,
      totalVolume,
      totalSets,
      workoutsThisWeek
    };
  }, [workouts, timeRange]);

  // Calculate 1RM for selected exercise
  const oneRMData = useMemo(() => {
    if (!oneRMExercise) return null;
    
    let best1RM = 0;
    let bestWeight = 0;
    let bestReps = 0;
    let bestDate = null;

    workouts.forEach(w => {
      w.exercises?.forEach(ex => {
        if (ex.exercise_id === oneRMExercise || ex.exercise_name === exercises.find(e => e.id === oneRMExercise)?.name) {
          ex.sets?.forEach(s => {
            if (s.weight && s.reps && s.reps <= 12) {
              const e1rm = s.weight * (36 / (37 - s.reps));
              if (e1rm > best1RM) {
                best1RM = e1rm;
                bestWeight = s.weight;
                bestReps = s.reps;
                bestDate = w.date;
              }
            }
          });
        }
      });
    });

    return best1RM > 0 ? {
      estimated1RM: Math.round(best1RM * 10) / 10,
      weight: bestWeight,
      reps: bestReps,
      date: bestDate
    } : null;
  }, [oneRMExercise, workouts, exercises]);

  // Progression data for selected exercise
  const progressionData = useMemo(() => {
    if (!progressionExercise) return [];

    const data = [];
    workouts.forEach(w => {
      w.exercises?.forEach(ex => {
        if (ex.exercise_id === progressionExercise || ex.exercise_name === exercises.find(e => e.id === progressionExercise)?.name) {
          const maxWeight = Math.max(...(ex.sets?.map(s => s.weight || 0) || [0]));
          const totalVolume = ex.sets?.reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0) || 0;

          data.push({
            date: format(new Date(w.date), "dd/MM", { locale: fr }),
            fullDate: w.date,
            maxWeight,
            volume: totalVolume
          });
        }
      });
    });

    return data.reverse().slice(-20);
  }, [progressionExercise, workouts, exercises]);

  // Volume over time
  const volumeOverTime = useMemo(() => {
    let filtered;
    if (timeRange === "last") {
      filtered = workouts.slice(0, 1);
    } else {
      const rangeStart = subDays(new Date(), parseInt(timeRange));
      filtered = workouts.filter(w => new Date(w.date) >= rangeStart);
    }
    
    return filtered
      .map(w => ({
        date: format(new Date(w.date), "dd/MM", { locale: fr }),
        volume: w.total_volume || 0
      }))
      .reverse();
  }, [workouts, timeRange]);

  // Personal Records
  const personalRecords = useMemo(() => {
    const records = {};
    
    workouts.forEach(w => {
      w.exercises?.forEach(ex => {
        const exerciseName = ex.exercise_name;
        const exerciseId = ex.exercise_id;
        const maxWeight = Math.max(...(ex.sets?.map(s => s.weight || 0) || [0]));
        
        if (maxWeight > 0) {
          const key = exerciseId || exerciseName;
          if (!records[key] || maxWeight > records[key].maxWeight) {
            records[key] = {
              exerciseName,
              exerciseId,
              maxWeight,
              date: w.date,
              muscleGroup: ex.muscle_group
            };
          }
        }
      });
    });
    
    return Object.values(records).sort((a, b) => b.maxWeight - a.maxWeight);
  }, [workouts]);

  const top3Records = personalRecords.slice(0, 3);

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="px-5 pt-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-light tracking-tight text-white">Statistiques</h1>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36 bg-transparent border-white/10 text-white/70 text-xs font-light">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              {timeRangeOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs text-white/70">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Top 3 PR */}
        {top3Records.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Records</h2>
            </div>
            
            <div className="space-y-2">
              {top3Records.map((record, index) => (
                <motion.div
                  key={record.exerciseId || record.exerciseName}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 py-3 border-b border-white/5"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    index === 0 ? "bg-white text-black" :
                    index === 1 ? "bg-white/30 text-white" :
                    "bg-white/10 text-white/60"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-light text-white truncate">{record.exerciseName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-light text-white">{record.maxWeight}<span className="text-xs text-white/40 ml-1">kg</span></div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              variant="ghost"
              className="w-full mt-3 text-white/40 hover:text-white/60 text-xs font-light"
              onClick={() => setShowFullRanking(true)}
            >
              Voir tout
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="p-4 bg-zinc-900/50 rounded-lg">
            <div className="text-2xl font-light text-white">{stats.totalWorkouts}</div>
            <div className="text-xs text-white/40 font-light mt-1">Séances</div>
          </div>
          <div className="p-4 bg-zinc-900/50 rounded-lg">
            <div className="text-2xl font-light text-white">{(stats.totalVolume / 1000).toFixed(1)}<span className="text-sm text-white/40">T</span></div>
            <div className="text-xs text-white/40 font-light mt-1">Volume</div>
          </div>
          <div className="p-4 bg-zinc-900/50 rounded-lg">
            <div className="text-2xl font-light text-white">{stats.totalSets}</div>
            <div className="text-xs text-white/40 font-light mt-1">Séries</div>
          </div>
          <div className="p-4 bg-zinc-900/50 rounded-lg">
            <div className="text-2xl font-light text-white">{stats.workoutsThisWeek}</div>
            <div className="text-xs text-white/40 font-light mt-1">Cette semaine</div>
          </div>
        </div>

        {/* 1RM Calculator */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-4 h-4 text-white/40" />
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Calculateur 1RM</h2>
          </div>
          
          <Select value={oneRMExercise || ""} onValueChange={setOneRMExercise}>
            <SelectTrigger className="w-full bg-zinc-900/50 border-white/5 text-white font-light">
              <SelectValue placeholder="Sélectionner un exercice" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 max-h-64">
              {sortedExercises.map((ex) => (
                <SelectItem key={ex.id} value={ex.id} className="text-white/70">
                  {templateExerciseIds.has(ex.id) && <span className="text-white/30 mr-1">★</span>}
                  {ex.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {oneRMData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-5 bg-zinc-900/50 rounded-lg text-center"
            >
              <div className="text-4xl font-light text-white mb-2">
                {oneRMData.estimated1RM}<span className="text-lg text-white/40 ml-1">kg</span>
              </div>
              <div className="text-xs text-white/40 font-light">
                Basé sur {oneRMData.weight}kg × {oneRMData.reps} reps
              </div>
              <div className="text-xs text-white/30 font-light mt-1">
                {format(new Date(oneRMData.date), "d MMM yyyy", { locale: fr })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Progression Chart */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-white/40" />
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Progression</h2>
          </div>
          
          <Select value={progressionExercise || ""} onValueChange={setProgressionExercise}>
            <SelectTrigger className="w-full bg-zinc-900/50 border-white/5 text-white font-light mb-3">
              <SelectValue placeholder="Sélectionner un exercice" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 max-h-64">
              {sortedExercises.map((ex) => (
                <SelectItem key={ex.id} value={ex.id} className="text-white/70">
                  {templateExerciseIds.has(ex.id) && <span className="text-white/30 mr-1">★</span>}
                  {ex.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {progressionExercise && (
            <Tabs value={progressionMetric} onValueChange={setProgressionMetric} className="mb-3">
              <TabsList className="bg-zinc-900/50 p-1">
                <TabsTrigger value="maxWeight" className="text-xs data-[state=active]:bg-white/10">Poids Max</TabsTrigger>
                <TabsTrigger value="volume" className="text-xs data-[state=active]:bg-white/10">Volume</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {progressionExercise && progressionData.length > 0 ? (
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <ProgressChart
                data={progressionData}
                dataKey={progressionMetric}
                name={progressionMetric === "maxWeight" ? "Poids Max" : "Volume"}
                unit="kg"
                color="#ffffff"
              />
            </div>
          ) : progressionExercise ? (
            <div className="py-8 text-center text-white/30 text-sm font-light">
              Pas de données
            </div>
          ) : null}
        </div>

        {/* Volume Chart */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Volume par séance</h2>
          {volumeOverTime.length > 0 ? (
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <ProgressChart
                data={volumeOverTime}
                dataKey="volume"
                name="Volume"
                unit="kg"
                color="#ffffff"
              />
            </div>
          ) : (
            <div className="py-8 text-center text-white/30 text-sm font-light">
              Pas assez de données
            </div>
          )}
        </div>
      </div>

      {/* Full Ranking Sheet */}
      <Sheet open={showFullRanking} onOpenChange={setShowFullRanking}>
        <SheetContent 
          side="bottom" 
          className="bg-black border-white/5 text-white h-[85vh] rounded-t-2xl"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-lg font-light text-white">
              Tous les records
            </SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(85vh-100px)] pr-4">
            <div className="space-y-1">
              {personalRecords.map((record, index) => (
                <div
                  key={record.exerciseId || record.exerciseName}
                  className="flex items-center gap-4 py-3 border-b border-white/5"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    index === 0 ? "bg-white text-black" :
                    index === 1 ? "bg-white/30 text-white" :
                    index === 2 ? "bg-white/20 text-white" :
                    "bg-white/5 text-white/40"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-light text-white truncate">{record.exerciseName}</div>
                    <div className="text-xs text-white/30 font-light">
                      {format(new Date(record.date), "d MMM yyyy", { locale: fr })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-light text-white">{record.maxWeight}<span className="text-xs text-white/40 ml-1">kg</span></div>
                  </div>
                </div>
              ))}
              
              {personalRecords.length === 0 && (
                <div className="text-center py-12 text-white/30 font-light">
                  Aucun record
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}