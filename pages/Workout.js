import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Play, 
  Square, 
  Plus, 
  Save, 
  Dumbbell,
  ChevronLeft,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ExerciseCard from "@/components/fitness/ExerciseCard";
import ExerciseSelector from "@/components/fitness/ExerciseSelector";

export default function WorkoutPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get("templateId");

  const [isActive, setIsActive] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [exercises, setExercises] = useState([]);
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [templateUsed, setTemplateUsed] = useState(null);

  const { data: exerciseList = [] } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => base44.entities.Exercise.list()
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const { data: userSettings } = useQuery({
    queryKey: ["userSettings"],
    queryFn: async () => {
      const results = await base44.entities.UserSettings.filter({ created_by: user?.email });
      return results[0] || null;
    },
    enabled: !!user
  });

  const { data: template } = useQuery({
    queryKey: ["template", templateId],
    queryFn: () => base44.entities.WorkoutTemplate.filter({ id: templateId }),
    enabled: !!templateId
  });

  const { data: workoutHistory = [] } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => base44.entities.Workout.list("-date", 100)
  });

  // Get last performance for an exercise from a specific workout name
  const getLastPerformanceForWorkout = (workoutName, exerciseId, exerciseName) => {
    // First try to find the exact same workout by name
    const sameWorkouts = workoutHistory.filter(w => w.name === workoutName);
    for (const workout of sameWorkouts) {
      const exerciseData = workout.exercises?.find(
        e => e.exercise_id === exerciseId || e.exercise_name === exerciseName
      );
      if (exerciseData?.sets?.length > 0) {
        const completedSets = exerciseData.sets.filter(s => s.completed && s.weight > 0);
        if (completedSets.length > 0) {
          return completedSets;
        }
      }
    }
    return null;
  };

  // Get last performance for an exercise (any workout)
  const getLastPerformance = (exerciseId, exerciseName) => {
    for (const workout of workoutHistory) {
      const exerciseData = workout.exercises?.find(
        e => e.exercise_id === exerciseId || e.exercise_name === exerciseName
      );
      if (exerciseData?.sets?.length > 0) {
        const completedSets = exerciseData.sets.filter(s => s.completed && s.weight > 0);
        if (completedSets.length > 0) {
          return completedSets;
        }
      }
    }
    return null;
  };

  // Initialize from template - with memory from last same workout
  useEffect(() => {
    if (template?.[0] && !isActive && exercises.length === 0) {
      const t = template[0];
      setTemplateUsed(t);
      setWorkoutName(t.name);
      
      const initialExercises = t.exercises?.map(ex => {
        // First try to get performance from same workout name
        let lastPerf = getLastPerformanceForWorkout(t.name, ex.exercise_id, ex.exercise_name);
        // Fallback to any workout with this exercise
        if (!lastPerf) {
          lastPerf = getLastPerformance(ex.exercise_id, ex.exercise_name);
        }
        
        // Use the number of sets from last performance if available, otherwise template
        const numSets = lastPerf?.length || ex.target_sets || 3;
        
        const sets = Array.from({ length: numSets }, (_, i) => ({
          weight: lastPerf?.[i]?.weight || lastPerf?.[0]?.weight || 0,
          reps: lastPerf?.[i]?.reps || ex.target_reps || 10,
          rest_seconds: 90,
          completed: false,
          last_weight: lastPerf?.[i]?.weight || lastPerf?.[0]?.weight || null,
          last_reps: lastPerf?.[i]?.reps || null
        }));

        return {
          exercise_id: ex.exercise_id,
          exercise_name: ex.exercise_name,
          muscle_group: ex.muscle_group,
          equipment: ex.equipment,
          sets
        };
      }) || [];

      setExercises(initialExercises);
      setIsActive(true);
      setExpandedExercise(0);
    }
  }, [template, workoutHistory]);

  const createWorkoutMutation = useMutation({
    mutationFn: (data) => base44.entities.Workout.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      navigate(createPageUrl("Home"));
    }
  });

  const handleStartWorkout = () => {
    setIsActive(true);
    if (!workoutName) {
      setWorkoutName(`Séance du ${format(new Date(), "d MMMM", { locale: fr })}`);
    }
  };

  const handleAddExercise = (exercise) => {
    const lastPerf = getLastPerformance(exercise.id, exercise.name);
    
    const newExercise = {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      muscle_group: exercise.muscle_group,
      equipment: exercise.equipment,
      sets: [{
        weight: lastPerf?.[0]?.weight || 0,
        reps: lastPerf?.[0]?.reps || 10,
        rest_seconds: 90,
        completed: false,
        last_weight: lastPerf?.[0]?.weight || null,
        last_reps: lastPerf?.[0]?.reps || null
      }]
    };
    setExercises([...exercises, newExercise]);
    setExpandedExercise(exercises.length);
  };

  const handleUpdateSets = (exerciseIndex, sets) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets = sets;
    setExercises(newExercises);
  };

  const handleRemoveExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
    if (expandedExercise === index) setExpandedExercise(null);
  };

  const handleSaveWorkout = async () => {
    const totalVolume = exercises.reduce((acc, ex) => {
      return acc + ex.sets.reduce((setAcc, set) => {
        return setAcc + (set.weight || 0) * (set.reps || 0);
      }, 0);
    }, 0);

    await createWorkoutMutation.mutateAsync({
      name: workoutName,
      date: workoutDate,
      exercises: exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(s => ({
          weight: s.weight,
          reps: s.reps,
          rest_seconds: s.rest_seconds,
          completed: s.completed
        }))
      })),
      is_completed: true,
      total_volume: totalVolume,
      template_id: templateUsed?.id || null
    });
  };

  const handleReset = () => {
    setIsActive(false);
    setWorkoutName("");
    setExercises([]);
    setExpandedExercise(null);
    setTemplateUsed(null);
    navigate(createPageUrl("Home"));
  };

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  const totalVolume = exercises.reduce((acc, ex) => {
    return acc + ex.sets.reduce((setAcc, set) => {
      return setAcc + (set.weight || 0) * (set.reps || 0);
    }, 0);
  }, 0);

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-black via-black to-transparent pb-4 pt-6 px-5">
        <div className="flex items-center justify-between mb-4">
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          {isActive && (
            <div className="text-sm text-white/50">
              {format(new Date(workoutDate), "EEEE d MMMM", { locale: fr })}
            </div>
          )}
        </div>

        {!isActive && !templateId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white flex items-center justify-center">
              <Zap className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-xl font-light text-white mb-2">Séance Libre</h1>
            <p className="text-white/30 text-sm font-light mb-8">Sans programme</p>
            
            <div className="space-y-4 max-w-xs mx-auto mb-8">
              <Input
                placeholder="Nom de la séance"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="bg-zinc-900 border-0 text-white text-center placeholder:text-white/30 font-light"
              />
            </div>

            <Button
              size="lg"
              className="bg-white hover:bg-white/90 text-black font-light px-10"
              onClick={handleStartWorkout}
            >
              <Play className="w-4 h-4 mr-2" />
              Commencer
            </Button>
          </motion.div>
        ) : isActive && (
          <div className="space-y-4">
            <Input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="bg-zinc-900 border-0 text-white text-lg font-light text-center"
              placeholder="Nom de la séance"
            />
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-900/50 rounded-xl p-3 text-center">
                <div className="text-lg font-light text-white">{exercises.length}</div>
                <div className="text-[10px] text-white/30 font-light">Exos</div>
              </div>
              <div className="bg-zinc-900/50 rounded-xl p-3 text-center">
                <div className="text-lg font-light text-white">{completedSets}/{totalSets}</div>
                <div className="text-[10px] text-white/30 font-light">Séries</div>
              </div>
              <div className="bg-zinc-900/50 rounded-xl p-3 text-center">
                <div className="text-lg font-light text-white">{totalVolume.toLocaleString()}</div>
                <div className="text-[10px] text-white/30 font-light">kg</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Exercises List */}
      {isActive && (
        <div className="px-5 space-y-3">
          <AnimatePresence mode="popLayout">
            {exercises.map((exercise, index) => {
              const exerciseInfo = exerciseList.find(e => e.id === exercise.exercise_id);
              return (
                <ExerciseCard
                  key={`${exercise.exercise_id}-${index}`}
                  exercise={exerciseInfo || exercise}
                  exerciseData={exercise}
                  onUpdateSets={(sets) => handleUpdateSets(index, sets)}
                  onRemove={() => handleRemoveExercise(index)}
                  isExpanded={expandedExercise === index}
                  onToggleExpand={() => setExpandedExercise(expandedExercise === index ? null : index)}
                />
              );
            })}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 border border-dashed border-white/10 rounded-xl text-white/30 hover:border-white/20 hover:text-white/50 transition-all flex items-center justify-center gap-2 font-light"
            onClick={() => setShowSelector(true)}
          >
            <Plus className="w-4 h-4" />
            Ajouter un exercice
          </motion.button>

          {exercises.length > 0 && (
            <div className="flex gap-3 pt-6">
              <Button
                variant="outline"
                className="flex-1 border-white/10 text-white/40 hover:text-white/60 bg-transparent font-light"
                onClick={handleReset}
              >
                Annuler
              </Button>
              <Button
                className="flex-1 bg-white hover:bg-white/90 text-black font-light"
                onClick={handleSaveWorkout}
                disabled={createWorkoutMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {createWorkoutMutation.isPending ? "..." : "Terminer"}
              </Button>
            </div>
          )}
        </div>
      )}

      <ExerciseSelector
        exercises={exerciseList}
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        onSelect={handleAddExercise}
      />
    </div>
  );
}