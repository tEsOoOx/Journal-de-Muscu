import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MuscleIcon from "./MuscleIcon";
import SetRow from "./SetRow";

const muscleGradients = {
  pectoraux: "from-rose-500/10 to-transparent border-rose-500/20",
  dos: "from-blue-500/10 to-transparent border-blue-500/20",
  jambes: "from-emerald-500/10 to-transparent border-emerald-500/20",
  epaules: "from-amber-500/10 to-transparent border-amber-500/20",
  biceps: "from-violet-500/10 to-transparent border-violet-500/20",
  triceps: "from-purple-500/10 to-transparent border-purple-500/20",
  abdominaux: "from-cyan-500/10 to-transparent border-cyan-500/20",
  mollets: "from-teal-500/10 to-transparent border-teal-500/20",
  "avant-bras": "from-orange-500/10 to-transparent border-orange-500/20",
  cardio: "from-red-500/10 to-transparent border-red-500/20"
};

export default function ExerciseCard({
  exercise,
  exerciseData,
  onUpdateSets,
  onRemove,
  isExpanded,
  onToggleExpand
}) {
  const sets = exerciseData?.sets || [];
  const completedSets = sets.filter(s => s.completed).length;
  const totalVolume = sets.reduce((acc, s) => acc + (s.weight || 0) * (s.reps || 0), 0);

  const handleAddSet = () => {
    const lastSet = sets[sets.length - 1];
    const newSet = {
      weight: lastSet?.weight || 0,
      reps: lastSet?.reps || 0,
      rest_seconds: lastSet?.rest_seconds || 90,
      completed: false
    };
    onUpdateSets([...sets, newSet]);
  };

  const handleUpdateSet = (index, updatedSet) => {
    const newSets = [...sets];
    newSets[index] = updatedSet;
    onUpdateSets(newSets);
  };

  const handleCompleteSet = (index) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], completed: !newSets[index].completed };
    onUpdateSets(newSets);
  };

  const handleDeleteSet = (index) => {
    const newSets = sets.filter((_, i) => i !== index);
    onUpdateSets(newSets);
  };

  const gradientClass = muscleGradients[exercise?.muscle_group || exerciseData?.muscle_group] || "from-zinc-800/50 to-transparent border-white/5";

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden bg-gradient-to-br border",
      gradientClass
    )}>
      <div
        className={cn(
          "p-4 cursor-pointer transition-all",
          isExpanded && "border-b border-white/5"
        )}
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MuscleIcon muscle={exercise?.muscle_group} />
            <div>
              <h3 className="font-semibold text-white">
                {exercise?.name || exerciseData?.exercise_name}
              </h3>
              <p className="text-xs text-white/50 capitalize">
                {exercise?.muscle_group?.replace("-", " ")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right mr-2">
              <div className="text-sm font-medium text-white">
                {completedSets}/{sets.length}
              </div>
              <div className="text-xs text-white/40">séries</div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-white/40" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/40" />
            )}
          </div>
        </div>

        {!isExpanded && sets.length > 0 && (
          <div className="mt-3 flex gap-2">
            {sets.map((set, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all",
                  set.completed ? "bg-emerald-500" : "bg-white/10"
                )}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-[40px_1fr_1fr_40px_40px] gap-2 px-2 text-xs text-white/30 font-light">
                <span>SET</span>
                <span className="text-center">POIDS</span>
                <span className="text-center">REPS</span>
                <span></span>
                <span></span>
              </div>

              <AnimatePresence mode="popLayout">
                {sets.map((set, index) => (
                  <SetRow
                    key={index}
                    setNumber={index + 1}
                    set={set}
                    isActive={false}
                    onUpdate={(updated) => handleUpdateSet(index, updated)}
                    onComplete={() => handleCompleteSet(index)}
                    onDelete={() => handleDeleteSet(index)}
                  />
                ))}
              </AnimatePresence>

              <div className="flex items-center justify-between pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/40 hover:text-white/60 font-light"
                  onClick={handleAddSet}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Série
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/20 hover:text-red-400"
                  onClick={onRemove}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {totalVolume > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <div className="text-xs text-white/40">
                    Volume total: <span className="text-white font-medium">{totalVolume.toLocaleString()} kg</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}