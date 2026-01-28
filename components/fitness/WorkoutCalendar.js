import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { fr } from "date-fns/locale";

export default function WorkoutCalendar({ workouts, onSelectDate, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = monthStart.getDay();
  const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const workoutDates = workouts.reduce((acc, w) => {
    const dateStr = format(new Date(w.date), "yyyy-MM-dd");
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(w);
    return acc;
  }, {});

  const weekDays = ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <div className="bg-[#1a1a24] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-semibold text-white capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: fr })}
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-white/40"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: paddingDays }).map((_, i) => (
          <div key={`padding-${i}`} className="h-10" />
        ))}
        
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayWorkouts = workoutDates[dateStr] || [];
          const hasWorkout = dayWorkouts.length > 0;
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);

          return (
            <motion.button
              key={dateStr}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "h-10 rounded-lg flex flex-col items-center justify-center relative transition-all",
                isSelected
                  ? "bg-violet-500 text-white"
                  : hasWorkout
                    ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                    : "text-white/60 hover:bg-white/10",
                isCurrentDay && !isSelected && "ring-1 ring-violet-500/50"
              )}
              onClick={() => onSelectDate(day)}
            >
              <span className="text-sm font-medium">
                {format(day, "d")}
              </span>
              {hasWorkout && (
                <div className="absolute bottom-1 flex gap-0.5">
                  {dayWorkouts.slice(0, 3).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1 h-1 rounded-full",
                        isSelected ? "bg-white" : "bg-emerald-400"
                      )}
                    />
                  ))}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/40">Séances ce mois</span>
          <span className="font-semibold text-white">
            {Object.keys(workoutDates).filter(d => {
              const date = new Date(d);
              return isSameMonth(date, currentMonth);
            }).length}
          </span>
        </div>
      </div>
    </div>
  );
}