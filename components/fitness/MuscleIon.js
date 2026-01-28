import { 
  Dumbbell, 
  Activity, 
  Target, 
  Zap,
  Heart,
  CircleDot,
  Footprints,
  Hand,
  Grip
} from "lucide-react";

const muscleIcons = {
  pectoraux: Dumbbell,
  dos: Activity,
  jambes: Footprints,
  epaules: Target,
  biceps: Zap,
  triceps: Zap,
  abdominaux: CircleDot,
  mollets: Footprints,
  "avant-bras": Grip,
  cardio: Heart
};

const muscleColors = {
  pectoraux: "text-rose-400",
  dos: "text-blue-400",
  jambes: "text-emerald-400",
  epaules: "text-amber-400",
  biceps: "text-violet-400",
  triceps: "text-purple-400",
  abdominaux: "text-cyan-400",
  mollets: "text-teal-400",
  "avant-bras": "text-orange-400",
  cardio: "text-red-400"
};

const muscleBgColors = {
  pectoraux: "bg-rose-400/20",
  dos: "bg-blue-400/20",
  jambes: "bg-emerald-400/20",
  epaules: "bg-amber-400/20",
  biceps: "bg-violet-400/20",
  triceps: "bg-purple-400/20",
  abdominaux: "bg-cyan-400/20",
  mollets: "bg-teal-400/20",
  "avant-bras": "bg-orange-400/20",
  cardio: "bg-red-400/20"
};

export default function MuscleIcon({ muscle, size = "md", showBg = true }) {
  const Icon = muscleIcons[muscle] || Dumbbell;
  const colorClass = muscleColors[muscle] || "text-gray-400";
  const bgClass = muscleBgColors[muscle] || "bg-gray-400/20";
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };
  
  const containerSizes = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5"
  };
  
  if (showBg) {
    return (
      <div className={`${bgClass} ${containerSizes[size]} rounded-lg`}>
        <Icon className={`${sizeClasses[size]} ${colorClass}`} />
      </div>
    );
  }
  
  return <Icon className={`${sizeClasses[size]} ${colorClass}`} />;
}

export { muscleColors, muscleBgColors };