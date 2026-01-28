import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, 
  Plus, 
  Filter,
  X,
  Check,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import MuscleIcon, { muscleColors, muscleBgColors } from "@/components/fitness/MuscleIcon";

const muscleGroups = [
  { id: "pectoraux", label: "Pectoraux" },
  { id: "dos", label: "Dos" },
  { id: "jambes", label: "Jambes" },
  { id: "epaules", label: "Épaules" },
  { id: "biceps", label: "Biceps" },
  { id: "triceps", label: "Triceps" },
  { id: "abdominaux", label: "Abdominaux" },
  { id: "mollets", label: "Mollets" },
  { id: "avant-bras", label: "Avant-bras" },
  { id: "cardio", label: "Cardio" }
];

export default function ExercisesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterMuscle, setFilterMuscle] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: "",
    muscle_group: "",
    equipment: "",
    description: ""
  });

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => base44.entities.Exercise.list("name")
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Exercise.create({ ...data, is_custom: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      setShowAddModal(false);
      setNewExercise({ name: "", muscle_group: "", equipment: "", description: "" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Exercise.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    }
  });

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = filterMuscle === "all" || ex.muscle_group === filterMuscle;
    return matchesSearch && matchesMuscle;
  });

  const groupedExercises = filteredExercises.reduce((acc, ex) => {
    const group = ex.muscle_group || "autre";
    if (!acc[group]) acc[group] = [];
    acc[group].push(ex);
    return acc;
  }, {});

  const handleCreateExercise = () => {
    if (newExercise.name && newExercise.muscle_group) {
      createMutation.mutate(newExercise);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-light tracking-wide text-white">Exercices</h1>
          <Button
            size="sm"
            className="bg-white text-black hover:bg-white/90"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Rechercher un exercice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          <ScrollArea className="w-full" style={{ maxHeight: "48px" }}>
            <div className="flex gap-2 pb-2">
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  "flex-shrink-0 h-8 px-3 rounded-full text-xs font-light",
                  filterMuscle === "all"
                    ? "bg-white text-black"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                )}
                onClick={() => setFilterMuscle("all")}
              >
                Tous
              </Button>
              {muscleGroups.map((muscle) => (
                <Button
                  key={muscle.id}
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "flex-shrink-0 h-8 px-3 rounded-full text-xs font-light",
                    filterMuscle === muscle.id
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/50 hover:bg-white/10"
                  )}
                  onClick={() => setFilterMuscle(muscle.id)}
                >
                  {muscle.label}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Exercise List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-zinc-900/50 rounded h-16 animate-pulse" />
            ))}
          </div>
        ) : Object.keys(groupedExercises).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedExercises).map(([group, exs]) => (
              <div key={group}>
                <h2 className={cn(
                  "text-sm font-semibold uppercase tracking-wider mb-3",
                  muscleColors[group] || "text-white/40"
                )}>
                  {group.replace("-", " ")} ({exs.length})
                </h2>
                <div className="space-y-2">
                  <AnimatePresence>
                    {exs.map((exercise, index) => (
                      <motion.div
                        key={exercise.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="bg-zinc-900/30 border-0 p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <MuscleIcon muscle={exercise.muscle_group} size="sm" />
                              <div>
                                <h3 className="font-medium text-white">
                                  {exercise.name}
                                </h3>
                                {exercise.equipment && (
                                  <p className="text-xs text-white/40">
                                    {exercise.equipment}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {exercise.is_custom && (
                                <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">
                                  Perso
                                </span>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-white/30 hover:text-red-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMutation.mutate(exercise.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="bg-zinc-900/30 border-0 p-8 text-center">
            <Search className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">Aucun exercice trouvé</p>
          </Card>
        )}
      </div>

      {/* Add Exercise Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-black border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Nouvel exercice</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom de l'exercice</Label>
              <Input
                placeholder="ex: Curl marteau"
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label>Groupe musculaire</Label>
              <Select
                value={newExercise.muscle_group}
                onValueChange={(value) => setNewExercise({ ...newExercise, muscle_group: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {muscleGroups.map((muscle) => (
                    <SelectItem key={muscle.id} value={muscle.id}>
                      {muscle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Équipement (optionnel)</Label>
              <Input
                placeholder="ex: Haltères, Barre, Machine..."
                value={newExercise.equipment}
                onChange={(e) => setNewExercise({ ...newExercise, equipment: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label>Description (optionnel)</Label>
              <Input
                placeholder="Notes sur l'exécution..."
                value={newExercise.description}
                onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowAddModal(false)}
              className="text-white/60"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateExercise}
              disabled={!newExercise.name || !newExercise.muscle_group || createMutation.isPending}
              className="bg-white text-black hover:bg-white/90"
            >
              <Check className="w-4 h-4 mr-1" />
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}