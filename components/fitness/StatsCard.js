import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function StatsCard({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  trend, 
  color = "violet",
  delay = 0 
}) {
  const colorClasses = {
    violet: {
      bg: "bg-violet-500/10",
      icon: "text-violet-400",
      border: "border-violet-500/20"
    },
    cyan: {
      bg: "bg-cyan-500/10",
      icon: "text-cyan-400",
      border: "border-cyan-500/20"
    },
    emerald: {
      bg: "bg-emerald-500/10",
      icon: "text-emerald-400",
      border: "border-emerald-500/20"
    },
    amber: {
      bg: "bg-amber-500/10",
      icon: "text-amber-400",
      border: "border-amber-500/20"
    }
  };

  const colors = colorClasses[color] || colorClasses.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "bg-[#1a1a24] border rounded-xl p-4",
        colors.border
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2 rounded-lg", colors.bg)}>
          <Icon className={cn("w-5 h-5", colors.icon)} />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            trend > 0 
              ? "bg-emerald-500/20 text-emerald-400" 
              : trend < 0 
                ? "bg-red-500/20 text-red-400"
                : "bg-white/10 text-white/40"
          )}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        {value}
        {unit && <span className="text-sm text-white/40 ml-1">{unit}</span>}
      </div>
      <div className="text-sm text-white/50">{label}</div>
    </motion.div>
  );
}