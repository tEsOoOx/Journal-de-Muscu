import React from "react";
import { motion } from "framer-motion";
import { Check, Trash2, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SetRow({ 
  setNumber, 
  set, 
  onUpdate, 
  onComplete, 
  onDelete,
  isActive
}) {
  const hasLastPerf = set.last_weight !== null || set.last_reps !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "rounded-xl transition-all",
        set.completed 
          ? "bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30" 
          : "bg-zinc-900/50"
      )}
    >
      {/* Last performance hint */}
      {hasLastPerf && !set.completed && (
        <div className="flex items-center gap-1 px-3 py-1.5 text-[10px] text-white/30 font-light">
          <TrendingUp className="w-3 h-3" />
          <span>Dernière: {set.last_weight}kg × {set.last_reps}</span>
        </div>
      )}
      
      <div className="grid grid-cols-[40px_1fr_1fr_40px_40px] gap-2 items-center p-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-light transition-all",
          set.completed 
            ? "bg-emerald-500 text-white"
            : "bg-zinc-800 text-white/50"
        )}>
          {setNumber}
        </div>

        <div>
          <Input
            type="number"
            placeholder="0"
            value={set.weight || ""}
            onChange={(e) => onUpdate({ ...set, weight: parseFloat(e.target.value) || 0 })}
            className="h-10 bg-zinc-900 border-0 text-white text-center placeholder:text-white/20 font-light"
            disabled={set.completed}
          />
          <span className="text-[10px] text-white/30 block text-center mt-1 font-light">kg</span>
        </div>

        <div>
          <Input
            type="number"
            placeholder="0"
            value={set.reps || ""}
            onChange={(e) => onUpdate({ ...set, reps: parseInt(e.target.value) || 0 })}
            className="h-10 bg-zinc-900 border-0 text-white text-center placeholder:text-white/20 font-light"
            disabled={set.completed}
          />
          <span className="text-[10px] text-white/30 block text-center mt-1 font-light">reps</span>
        </div>

        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "h-10 w-10 rounded-full transition-all",
            set.completed 
              ? "bg-emerald-500 text-white hover:bg-emerald-600" 
              : "bg-zinc-800 text-white/40 hover:bg-emerald-500 hover:text-white"
          )}
          onClick={onComplete}
        >
          <Check className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 text-white/20 hover:text-white/40"
          onClick={onDelete}
          disabled={set.completed}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}