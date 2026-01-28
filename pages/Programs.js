import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Dumbbell,
  Clock,
  ChevronRight,
  X,
  Check,
  GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import MuscleIcon from "@/components/fitness/MuscleIcon";
import ExerciseSelector from "@/components/fitness/ExerciseSelector";
import ExerciseListSheet from "@/components/fitness/ExerciseListSheet";



export default function ProgramsPage() {
  const queryClient = useQueryClient();
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showExerciseList, setShowExerciseList] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "orange",
    exercises: [],
    estimated_duration: 60
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.WorkoutTemplate.list()
  });

  const { data: exerciseList = [] } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => base44.entities.Exercise.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.WorkoutTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      handleCloseEditor();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WorkoutTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      handleCloseEditor();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WorkoutTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    }
  });

  const handleOpenEditor = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || "",
        color: template.color || "orange",
        exercises: template.exercises || [],
        estimated_duration: template.estimated_duration || 60
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: "",
        description: "",
        color: "orange",
        exercises: [],
        estimated_duration: 60
      });
    }
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingTemplate(null);
  };

  const handleAddExercise = (exercise) => {
    setFormData({
      ...formData,
      exercises: [
        ...formData.exercises,
        {
          exercise_id: exercise.id,
          exercise_name: exercise.name,
          muscle_group: exercise.muscle_group,
          equipment: exercise.equipment,
          target_sets: 3,
          target_reps: 10
        }
      ]
    });
  };

  const handleUpdateExercise = (index, field, value) => {
    const newExercises = [...formData.exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setFormData({ ...formData, exercises: newExercises });
  };

  const handleRemoveExercise = (index) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;
    
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="px-5 pt-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-light tracking-tight text-white">Programmes</h1>
          <Button
            onClick={() => handleOpenEditor()}
            className="bg-white hover:bg-white/90 text-black font-light"
          >
            <Plus className="w-4 h-4 mr-1" />
            Créer
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#14141f] rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : templates.length > 0 ? (
          <div className="space-y-2">
            {templates.map((template) => (
              <div 
                key={template.id}
                className="bg-zinc-900/50 rounded-xl p-4 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-light text-white mb-1">{template.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-white/30 font-light">
                      <span>{template.exercises?.length || 0} exercices</span>
                      {template.estimated_duration && (
                        <span>~{template.estimated_duration} min</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white/30 hover:text-white/60"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditor(template);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white/30 hover:text-white/60"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(template.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {template.exercises?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="text-xs text-white/30 font-light">
                      {template.exercises.slice(0, 3).map(ex => ex.exercise_name).join(" · ")}
                      {template.exercises.length > 3 && ` +${template.exercises.length - 3}`}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900/30 rounded-xl p-8 text-center">
            <p className="text-white/30 text-sm font-light mb-4">Aucun programme</p>
            <Button
              onClick={() => handleOpenEditor()}
              variant="outline"
              className="border-white/10 text-white/50 hover:text-white bg-transparent font-light"
            >
              <Plus className="w-4 h-4 mr-1" />
              Créer
            </Button>
          </div>
        )}
      </div>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="bg-black border-white/5 text-white max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-light">
              {editingTemplate ? "Modifier" : "Nouveau programme"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 pb-4">
              <div className="space-y-2">
                <Label className="text-xs text-white/40 font-light">Nom</Label>
                <Input
                  placeholder="Push A, Jambes..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-zinc-900 border-0 text-white font-light"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-white/40 font-light">Durée estimée (min)</Label>
                <Input
                  type="number"
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) || 60 })}
                  className="bg-zinc-900 border-0 text-white w-24 font-light"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-white/40 font-light">Exercices</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white/40 hover:text-white/60 text-xs font-light"
                    onClick={() => setShowExerciseSelector(true)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Ajouter
                  </Button>
                </div>

                {/* Compact exercise preview */}
                {formData.exercises.length > 0 ? (
                  <div 
                    className="bg-zinc-900/50 rounded-xl p-4 cursor-pointer hover:bg-zinc-900/70 transition-all"
                    onClick={() => setShowExerciseList(true)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-white font-light">
                        {formData.exercises.length} exercice{formData.exercises.length > 1 ? "s" : ""}
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </div>
                    <div className="text-xs text-white/40 font-light">
                      {formData.exercises.slice(0, 3).map(ex => ex.exercise_name).join(" · ")}
                      {formData.exercises.length > 3 && ` +${formData.exercises.length - 3}`}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/20 text-sm font-light">
                    Aucun exercice
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="border-t border-white/5 pt-4">
            <Button
              variant="ghost"
              onClick={handleCloseEditor}
              className="text-white/40 font-light"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name.trim() || createMutation.isPending || updateMutation.isPending}
              className="bg-white hover:bg-white/90 text-black font-light"
            >
              {editingTemplate ? "Sauvegarder" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExerciseSelector
        exercises={exerciseList}
        isOpen={showExerciseSelector}
        onClose={() => setShowExerciseSelector(false)}
        onSelect={handleAddExercise}
      />

      <ExerciseListSheet
        isOpen={showExerciseList}
        onClose={() => setShowExerciseList(false)}
        exercises={formData.exercises}
        onUpdateExercise={handleUpdateExercise}
        onRemoveExercise={handleRemoveExercise}
      />
    </div>
  );
}