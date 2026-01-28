import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Settings as SettingsIcon,
  Download,
  FileText,
  Eye,
  Trash2,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [focusMode, setFocusMode] = useState(false);
  const [wakeLock, setWakeLock] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => base44.entities.Workout.list("-date", 500)
  });

  // Personal Records for PDF export
  const personalRecords = workouts.reduce((records, w) => {
    w.exercises?.forEach(ex => {
      const maxWeight = Math.max(...(ex.sets?.map(s => s.weight || 0) || [0]));
      if (maxWeight > 0) {
        const key = ex.exercise_id || ex.exercise_name;
        if (!records[key] || maxWeight > records[key].maxWeight) {
          records[key] = {
            exerciseName: ex.exercise_name,
            maxWeight,
            date: w.date
          };
        }
      }
    });
    return records;
  }, {});

  const sortedRecords = Object.values(personalRecords).sort((a, b) => b.maxWeight - a.maxWeight);

  // Wake Lock for Focus Mode
  useEffect(() => {
    const enableWakeLock = async () => {
      if (focusMode && 'wakeLock' in navigator) {
        try {
          const lock = await navigator.wakeLock.request('screen');
          setWakeLock(lock);
          toast.success("Mode Focus activé");
        } catch (err) {
          console.log('Wake Lock error:', err);
        }
      } else if (!focusMode && wakeLock) {
        await wakeLock.release();
        setWakeLock(null);
        toast.success("Mode Focus désactivé");
      }
    };
    enableWakeLock();
    
    return () => {
      if (wakeLock) wakeLock.release();
    };
  }, [focusMode]);

  const handleExport = (format) => {
    const data = workouts.map(w => ({
      date: w.date,
      name: w.name,
      total_volume: w.total_volume,
      exercises: w.exercises?.map(ex => ({
        exercise_name: ex.exercise_name,
        sets: ex.sets
      }))
    }));

    let content, filename, type;
    
    if (format === "json") {
      content = JSON.stringify(data, null, 2);
      filename = `workout_export_${new Date().toISOString().split("T")[0]}.json`;
      type = "application/json";
    } else {
      const rows = [["Date", "Séance", "Exercice", "Série", "Poids", "Reps", "Volume"]];
      workouts.forEach(w => {
        w.exercises?.forEach(ex => {
          ex.sets?.forEach((set, i) => {
            rows.push([
              w.date,
              w.name,
              ex.exercise_name,
              i + 1,
              set.weight || 0,
              set.reps || 0,
              (set.weight || 0) * (set.reps || 0)
            ]);
          });
        });
      });
      content = rows.map(row => row.join(",")).join("\n");
      filename = `workout_export_${new Date().toISOString().split("T")[0]}.csv`;
      type = "text/csv";
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Export ${format.toUpperCase()} téléchargé`);
  };

  const handleExportPDF = () => {
    // Create a simple HTML-based PDF export
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Mes Records Personnels</title>
        <style>
          body { font-family: -apple-system, sans-serif; padding: 40px; background: #000; color: #fff; }
          h1 { font-size: 24px; font-weight: 300; margin-bottom: 30px; }
          .record { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #222; }
          .rank { color: #666; width: 30px; }
          .name { flex: 1; }
          .weight { font-weight: 500; }
          .date { color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>🏆 Mes Records Personnels</h1>
        ${sortedRecords.slice(0, 20).map((r, i) => `
          <div class="record">
            <span class="rank">#${i + 1}</span>
            <span class="name">${r.exerciseName}</span>
            <span class="weight">${r.maxWeight} kg</span>
          </div>
        `).join('')}
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          Généré le ${new Date().toLocaleDateString('fr-FR')}
        </p>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `records_${new Date().toISOString().split("T")[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Récapitulatif exporté");
  };

  const handleClearCache = () => {
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
    toast.success("Cache vidé - Rechargement...");
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="px-5 pt-8">
        <h1 className="text-2xl font-light tracking-tight text-white mb-8">Réglages</h1>

        <div className="space-y-3">
          {/* Focus Mode */}
          <div className="flex items-center justify-between p-5 bg-zinc-900/50 rounded-xl">
            <div className="flex items-center gap-4">
              <Eye className="w-5 h-5 text-white/40" />
              <div>
                <div className="text-sm font-light text-white">Mode Focus</div>
                <div className="text-xs text-white/30 font-light">Empêche l'écran de s'éteindre</div>
              </div>
            </div>
            <Switch
              checked={focusMode}
              onCheckedChange={setFocusMode}
            />
          </div>

          {/* Export Data */}
          <div className="p-5 bg-zinc-900/50 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <Download className="w-5 h-5 text-white/40" />
              <div>
                <div className="text-sm font-light text-white">Exporter les données</div>
                <div className="text-xs text-white/30 font-light">{workouts.length} séances</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-white/10 text-white/60 hover:text-white bg-transparent font-light"
                onClick={() => handleExport("csv")}
              >
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-white/10 text-white/60 hover:text-white bg-transparent font-light"
                onClick={() => handleExport("json")}
              >
                JSON
              </Button>
            </div>
          </div>

          {/* Export PDF Records */}
          <div 
            className="flex items-center justify-between p-5 bg-zinc-900/50 rounded-xl cursor-pointer hover:bg-zinc-900/70 transition-colors"
            onClick={handleExportPDF}
          >
            <div className="flex items-center gap-4">
              <FileText className="w-5 h-5 text-white/40" />
              <div>
                <div className="text-sm font-light text-white">Exporter mes records</div>
                <div className="text-xs text-white/30 font-light">Récapitulatif à partager</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-white/20" />
          </div>

          {/* Clear Cache */}
          <div 
            className="flex items-center justify-between p-5 bg-zinc-900/50 rounded-xl cursor-pointer hover:bg-zinc-900/70 transition-colors"
            onClick={handleClearCache}
          >
            <div className="flex items-center gap-4">
              <Trash2 className="w-5 h-5 text-white/40" />
              <div>
                <div className="text-sm font-light text-white">Vider le cache</div>
                <div className="text-xs text-white/30 font-light">Réinitialiser l'affichage</div>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="mt-12 text-center">
          <p className="text-xs text-white/20 font-light">
            Fitness Tracker v1.0
          </p>
        </div>
      </div>
    </div>
  );
}