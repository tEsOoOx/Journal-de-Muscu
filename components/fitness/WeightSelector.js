import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const defaultWeights = {
  dumbbell: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50],
  barbell: [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200],
  machine: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120],
  cable: [2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40, 42.5, 45, 47.5, 50, 55, 60, 65, 70, 75, 80],
  bodyweight: [0]
};

export function getEquipmentType(equipment) {
  if (!equipment) return "machine";
  const eq = equipment.toLowerCase();
  
  if (eq.includes("haltère") || eq.includes("kettlebell")) return "dumbbell";
  if (eq.includes("barre") && !eq.includes("poulie") && !eq.includes("traction")) return "barbell";
  if (eq.includes("poulie") || eq.includes("câble") || eq.includes("cable")) return "cable";
  if (eq.includes("poids du corps")) return "bodyweight";
  if (eq.includes("machine")) return "machine";
  
  return "machine";
}

export function getWeightsForEquipment(equipment, userSettings) {
  const type = getEquipmentType(equipment);
  
  if (type === "bodyweight") return [0];
  
  if (userSettings) {
    if (type === "dumbbell" && userSettings.dumbbell_weights?.length > 0) {
      return userSettings.dumbbell_weights.sort((a, b) => a - b);
    }
    if (type === "barbell" && userSettings.barbell_weights?.length > 0) {
      return userSettings.barbell_weights.sort((a, b) => a - b);
    }
    if (type === "machine" && userSettings.machine_weights?.length > 0) {
      return userSettings.machine_weights.sort((a, b) => a - b);
    }
    if (type === "cable" && userSettings.cable_weights?.length > 0) {
      return userSettings.cable_weights.sort((a, b) => a - b);
    }
  }
  
  return defaultWeights[type] || defaultWeights.machine;
}

export default function WeightSelector({ 
  value, 
  onChange, 
  equipment,
  userSettings,
  disabled 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const weights = getWeightsForEquipment(equipment, userSettings);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (weight) => {
    onChange(weight);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "h-9 w-full flex items-center justify-between gap-1 px-2 rounded-md text-sm",
          "bg-white/5 border border-white/10 text-white",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "hover:bg-white/10"
        )}
      >
        <span className={value ? "text-white" : "text-white/30"}>
          {value || value === 0 ? `${value}` : "-"}
        </span>
        <ChevronDown className={cn(
          "w-3 h-3 text-white/40 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[#1a1a24] border border-white/10 rounded-md shadow-xl overflow-hidden">
          <ScrollArea className="max-h-48">
            <div className="p-1">
              {weights.map((weight) => (
                <button
                  key={weight}
                  type="button"
                  onClick={() => handleSelect(weight)}
                  className={cn(
                    "w-full px-3 py-1.5 text-sm text-left rounded transition-colors",
                    value === weight 
                      ? "bg-violet-500 text-white" 
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {weight === 0 ? "PDC" : `${weight} kg`}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}