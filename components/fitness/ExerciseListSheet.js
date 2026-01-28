import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ChevronUp, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const muscleColors = {
  pectoraux: "from-rose-500/20 to-rose-600/10 border-rose-500/20",
  dos: "from-blue-500/20 to-blue-600/10 border-blue-500/20",
  jambes: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20",
  epaules: "from-amber-500/20 to-amber-600/10 border-amber-500/20",
  biceps: "from-violet-500/20 to-violet-600/10 border-violet-500/20",
  triceps: "from-purple-500/20 to-purple-600/10 border-purple-500/20",
  abdominaux: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/20",
  mollets: "from-teal-500/20 to-teal-600/10 border-teal-500/20",
  "avant-bras": "from-orange-500/20 to-orange-600/10 border-orange-500/20",
  cardio: "from-red-500/20 to-red-600/10 border-red-500/20"
};

export default function ExerciseListSheet({
  isOpen,
  onClose,
  exercises,
  onUpdateExercise,
  onRemoveExercise
}) {
  const handleUpdateSets = (index, value) => {
    const newVal = Math.max(1, parseInt(value) || 1);
    onUpdateExercise(index, "target_sets", newVal);
  };

  const handleUpdateReps = (index, value) => {
    const newVal = Math.max(1, parseInt(value) || 1);
    onUpdateExercise(index, "target_reps", newVal);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="bg-black border-white/5 text-white h-[85vh] rounded-t-3xl p-0"
      >
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-light text-white">
              Exercices ({exercises.length})
            </SheetTitle>
            <div className="w-12 h-1 bg-white/20 rounded-full absolute top-3 left-1/2 -translate-x-1/2" />
          </div>
        </div>
        
        <ScrollArea className="h-[calc(85vh-80px)]">
          <div className="p-5 space-y-3">
            <AnimatePresence mode="popLayout">
              {exercises.map((exercise, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(
                    "p-4 rounded-2xl bg-gradient-to-br border",
                    muscleColors[exercise.muscle_group] || "from-zinc-800/50 to-zinc-900/50 border-white/5"
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-light text-white text-base">
                        {exercise.exercise_name}
                      </h3>
                      <p className="text-xs text-white/40 capitalize mt-0.5">
                        {exercise.muscle_group?.replace("-", " ")}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white/30 hover:text-red-400 hover:bg-red-500/10 -mr-2 -mt-1"
                      onClick={() => onRemoveExercise(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-4">
                    {/* Sets */}
                    <div className="flex-1">
                      <label className="text-[10px] text-white/40 font-light block mb-2">SÉRIES</label>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 bg-white/5 hover:bg-white/10 text-white/60"
                          onClick={() => handleUpdateSets(index, exercise.target_sets - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Input
                          type="number"
                          value={exercise.target_sets}
                          onChange={(e) => handleUpdateSets(index, e.target.value)}
                          className="h-10 bg-white/5 border-0 text-white text-center text-lg font-light w-14"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 bg-white/5 hover:bg-white/10 text-white/60"
                          onClick={() => handleUpdateSets(index, exercise.target_sets + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Reps */}
                    <div className="flex-1">
                      <label className="text-[10px] text-white/40 font-light block mb-2">REPS</label>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 bg-white/5 hover:bg-white/10 text-white/60"
                          onClick={() => handleUpdateReps(index, exercise.target_reps - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Input
                          type="number"
                          value={exercise.target_reps}
                          onChange={(e) => handleUpdateReps(index, e.target.value)}
                          className="h-10 bg-white/5 border-0 text-white text-center text-lg font-light w-14"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 bg-white/5 hover:bg-white/10 text-white/60"
                          onClick={() => handleUpdateReps(index, exercise.target_reps + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {exercises.length === 0 && (
              <div className="text-center py-16 text-white/20 text-sm font-light">
                Aucun exercice ajouté
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}