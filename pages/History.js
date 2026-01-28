import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Dumbbell, 
  Flame,
  ChevronRight,
  X,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import WorkoutCalendar from "@/components/fitness/WorkoutCalendar";
import MuscleIcon from "@/components/fitness/MuscleIcon";

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => base44.entities.Workout.list("-date", 100)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Workout.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      setSelectedWorkout(null);
    }
  });

  // Minimal styling
  const bgClass = "bg-black";
  const cardClass = "bg-zinc-900/50 rounded-xl";

  const workoutsOnSelectedDate = selectedDate 
    ? workouts.filter(w => isSameDay(new Date(w.date), selectedDate))
    : [];

  const recentWorkouts = workouts.slice(0, 10);

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="px-5 pt-8">
        <h1 className="text-2xl font-light tracking-tight text-white mb-8">Historique</h1>

        <WorkoutCalendar
          workouts={workouts}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* Selected Date Workouts */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">
                  {format(selectedDate, "EEEE d MMMM", { locale: fr })}
                </h2>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white/40 hover:text-white"
                  onClick={() => setSelectedDate(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {workoutsOnSelectedDate.length > 0 ? (
              <div className="space-y-3">
                {workoutsOnSelectedDate.map((workout) => (
                  <WorkoutCard 
                    key={workout.id} 
                    workout={workout}
                    onClick={() => setSelectedWorkout(workout)}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
              ) : (
                <Card className="bg-[#14141f] border-white/5 p-6 text-center">
                  <CalendarIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-white/40">Pas de séance ce jour</p>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Workouts */}
        {!selectedDate && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-white mb-3">Séances récentes</h2>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className="bg-[#1a1a24] rounded-xl h-24 animate-pulse"
                  />
                ))}
              </div>
            ) : recentWorkouts.length > 0 ? (
              <div className="space-y-3">
                {recentWorkouts.map((workout) => (
                  <WorkoutCard 
                    key={workout.id} 
                    workout={workout}
                    onClick={() => setSelectedWorkout(workout)}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    showDate
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-[#14141f] border-white/5 p-8 text-center">
                <Dumbbell className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">Aucune séance enregistrée</p>
                <p className="text-white/30 text-sm mt-1">
                  Commencez votre première séance !
                </p>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Workout Detail Sheet */}
      <Sheet open={!!selectedWorkout} onOpenChange={() => setSelectedWorkout(null)}>
        <SheetContent 
          side="bottom" 
          className="bg-[#0a0a0f] border-white/10 text-white h-[85vh] rounded-t-3xl"
        >
          {selectedWorkout && (
            <WorkoutDetail 
              workout={selectedWorkout} 
              onDelete={() => deleteMutation.mutate(selectedWorkout.id)}
              isDeleting={deleteMutation.isPending}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function WorkoutCard({ workout, onClick, onDelete, showDate }) {
  const exerciseCount = workout.exercises?.length || 0;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="bg-zinc-900/50 rounded-xl p-4 cursor-pointer hover:bg-zinc-900/70 transition-all relative group"
    >
      <div className="flex items-center justify-between" onClick={onClick}>
        <div className="flex-1">
          <h3 className="text-sm font-light text-white mb-1">{workout.name}</h3>
          <div className="flex items-center gap-3 text-xs text-white/30 font-light">
            {showDate && (
              <span>{format(new Date(workout.date), "d MMM", { locale: fr })}</span>
            )}
            <span>{exerciseCount} exos</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {workout.total_volume > 0 && (
            <div className="text-sm font-light text-white/50">
              {(workout.total_volume / 1000).toFixed(1)}T
            </div>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 text-white/20 hover:text-white/40 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(workout.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function WorkoutDetail({ workout, onDelete, isDeleting }) {
  return (
    <ScrollArea className="h-full pr-4">
      <SheetHeader className="mb-6">
        <div className="flex items-start justify-between">
          <SheetTitle className="text-xl font-light text-white">
            {workout.name}
          </SheetTitle>
          <Button
            size="sm"
            variant="ghost"
            className="text-white/30 hover:text-white/50"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {isDeleting ? "..." : "Supprimer"}
          </Button>
        </div>
        <div className="flex items-center gap-4 text-white/50">
          <span className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            {format(new Date(workout.date), "EEEE d MMMM yyyy", { locale: fr })}
          </span>
          {workout.duration_minutes > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {workout.duration_minutes} min
            </span>
          )}
        </div>
      </SheetHeader>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-violet-400">
            {workout.exercises?.length || 0}
          </div>
          <div className="text-xs text-white/50">Exercices</div>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-cyan-400">
            {workout.exercises?.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0) || 0}
          </div>
          <div className="text-xs text-white/50">Séries</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">
            {workout.total_volume?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-white/50">kg</div>
        </div>
      </div>

      <div className="space-y-4">
        {workout.exercises?.map((exercise, index) => (
          <div 
            key={index}
            className="bg-[#1a1a24] border border-white/5 rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <MuscleIcon muscle={exercise.muscle_group} size="sm" />
              <h3 className="font-semibold text-white">{exercise.exercise_name}</h3>
            </div>

            <div className="space-y-2">
              {exercise.sets?.map((set, setIndex) => (
                <div 
                  key={setIndex}
                  className="flex items-center justify-between text-sm bg-white/5 rounded-lg px-3 py-2"
                >
                  <span className="text-white/50">Série {setIndex + 1}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-white">
                      <span className="font-semibold">{set.weight}</span>
                      <span className="text-white/50 text-xs ml-1">kg</span>
                    </span>
                    <span className="text-white/30">×</span>
                    <span className="text-white">
                      <span className="font-semibold">{set.reps}</span>
                      <span className="text-white/50 text-xs ml-1">reps</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {workout.notes && (
        <div className="mt-6 bg-white/5 rounded-xl p-4">
          <h4 className="text-sm font-medium text-white/50 mb-2">Notes</h4>
          <p className="text-white">{workout.notes}</p>
        </div>
      )}
    </ScrollArea>
  );
}