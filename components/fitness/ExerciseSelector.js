import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import MuscleIcon from "./MuscleIcon";

const muscleGroups = [
  { id: "all", label: "Tous" },
  { id: "pectoraux", label: "Pecs" },
  { id: "dos", label: "Dos" },
  { id: "jambes", label: "Jambes" },
  { id: "epaules", label: "Épaules" },
  { id: "biceps", label: "Biceps" },
  { id: "triceps", label: "Triceps" },
  { id: "abdominaux", label: "Abdos" },
  { id: "mollets", label: "Mollets" },
  { id: "avant-bras", label: "Avant-bras" }
];

export default function ExerciseSelector({ 
  exercises, 
  isOpen, 
  onClose, 
  onSelect 
}) {
  const [search, setSearch] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("all");
  const scrollRef = useRef(null);

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = selectedMuscle === "all" || ex.muscle_group === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const groupedExercises = filteredExercises.reduce((acc, ex) => {
    const group = ex.muscle_group;
    if (!acc[group]) acc[group] = [];
    acc[group].push(ex);
    return acc;
  }, {});

  const handleSelect = (exercise) => {
    onSelect(exercise);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-white/5 text-white max-w-lg max-h-[90vh] p-0">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-lg font-light">Ajouter un exercice</DialogTitle>
        </DialogHeader>

        <div className="px-5 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-white/5 text-white placeholder:text-white/30 font-light"
            />
          </div>
        </div>

        {/* Horizontal scroll muscle filter */}
        <div className="px-5 py-3 overflow-hidden">
          <div 
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {muscleGroups.map((muscle) => (
              <button
                key={muscle.id}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-full text-xs font-light transition-all whitespace-nowrap",
                  selectedMuscle === muscle.id
                    ? "bg-white text-black"
                    : "bg-zinc-900 text-white/50 hover:text-white/70"
                )}
                onClick={() => setSelectedMuscle(muscle.id)}
              >
                {muscle.label}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 px-5 pb-5" style={{ maxHeight: "50vh" }}>
          <div className="space-y-6">
            {Object.entries(groupedExercises).map(([group, exs]) => (
              <div key={group}>
                <h3 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">
                  {group.replace("-", " ")}
                </h3>
                <div className="space-y-1">
                  {exs.map((exercise) => (
                    <motion.button
                      key={exercise.id}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-900/50 transition-all text-left group"
                      onClick={() => handleSelect(exercise)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-light text-white truncate">
                          {exercise.name}
                        </div>
                        {exercise.equipment && (
                          <div className="text-xs text-white/30 font-light truncate">
                            {exercise.equipment}
                          </div>
                        )}
                      </div>
                      <Plus className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}

            {filteredExercises.length === 0 && (
              <div className="text-center py-12 text-white/30 text-sm font-light">
                Aucun exercice trouvé
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}