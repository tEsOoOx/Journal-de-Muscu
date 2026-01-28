import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, startOfWeek, endOfWeek, isWithinInterval, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Play,
  Calendar,
  Dumbbell,
  Flame,
  Clock,
  Target,
  Plus,
  Zap,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { cn } from "@/lib/utils";



const periodOptions = [
  { value: "7", label: "7 derniers jours" },
  { value: "15", label: "15 derniers jours" },
  { value: "30", label: "30 derniers jours" },
  { value: "60", label: "2 derniers mois" }
];

export default function HomePage() {
  const navigate = useNavigate();
  const [statsPeriod, setStatsPeriod] = useState("30");

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.WorkoutTemplate.list()
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => base44.entities.Workout.list("-date", 200)
  });

  const { data: userSettings } = useQuery({
    queryKey: ["userSettings"],
    queryFn: async () => {
      const results = await base44.entities.UserSettings.filter({ created_by: user?.email });
      return results[0] || null;
    },
    enabled: !!user
  });

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  const workoutsThisWeek = workouts.filter(w => 
    isWithinInterval(new Date(w.date), { start: weekStart, end: weekEnd })
  );

  const periodDays = parseInt(statsPeriod);
  const filteredWorkouts = workouts.filter(w => 
    new Date(w.date) >= subDays(now, periodDays)
  );

  const totalVolumePeriod = filteredWorkouts.reduce((acc, w) => acc + (w.total_volume || 0), 0);


  const weekDays = ["L", "M", "M", "J", "V", "S", "D"];
  const today = now.getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;

  const greeting = () => {
    const hour = now.getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const handleStartWorkout = (template) => {
    navigate(createPageUrl("Workout") + `?templateId=${template.id}`);
  };

  const handleQuickStart = () => {
    navigate(createPageUrl("Workout"));
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-white/30 text-sm font-light mb-1">{greeting()}</p>
          <h1 className="text-2xl font-light text-white">
            {user?.full_name?.split(" ")[0] || "Athlète"}
          </h1>
        </motion.div>
      </div>

      <div className="px-5">
        {/* Week Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex justify-between gap-2">
            {weekDays.map((day, index) => {
              const hasWorkout = workoutsThisWeek.some(w => {
                const workoutDay = new Date(w.date).getDay();
                const adjustedWorkoutDay = workoutDay === 0 ? 6 : workoutDay - 1;
                return adjustedWorkoutDay === index;
              });
              const isToday = index === adjustedToday;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-light",
                    isToday ? "text-white" : "text-white/30"
                  )}>
                    {day}
                  </span>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    hasWorkout 
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-600" 
                      : isToday
                        ? "ring-1 ring-violet-400/50 bg-violet-500/10"
                        : "bg-zinc-900"
                  )}>
                    {hasWorkout && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Button
            onClick={handleQuickStart}
            className="w-full h-14 bg-white hover:bg-white/90 text-black font-light text-base"
          >
            <Zap className="w-4 h-4 mr-2" />
            Séance libre
          </Button>
        </motion.div>

        {/* Templates Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">
              Programmes
            </h3>
            <Link to={createPageUrl("Programs")}>
              <Button variant="ghost" size="sm" className="text-white/30 hover:text-white/50 text-xs font-light">
                Voir tout
              </Button>
            </Link>
          </div>

          {templates.length > 0 ? (
            <div className="space-y-2">
              {templates.map((template, index) => {
                // Get color based on first exercise muscle group
                const firstMuscle = template.exercises?.[0]?.muscle_group;
                const colorMap = {
                  pectoraux: "from-rose-500/10 to-transparent border-rose-500/20",
                  dos: "from-blue-500/10 to-transparent border-blue-500/20",
                  jambes: "from-emerald-500/10 to-transparent border-emerald-500/20",
                  epaules: "from-amber-500/10 to-transparent border-amber-500/20",
                  biceps: "from-violet-500/10 to-transparent border-violet-500/20",
                  triceps: "from-purple-500/10 to-transparent border-purple-500/20"
                };
                const gradientClass = colorMap[firstMuscle] || "from-zinc-800/50 to-transparent border-white/5";
                
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.03 }}
                    className={cn(
                      "p-4 rounded-xl cursor-pointer hover:scale-[1.02] transition-all bg-gradient-to-r border",
                      gradientClass
                    )}
                    onClick={() => handleStartWorkout(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-light text-white mb-1">
                          {template.name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-white/40 font-light">
                          <span>{template.exercises?.length || 0} exercices</span>
                          {template.estimated_duration && (
                            <span>~{template.estimated_duration} min</span>
                          )}
                        </div>
                      </div>
                      <Play className="w-4 h-4 text-white/30" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 bg-zinc-900/30 rounded-xl text-center">
              <p className="text-white/30 text-sm font-light mb-4">Aucun programme</p>
              <Link to={createPageUrl("Programs")}>
                <Button size="sm" variant="outline" className="border-white/10 text-white/50 hover:text-white bg-transparent font-light">
                  <Plus className="w-4 h-4 mr-1" />
                  Créer
                </Button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Stats Grid with Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">Stats</h3>
            <Select value={statsPeriod} onValueChange={setStatsPeriod}>
              <SelectTrigger className="w-32 h-8 bg-transparent border-white/10 text-white/50 text-xs font-light">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {periodOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs text-white/70">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl">
              <div className="text-2xl font-light text-white">
                {(totalVolumePeriod / 1000).toFixed(1)}<span className="text-sm text-amber-400/60 ml-1">T</span>
              </div>
              <div className="text-xs text-white/40 font-light mt-1">Volume</div>
            </div>

            <div className="p-4 bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20 rounded-xl">
              <div className="text-2xl font-light text-white">
                {filteredWorkouts.length}
              </div>
              <div className="text-xs text-white/40 font-light mt-1">Séances</div>
            </div>
          </div>
        </motion.div>

        {/* Recent Workouts */}
        {workouts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">Récent</h3>
              <Link to={createPageUrl("History")}>
                <Button variant="ghost" size="sm" className="text-white/30 hover:text-white/50 text-xs font-light">
                  Voir tout
                </Button>
              </Link>
            </div>

            <div className="space-y-2">
              {workouts.slice(0, 3).map((workout) => (
                <div key={workout.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <h4 className="text-sm font-light text-white">{workout.name}</h4>
                    <div className="text-xs text-white/30 font-light">
                      {format(new Date(workout.date), "d MMMM", { locale: fr })}
                    </div>
                  </div>
                  {workout.total_volume > 0 && (
                    <div className="text-sm font-light text-white/50">
                      {(workout.total_volume / 1000).toFixed(1)}T
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}